# Backup Strategy Documentation

**Created:** May 23, 2025  
**Purpose:** Multi-tiered backup approach for VM configuration management

---

## 🎯 Backup Tiers

### **Tier 1: Configuration Files (Hourly - rsync)**

**Schedule:** Hourly during work hours  
**Target:** Sensitive configs, secrets, environment files  
**Storage:** Local Windows machine (`private-backups/`)  
**Method:** `rsync` via `sync_sensitive_data.sh`

**What's included:**

- `*.env` files
- `docker-compose.override.yml`
- `**/secrets/` directories
- VM-specific configuration files

**VMs covered:**

- Docker VM: `/opt/docker/` configs
- Doc VM: `/opt/paperless-ngx/` configs
- Webby VM: `/opt/POServer/` configs (planned)

---

### **Tier 2: VM Infrastructure (Daily - git)**

**Schedule:** As changes occur  
**Target:** Docker compose files, scripts, documentation  
**Storage:** GitHub private repository  
**Method:** Git version control

**What's included:**

- Organized VM configurations
- Deployment scripts
- Documentation and guides
- Network configurations

---

### **Tier 3: Large Storage (Planned - rclone)**

**Schedule:** Daily or weekly  
**Target:** Large data files, media, documents  
**Storage:** Unlimited Dropbox account  
**Method:** `rclone` sync

**TODO: Set up rclone for:**

- Doc VM: `/mnt/paperless_storage_ssd/` → Dropbox
- Any other large storage directories

**Advantages:**

- ✅ Unlimited storage capacity
- ✅ Automatic deduplication
- ✅ Version history
- ✅ Cloud accessibility

---

## 📋 Implementation Status

- ✅ **Tier 1**: Hourly sensitive configs backup
- ✅ **Tier 2**: Git repository with VM configs
- ⏳ **Tier 3**: rclone to Dropbox (not implemented yet)

---

## 🔄 Future Enhancements

1. **Monitoring & Alerting**

   - Email notifications for backup failures
   - Disk space monitoring
   - Backup verification checks

2. **Retention Policies**

   - Hourly backups: Keep 24 hours
   - Daily backups: Keep 30 days
   - Weekly backups: Keep 12 weeks

3. **Automation Improvements**
   - Ansible playbooks for deployment
   - Automated restore procedures
   - Cross-site backup verification

---

**Last Updated:** May 23, 2025
