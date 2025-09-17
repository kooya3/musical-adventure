#!/bin/bash

# Advanced auto-commit daemon with configuration support
# Runs as a background service for continuous file monitoring

# Load configuration
CONFIG_FILE=".autocommit.config"
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
else
    echo "Warning: Config file not found. Using defaults."
fi

# Set defaults if not in config
AUTO_PUSH=${AUTO_PUSH:-true}
DEBOUNCE_SECONDS=${DEBOUNCE_SECONDS:-2}
MAX_PUSH_RETRIES=${MAX_PUSH_RETRIES:-3}
VERBOSE=${VERBOSE:-true}
ATOMIC_COMMITS=${ATOMIC_COMMITS:-true}
AUTO_PULL_BEFORE_PUSH=${AUTO_PULL_BEFORE_PUSH:-true}
REMOTE_NAME=${REMOTE_NAME:-origin}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# PID file for daemon management
PID_FILE=".autocommit.pid"

# Logging function
log() {
    if [ "$VERBOSE" = "true" ]; then
        echo -e "$1"
    fi
}

# Start daemon
start_daemon() {
    if [ -f "$PID_FILE" ]; then
        OLD_PID=$(cat "$PID_FILE")
        if ps -p "$OLD_PID" > /dev/null 2>&1; then
            echo -e "${YELLOW}Auto-commit daemon is already running (PID: $OLD_PID)${NC}"
            exit 1
        fi
    fi
    
    echo -e "${GREEN}Starting auto-commit daemon...${NC}"
    
    # Enable auto-push in git config
    if [ "$AUTO_PUSH" = "true" ]; then
        git config hooks.autopush true
    fi
    
    # Run the watcher in background
    nohup bash ./auto-commit.sh > .autocommit.log 2>&1 &
    DAEMON_PID=$!
    
    echo $DAEMON_PID > "$PID_FILE"
    echo -e "${GREEN}✓ Auto-commit daemon started (PID: $DAEMON_PID)${NC}"
    echo -e "${BLUE}Logs: tail -f .autocommit.log${NC}"
}

# Stop daemon
stop_daemon() {
    if [ ! -f "$PID_FILE" ]; then
        echo -e "${YELLOW}Auto-commit daemon is not running${NC}"
        exit 0
    fi
    
    PID=$(cat "$PID_FILE")
    
    if ps -p "$PID" > /dev/null 2>&1; then
        echo -e "${YELLOW}Stopping auto-commit daemon (PID: $PID)...${NC}"
        
        # Kill the main process and all children
        pkill -P "$PID" 2>/dev/null
        kill "$PID" 2>/dev/null
        
        rm -f "$PID_FILE"
        echo -e "${GREEN}✓ Auto-commit daemon stopped${NC}"
    else
        echo -e "${YELLOW}Daemon process not found. Cleaning up...${NC}"
        rm -f "$PID_FILE"
    fi
}

# Check daemon status
status_daemon() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo -e "${GREEN}● Auto-commit daemon is running (PID: $PID)${NC}"
            echo -e "${BLUE}Configuration:${NC}"
            echo "  Auto-push: $AUTO_PUSH"
            echo "  Debounce: ${DEBOUNCE_SECONDS}s"
            echo "  Atomic commits: $ATOMIC_COMMITS"
            echo "  Remote: $REMOTE_NAME"
        else
            echo -e "${RED}○ Auto-commit daemon is not running (stale PID file)${NC}"
            rm -f "$PID_FILE"
        fi
    else
        echo -e "${RED}○ Auto-commit daemon is not running${NC}"
    fi
}

# Restart daemon
restart_daemon() {
    stop_daemon
    sleep 1
    start_daemon
}

# Show logs
show_logs() {
    if [ -f ".autocommit.log" ]; then
        tail -f .autocommit.log
    else
        echo -e "${YELLOW}No log file found${NC}"
    fi
}

# Main command handler
case "$1" in
    start)
        start_daemon
        ;;
    stop)
        stop_daemon
        ;;
    restart)
        restart_daemon
        ;;
    status)
        status_daemon
        ;;
    logs)
        show_logs
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the auto-commit daemon"
        echo "  stop    - Stop the auto-commit daemon"
        echo "  restart - Restart the auto-commit daemon"
        echo "  status  - Check daemon status"
        echo "  logs    - Show daemon logs (tail -f)"
        exit 1
        ;;
esac