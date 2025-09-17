#!/bin/bash

# Auto-commit and push script for file changes
# Maintains concurrency and coherence with atomic commits

# Configuration
WATCH_DIR="${1:-.}"
BRANCH="${2:-main}"
COMMIT_PREFIX="${3:-auto-commit}"
DEBOUNCE_SECONDS=2

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed${NC}"
    exit 1
fi

# Check if inotifywait is installed
if ! command -v inotifywait &> /dev/null; then
    echo -e "${YELLOW}Installing inotify-tools...${NC}"
    sudo apt-get update && sudo apt-get install -y inotify-tools
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not in a git repository${NC}"
    exit 1
fi

echo -e "${GREEN}Starting file watcher for auto-commits...${NC}"
echo "Watching: $WATCH_DIR"
echo "Branch: $BRANCH"
echo "Commit prefix: $COMMIT_PREFIX"
echo ""

# Function to commit and push changes
commit_and_push() {
    local file="$1"
    local event="$2"
    
    # Skip certain files and directories
    if [[ "$file" == *".git"* ]] || \
       [[ "$file" == *"node_modules"* ]] || \
       [[ "$file" == *".next"* ]] || \
       [[ "$file" == *"auto-commit"* ]] || \
       [[ "$file" == *.swp ]] || \
       [[ "$file" == *.tmp ]]; then
        return
    fi
    
    # Get relative path
    rel_path=$(realpath --relative-to="$(git rev-parse --show-toplevel)" "$file")
    
    # Check if file has changes
    if ! git diff --quiet "$rel_path" 2>/dev/null && \
       ! git diff --cached --quiet "$rel_path" 2>/dev/null; then
        
        echo -e "${YELLOW}Processing: $rel_path${NC}"
        
        # Stage the specific file
        git add "$rel_path"
        
        # Create commit message
        timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        
        if [[ "$event" == "DELETE" ]]; then
            commit_msg="$COMMIT_PREFIX: Deleted $rel_path at $timestamp"
        elif [[ "$event" == "CREATE" ]]; then
            commit_msg="$COMMIT_PREFIX: Created $rel_path at $timestamp"
        else
            commit_msg="$COMMIT_PREFIX: Modified $rel_path at $timestamp"
        fi
        
        # Commit with atomic operation
        if git commit -m "$commit_msg" --no-verify 2>/dev/null; then
            echo -e "${GREEN}✓ Committed: $rel_path${NC}"
            
            # Push to remote (with retry logic)
            attempts=0
            max_attempts=3
            
            while [ $attempts -lt $max_attempts ]; do
                if git push origin "$BRANCH" 2>/dev/null; then
                    echo -e "${GREEN}✓ Pushed to origin/$BRANCH${NC}"
                    break
                else
                    attempts=$((attempts + 1))
                    if [ $attempts -lt $max_attempts ]; then
                        echo -e "${YELLOW}Push failed, retrying in 2 seconds... (attempt $attempts/$max_attempts)${NC}"
                        sleep 2
                        # Pull any remote changes first
                        git pull --rebase origin "$BRANCH" 2>/dev/null
                    else
                        echo -e "${RED}✗ Push failed after $max_attempts attempts${NC}"
                    fi
                fi
            done
        fi
    elif git ls-files --others --exclude-standard | grep -q "^$rel_path$"; then
        # Handle new untracked files
        echo -e "${YELLOW}New file detected: $rel_path${NC}"
        git add "$rel_path"
        
        timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        commit_msg="$COMMIT_PREFIX: Added new file $rel_path at $timestamp"
        
        if git commit -m "$commit_msg" --no-verify 2>/dev/null; then
            echo -e "${GREEN}✓ Committed new file: $rel_path${NC}"
            git push origin "$BRANCH" 2>/dev/null && echo -e "${GREEN}✓ Pushed to origin/$BRANCH${NC}"
        fi
    fi
}

# File change buffer to handle rapid changes
declare -A change_buffer
declare -A last_change_time

process_buffer() {
    while true; do
        sleep $DEBOUNCE_SECONDS
        
        current_time=$(date +%s)
        
        for file in "${!change_buffer[@]}"; do
            last_time=${last_change_time[$file]}
            time_diff=$((current_time - last_time))
            
            if [ $time_diff -ge $DEBOUNCE_SECONDS ]; then
                commit_and_push "$file" "${change_buffer[$file]}"
                unset change_buffer[$file]
                unset last_change_time[$file]
            fi
        done
    done
}

# Start buffer processor in background
process_buffer &
BUFFER_PID=$!

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Stopping file watcher...${NC}"
    kill $BUFFER_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Watch for file changes
inotifywait -m -r -e modify,create,delete,move \
    --exclude '(\.git|node_modules|\.next|\.swp|\.tmp|auto-commit)' \
    "$WATCH_DIR" |
while read -r directory event file; do
    full_path="$directory$file"
    
    # Add to buffer with debouncing
    change_buffer[$full_path]=$event
    last_change_time[$full_path]=$(date +%s)
    
    echo -e "${YELLOW}● Detected $event: $file${NC}"
done