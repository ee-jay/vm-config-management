# Dropbox Backup Plan for Paperless Documents

## Overview

This plan sets up automated daily backups of Paperless media files and configuration to Dropbox using rclone. This provides offsite backup protection for all processed documents and system configuration.

---

## 🎯 Backup Targets

### **Primary Backup: Media Files**

- **Source**: `/mnt/paperless_storage_ssd/media/`
- **Target**: `"dropbox:Back Office-Shared/Technology(dropbox)/paperless_backups/media/"`
- **Content**: All processed PDF documents, thumbnails, archived files
- **Size**: Likely largest component (all your documents)

### **Secondary Backup: Configuration**

- **Source**: Specific paperless configuration files (docker-compose.yml, paperless.env, etc.)
- **Target**: `"dropbox:Back Office-Shared/Technology(dropbox)/paperless_backups/config/"`
- **Content**: Docker compose file, environment variables, custom configurations
- **Size**: Small but critical for system restoration

### **Optional: Database Backup**

- **Source**: PostgreSQL database dump
- **Target**: `"dropbox:Back Office-Shared/Technology(dropbox)/paperless_backups/database/"`
- **Content**: Document metadata, tags, correspondents, etc.
- **Size**: Small but essential for complete restoration

---

## 📋 Implementation Steps

### **Phase 1: Setup rclone for Dropbox**

#### **Step 1.1: Install/Configure rclone for Dropbox**

```bash
# Configure new remote for Dropbox
rclone config

# Choose:
# - New remote: dropbox
# - Storage type: dropbox
# - Follow OAuth flow for authentication
```

#### **Step 1.2: Test Dropbox Connection**

```bash
# Test connection
rclone lsd dropbox:

# Verify access to existing backup folder
rclone lsd "dropbox:Back Office-Shared/Technology(dropbox)/paperless_backups"

# Create backup subfolders if they don't exist
rclone mkdir "dropbox:Back Office-Shared/Technology(dropbox)/paperless_backups/media"
rclone mkdir "dropbox:Back Office-Shared/Technology(dropbox)/paperless_backups/config"
rclone mkdir "dropbox:Back Office-Shared/Technology(dropbox)/paperless_backups/database"
```

### **Phase 2: Create Backup Scripts**

#### **Step 2.1: Media Backup Script**

**File**: `/opt/scripts/backup-paperless-media.sh`

```bash
#!/bin/bash
# Daily backup of Paperless media files to Dropbox
# Includes progress logging and error handling

MEDIA_SOURCE="/mnt/paperless_storage_ssd/media/"
DROPBOX_TARGET="dropbox:Back Office-Shared/Technology(dropbox)/paperless_backups/media/"
LOG_FILE="/opt/log/paperless-dropbox-backup.log"

# Use rclone sync with bandwidth limiting and progress
rclone sync "$MEDIA_SOURCE" "$DROPBOX_TARGET" \
  --log-file "$LOG_FILE" \
  --log-level INFO \
  --stats 5m \
  --stats-one-line \
  --bwlimit 10M \
  --retries 3 \
  --retries-sleep 30s \
  --exclude "*.tmp" \
  --exclude "*.part"
```

#### **Step 2.2: Configuration Backup Script**

**File**: `/opt/scripts/backup-paperless-config.sh`

```bash
#!/bin/bash
# Backup specific Paperless configuration files to Dropbox

DROPBOX_TARGET="dropbox:Back Office-Shared/Technology(dropbox)/paperless_backups/config/"
LOG_FILE="/opt/log/paperless-dropbox-backup.log"
TEMP_CONFIG_DIR="/tmp/paperless-config-backup"

# Create temporary directory for config files
mkdir -p "$TEMP_CONFIG_DIR"

# Copy essential paperless configuration files
echo "Backing up essential Paperless configuration files..." | tee -a "$LOG_FILE"

# 1. Docker Compose file
if [ -f ~/docker-compose.yml ]; then
    cp ~/docker-compose.yml "$TEMP_CONFIG_DIR/"
    echo "✅ Copied docker-compose.yml" | tee -a "$LOG_FILE"
elif [ -f ~/paperless-compose.yml ]; then
    cp ~/paperless-compose.yml "$TEMP_CONFIG_DIR/"
    echo "✅ Copied paperless-compose.yml" | tee -a "$LOG_FILE"
else
    echo "❌ No docker-compose file found" | tee -a "$LOG_FILE"
fi

# 2. Environment file
if [ -f ~/paperless.env ]; then
    cp ~/paperless.env "$TEMP_CONFIG_DIR/"
    echo "✅ Copied paperless.env" | tee -a "$LOG_FILE"
elif [ -f ~/.env ]; then
    cp ~/.env "$TEMP_CONFIG_DIR/"
    echo "✅ Copied .env" | tee -a "$LOG_FILE"
else
    echo "❌ No environment file found" | tee -a "$LOG_FILE"
fi

# 3. rclone configuration
if [ -f ~/.config/rclone/rclone.conf ]; then
    mkdir -p "$TEMP_CONFIG_DIR/.config/rclone"
    cp ~/.config/rclone/rclone.conf "$TEMP_CONFIG_DIR/.config/rclone/"
    echo "✅ Copied rclone.conf" | tee -a "$LOG_FILE"
else
    echo "❌ No rclone config found" | tee -a "$LOG_FILE"
fi

# Upload config files to Dropbox
echo "Uploading configuration files to Dropbox..." | tee -a "$LOG_FILE"
rclone sync "$TEMP_CONFIG_DIR/" "$DROPBOX_TARGET" \
  --log-file "$LOG_FILE" \
  --log-level INFO

if [ $? -eq 0 ]; then
    echo "✅ Configuration backup completed successfully" | tee -a "$LOG_FILE"
else
    echo "❌ Configuration backup failed" | tee -a "$LOG_FILE"
fi

# Clean up temporary directory
rm -rf "$TEMP_CONFIG_DIR"
```

#### **Step 2.3: Database Backup Script**

**File**: `/opt/scripts/backup-paperless-database.sh`

```bash
#!/bin/bash
# Create and backup PostgreSQL database dump

BACKUP_DIR="/opt/tmp/paperless-db-backup"
DROPBOX_TARGET="dropbox:Back Office-Shared/Technology(dropbox)/paperless_backups/database/"
DATE=$(date +%Y%m%d_%H%M%S)
DUMP_FILE="paperless_db_$DATE.sql"

# Create database dump
mkdir -p "$BACKUP_DIR"
docker exec trav-paperless-db-1 pg_dump -U paperless paperless > "$BACKUP_DIR/$DUMP_FILE"

# Compress the dump
gzip "$BACKUP_DIR/$DUMP_FILE"

# Upload to Dropbox
rclone copy "$BACKUP_DIR/$DUMP_FILE.gz" "$DROPBOX_TARGET"

# Keep only last 7 days of database backups locally
find "$BACKUP_DIR" -name "paperless_db_*.sql.gz" -mtime +7 -delete

# Keep only last 30 days of database backups on Dropbox
rclone delete "$DROPBOX_TARGET" --min-age 30d --include "paperless_db_*.sql.gz"
```

### **Phase 3: Master Backup Script**

#### **Step 3.1: Combined Daily Backup**

**File**: `/opt/scripts/daily-paperless-backup.sh`

```bash
#!/bin/bash
# Master script for daily Paperless backup to Dropbox

LOG_FILE="/opt/log/paperless-dropbox-backup.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

log_message() {
    echo "[$DATE] $1" | tee -a "$LOG_FILE"
}

log_message "=== Starting daily Paperless backup to Dropbox ==="

# 1. Backup database first (smallest, fastest)
log_message "📊 Starting database backup..."
/opt/scripts/backup-paperless-database.sh
if [ $? -eq 0 ]; then
    log_message "✅ Database backup completed"
else
    log_message "❌ Database backup failed"
fi

# 2. Backup configuration files
log_message "⚙️ Starting configuration backup..."
/opt/scripts/backup-paperless-config.sh
if [ $? -eq 0 ]; then
    log_message "✅ Configuration backup completed"
else
    log_message "❌ Configuration backup failed"
fi

# 3. Backup media files (largest, run last)
log_message "📄 Starting media files backup..."
/opt/scripts/backup-paperless-media.sh
if [ $? -eq 0 ]; then
    log_message "✅ Media backup completed"
else
    log_message "❌ Media backup failed"
fi

log_message "=== Daily Paperless backup completed ==="
```

### **Phase 4: Automation Setup**

#### **Step 4.1: Cron Configuration**

```bash
# Add to crontab (run daily at 2 AM)
0 2 * * * /opt/scripts/daily-paperless-backup.sh >/dev/null 2>&1

# Weekly cleanup of old logs (Sundays at 3 AM)
0 3 * * 0 find /opt/log -name "paperless-dropbox-backup.log*" -mtime +30 -delete
```

#### **Step 4.2: Make Scripts Executable**

```bash
chmod +x /opt/scripts/backup-paperless-*.sh
chmod +x /opt/scripts/daily-paperless-backup.sh
```

---

## 🔧 Configuration Considerations

### **Bandwidth Management**

- **Limit upload speed** to avoid impacting other services
- **Schedule during off-hours** (2 AM suggested)
- **Use incremental sync** to only upload changed files

### **Storage Optimization**

- **Exclude temporary files** (_.tmp, _.part)
- **Compress database dumps** to save space
- **Implement retention policies** for old backups

### **Error Handling**

- **Retry failed uploads** with exponential backoff
- **Log all operations** for troubleshooting
- **Email notifications** for backup failures (optional)

---

## 📊 Monitoring & Maintenance

### **Daily Checks**

```bash
# Check backup status
tail -20 /opt/log/paperless-dropbox-backup.log

# Verify Dropbox storage usage
rclone about dropbox:

# Check recent backup files
rclone ls "dropbox:Back Office-Shared/Technology(dropbox)/paperless_backups/database/" | tail -5
```

### **Weekly Maintenance**

```bash
# Test restore capability (sample file)
rclone copy "dropbox:Back Office-Shared/Technology(dropbox)/paperless_backups/media/documents/2024/01/sample.pdf" /tmp/restore-test/

# Check backup integrity
rclone check /mnt/paperless_storage_ssd/media/ "dropbox:Back Office-Shared/Technology(dropbox)/paperless_backups/media/" --one-way
```

---

## 🚨 Disaster Recovery

### **Full System Restore Process**

1. **Restore configuration files** from `"dropbox:Back Office-Shared/Technology(dropbox)/paperless_backups/config/"`
2. **Restore database** from latest dump in `"dropbox:Back Office-Shared/Technology(dropbox)/paperless_backups/database/"`
3. **Restore media files** from `"dropbox:Back Office-Shared/Technology(dropbox)/paperless_backups/media/"`
4. **Restart Paperless services** and verify functionality

### **Partial Recovery Examples**

```bash
# Restore specific document
rclone copy "dropbox:Back Office-Shared/Technology(dropbox)/paperless_backups/media/documents/2024/01/important.pdf" /mnt/paperless_storage_ssd/media/documents/2024/01/

# Restore configuration files to home directory
rclone copy "dropbox:Back Office-Shared/Technology(dropbox)/paperless_backups/config/docker-compose.yml" ~/
rclone copy "dropbox:Back Office-Shared/Technology(dropbox)/paperless_backups/config/paperless.env" ~/
rclone copy "dropbox:Back Office-Shared/Technology(dropbox)/paperless_backups/config/.config/rclone/rclone.conf" ~/.config/rclone/

# Restore database to specific date
rclone copy "dropbox:Back Office-Shared/Technology(dropbox)/paperless_backups/database/paperless_db_20241201_020000.sql.gz" /tmp/
```

---

## 💰 Cost Estimation

### **Dropbox Storage Requirements**

- **Media files**: Depends on document volume (estimate 1-10GB initially)
- **Configuration**: <100MB
- **Database dumps**: <500MB (with 30-day retention)
- **Total estimated**: 2-15GB depending on document volume

### **Bandwidth Usage**

- **Initial backup**: Full upload of all existing documents
- **Daily incremental**: Only new/changed files (typically small)
- **Recommended**: Monitor first month to establish patterns

---

## 🔄 Implementation Timeline

### **Week 1: Setup & Testing**

- Configure rclone for Dropbox
- Create and test backup scripts
- Run initial backup manually

### **Week 2: Automation**

- Set up cron jobs
- Implement monitoring
- Test failure scenarios

### **Week 3: Optimization**

- Fine-tune bandwidth limits
- Optimize backup timing
- Document procedures

### **Ongoing: Maintenance**

- Monitor backup success
- Test restore procedures monthly
- Update retention policies as needed

---

## ✅ Success Criteria

- ✅ **Daily automated backups** running without intervention
- ✅ **All document types** successfully backed up
- ✅ **Configuration preserved** for system restoration
- ✅ **Monitoring in place** to detect failures
- ✅ **Restore procedures tested** and documented
- ✅ **Minimal impact** on system performance during backups

This plan provides comprehensive protection for your Paperless system with automated daily backups to Dropbox, ensuring your documents and configuration are safely stored offsite.
