#!/bin/bash

# Daily Git Backup Script for VM Configuration Management
# Purpose: Automatically commit and push changes to GitHub
# Schedule: Daily at 4:30 PM via cron

# Configuration
REPO_DIR="/mnt/c/Users/ESTL-BO-2/Documents/Tech/cursor_ai"
LOG_FILE="$REPO_DIR/automation/backup.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Function to log messages
log_message() {
    echo "[$DATE] $1" | tee -a "$LOG_FILE"
}

# Function to check if we're in a git repository
check_git_repo() {
    if [ ! -d "$REPO_DIR/.git" ]; then
        log_message "ERROR: Not a git repository: $REPO_DIR"
        exit 1
    fi
}

# Function to ensure SSH agent is running and key is loaded
setup_ssh() {
    # Check if ssh-agent is running
    if [ -z "$SSH_AUTH_SOCK" ]; then
        log_message "Starting SSH agent..."
        eval "$(ssh-agent -s)"
    fi
    
    # Check if GitHub key is loaded
    if ! ssh-add -l | grep -q "estl-bo-2 fedora wsl machine"; then
        log_message "Adding GitHub SSH key..."
        ssh-add ~/.ssh/id_ed25519_github
    fi
}

# Function to update script from git
update_script() {
    log_message "Checking for script updates..."
    
    # Navigate to repository directory
    cd "$REPO_DIR" || {
        log_message "ERROR: Cannot navigate to $REPO_DIR"
        exit 1
    }
    
    # Test GitHub connection first
    if ! ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
        log_message "WARNING: GitHub SSH connection failed, skipping update check"
        return 0
    fi
    
    # Stash any local changes to avoid conflicts
    if ! git diff --quiet || ! git diff --cached --quiet; then
        log_message "Stashing local changes before update..."
        git stash push -m "Auto-stash before script update $(date)"
    fi
    
    # Pull latest changes
    log_message "Pulling latest updates from GitHub..."
    if git pull; then
        log_message "Script updated successfully"
    else
        log_message "WARNING: Git pull failed, continuing with current version"
    fi
}

# Main backup function
perform_backup() {
    log_message "Starting daily backup for VM configuration management"
    
    # Navigate to repository directory
    cd "$REPO_DIR" || {
        log_message "ERROR: Cannot navigate to $REPO_DIR"
        exit 1
    }
    
    # Check for changes
    if git diff --quiet && git diff --cached --quiet; then
        log_message "No changes detected. Skipping backup."
        return 0
    fi
    
    # Add all changes
    log_message "Adding changes to staging..."
    git add .
    
    # Create commit with timestamp
    COMMIT_MSG="Auto-backup: Daily configuration update $(date '+%Y-%m-%d %H:%M')"
    log_message "Creating commit: $COMMIT_MSG"
    git commit -m "$COMMIT_MSG"
    
    # Test GitHub connection
    log_message "Testing GitHub connection..."
    if ! ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
        log_message "ERROR: GitHub SSH connection failed"
        exit 1
    fi
    
    # Push to GitHub
    log_message "Pushing to GitHub..."
    if git push; then
        log_message "SUCCESS: Backup completed successfully"
    else
        log_message "ERROR: Git push failed"
        exit 1
    fi
}

# Error handling
set -e
trap 'log_message "ERROR: Script failed at line $LINENO"' ERR

# Main execution
log_message "=== Daily Backup Script Started ==="

check_git_repo
setup_ssh
update_script
perform_backup

log_message "=== Daily Backup Script Completed ===" 