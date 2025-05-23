# Git Guide: Complete Workflow for VM Configuration Management

**Created:** May 23, 2025  
**Environment:** WSL, Corporate Network, GitHub  
**Use Case:** Multi-VM infrastructure configuration management

---

## 🚀 Quick Start Checklist

- [ ] Initialize git repository
- [ ] Create comprehensive .gitignore
- [ ] Set up SSH keys for GitHub
- [ ] Configure SSH over HTTPS (corporate firewall workaround)
- [ ] Create remote repository
- [ ] Push organized structure

---

## 📋 Basic Git Setup

### Initialize Repository

```bash
# Navigate to project directory
cd /path/to/your/project

# Initialize git repository
git init

# Check status
git status

# Set user information (if not already set globally)
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Essential .gitignore for Infrastructure Projects

```bash
# Create comprehensive .gitignore
cat > .gitignore << 'EOF'
# Sensitive Data & Secrets
*.env
.env*
**/secrets/
**/keys/
**/private/

# Database Files & Backups
*.sql
*.dump
*.backup
*.sqlite*
**/dumps/
**/backups/
**/db-backups/

# Storage & Data Directories
*_storage_*/
**/data/
**/media/
**/postgres_data/
**/mysql_data/

# Log Files
logs/
*.log
**/logs/

# Temporary Files
*.tmp
*.temp
.DS_Store
Thumbs.db

# IDE & Editor Files
.vscode/
.idea/
*.swp
*.swo
*~
EOF
```

---

## 🔑 SSH Key Setup for GitHub

### Generate SSH Key

```bash
# Generate ED25519 key (recommended)
ssh-keygen -t ed25519 -C "your-description" -f ~/.ssh/id_ed25519_github

# Start SSH agent
eval "$(ssh-agent -s)"

# Add key to agent
ssh-add ~/.ssh/id_ed25519_github

# Display public key (copy this to GitHub)
cat ~/.ssh/id_ed25519_github.pub
```

### Add Public Key to GitHub

1. Go to **GitHub.com** → Settings → SSH and GPG keys
2. Click **"New SSH key"**
3. Paste your public key
4. Give it a descriptive title

---

## 🔥 Corporate Firewall Workaround

### Problem: SSH Port 22 Blocked

**Symptoms:**

```bash
ssh -T git@github.com
# Result: Connection timed out
```

### Solution: SSH over HTTPS (Port 443)

```bash
# Add GitHub SSH-over-HTTPS config
echo "
Host github.com
    Hostname ssh.github.com
    Port 443
    User git
" >> ~/.ssh/config

# Test connection
ssh -T git@github.com
# Should result in: "Hi username! You've successfully authenticated"
```

**Why This Works:**

- Corporate firewalls typically block port 22 (SSH)
- Port 443 (HTTPS) is usually allowed
- GitHub provides SSH service on port 443 for this exact reason

---

## 📂 Basic Git Workflow

### Stage and Commit Changes

```bash
# Check what's changed
git status

# Add all changes
git add .

# Add specific files
git add filename.txt

# Commit with message
git commit -m "Descriptive commit message"

# View commit history
git log --oneline
```

### Useful Git Commands

```bash
# Check repository status
git status

# View differences
git diff

# View commit history (one line per commit)
git log --oneline

# View detailed commit history
git log

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo changes to a file
git restore filename.txt

# Remove file from staging
git rm --cached filename.txt
```

---

## 🌐 Remote Repository Setup

### Create GitHub Repository

1. Go to **GitHub.com**
2. Click **"New repository"**
3. Choose repository name
4. Select **Private** for infrastructure configs
5. **Don't initialize** if you already have files

### Connect Local to Remote

```bash
# Add remote origin
git remote add origin git@github.com:username/repository-name.git

# Push to GitHub (first time)
git push -u origin master

# Push subsequent changes
git push
```

---

## 🛠️ Troubleshooting

### "Repository not found" Error

**Symptoms:**

```bash
git push -u origin master
ERROR: Repository not found.
```

**Solutions:**

1. **Check repository exists** on GitHub
2. **Verify repository name** in remote URL
3. **Check access permissions** to the repository
4. **Verify SSH key** is added to GitHub account

```bash
# Check remote URL
git remote -v

# Update remote URL if needed
git remote set-url origin git@github.com:username/correct-repo-name.git
```

### "Not a git repository" Error

**Symptoms:**

```bash
git status
fatal: not a git repository
```

**Solutions:**

1. **Check current directory** - ensure you're in the project folder
2. **Look for .git folder** - `ls -la | grep .git`
3. **Navigate to correct directory** - `cd /path/to/project`

### SSH Connection Issues

**Test SSH connection:**

```bash
# Test with verbose output
ssh -vT git@github.com

# If port 22 blocked, try port 443
ssh -T -p 443 git@ssh.github.com
```

---

## 📝 Best Practices for Infrastructure Projects

### Commit Message Guidelines

```bash
# Good commit messages
git commit -m "Add: Docker compose for paperless setup"
git commit -m "Fix: SSH config for corporate firewall"
git commit -m "Update: Backup script with retention policy"
git commit -m "Docs: Add deployment guide for docker VM"

# Use prefixes: Add, Fix, Update, Remove, Docs, Config
```

### Directory Organization Strategy

```
project-root/
├── .git/                     # Git repository data
├── .gitignore               # Exclusion rules
├── README.md                # Project overview
├── infrastructure/          # Core infrastructure configs
│   ├── proxmox/
│   ├── networking/
│   └── storage/
├── vms/                     # VM-specific configurations
│   ├── docker-vm/
│   ├── doc-vm/
│   └── webby-vm/
├── shared/                  # Shared resources
│   ├── docker-compose/
│   ├── scripts/
│   └── docs/
└── automation/             # Deployment scripts
```

### Security Considerations

1. **Never commit sensitive data** (passwords, API keys, certificates)
2. **Use .gitignore liberally** for data directories
3. **Private repositories** for infrastructure configs
4. **Regular SSH key rotation**
5. **Review commits** before pushing

---

## 🎯 Quick Reference Commands

```bash
# Essential daily commands
git status                           # Check repository status
git add .                           # Stage all changes
git commit -m "message"             # Commit with message
git push                            # Push to remote
git pull                            # Pull from remote

# Setup commands (one-time)
git init                            # Initialize repository
git remote add origin <url>        # Add remote repository
git push -u origin master          # First push (set upstream)

# Troubleshooting
git log --oneline                   # View commit history
git remote -v                       # Check remote URLs
ssh -T git@github.com              # Test GitHub connection
git config --list                  # View git configuration
```

---

## 📚 Additional Resources

### Useful Git Aliases (Optional)

```bash
# Add to ~/.gitconfig or set globally
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
```

### Advanced .gitignore Patterns

```bash
# Ignore all files in directory but keep directory
logs/*
!logs/.gitkeep

# Ignore files but not subdirectories
data/*
!data/*/

# Ignore based on file extension
*.log
*.tmp
*.backup

# Ignore specific directories anywhere in tree
**/node_modules/
**/build/
```

---

**Last Updated:** May 23, 2025  
**Tested Environment:** WSL, Corporate Network, GitHub SSH over HTTPS
