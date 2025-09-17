# Auto-Commit System

This system automatically commits and pushes file changes to maintain version control concurrency and coherence.

## Quick Start

```bash
# Start the auto-commit daemon
./auto-commit-daemon.sh start

# Stop the daemon
./auto-commit-daemon.sh stop

# Check status
./auto-commit-daemon.sh status

# View logs
./auto-commit-daemon.sh logs
```

## Features

- **Automatic File Watching**: Monitors all file changes in the project
- **Atomic Commits**: Each file change gets its own commit
- **Auto-Push**: Automatically pushes commits to remote repository
- **Conflict Resolution**: Handles merge conflicts with auto-rebase
- **Debouncing**: Waits for file changes to settle before committing
- **Configurable**: Customize behavior via `.autocommit.config`

## Components

### 1. `auto-commit.sh`
Main file watcher script that monitors changes and creates commits.

### 2. `auto-commit-daemon.sh`
Service manager for running the auto-commit system in the background.

### 3. `.autocommit.config`
Configuration file for customizing behavior.

### 4. `.git/hooks/post-commit`
Git hook that automatically pushes after each commit.

## Configuration

Edit `.autocommit.config` to customize:

- `AUTO_PUSH`: Enable/disable automatic pushing
- `DEBOUNCE_SECONDS`: Wait time before committing
- `MAX_PUSH_RETRIES`: Number of push retry attempts
- `IGNORE_PATTERNS`: Files/directories to ignore
- `ATOMIC_COMMITS`: One commit per file change

## Manual Usage

### Run in foreground:
```bash
./auto-commit.sh [watch_directory] [branch] [commit_prefix]
```

### Enable/disable auto-push:
```bash
git config hooks.autopush true  # Enable
git config hooks.autopush false # Disable
```

## Ignored Files

The system automatically ignores:
- `.git` directory
- `node_modules`
- `.next` build files
- Swap files (`.swp`)
- Temporary files (`.tmp`)
- Log files (`.log`)

## Commit Message Format

Auto-commits use the format:
```
auto-commit: [Action] [file_path] at [timestamp]
```

Actions: Modified, Created, Deleted

## Troubleshooting

### Daemon won't start
- Check if already running: `./auto-commit-daemon.sh status`
- Check permissions: `chmod +x *.sh`

### Pushes failing
- Verify remote access: `git remote -v`
- Check branch protection rules
- Review `.autocommit.log` for errors

### Too many commits
- Increase `DEBOUNCE_SECONDS` in config
- Disable `ATOMIC_COMMITS` for batch commits

## Security Notes

- Never commit sensitive files (keys, passwords)
- Review `.autocommit.config` ignore patterns
- Consider branch protection for production branches

## Stop Auto-Commit

To completely disable:
```bash
./auto-commit-daemon.sh stop
git config hooks.autopush false
```