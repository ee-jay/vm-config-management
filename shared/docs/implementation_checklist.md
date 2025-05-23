# Implementation Checklist: Multi-VM Organization Project

## Current Status

**Project Started:** May 23, 2025  
**Phase:** Planning & Initial Setup

---

## Immediate Actions (Week 1)

### Day 1-2: Repository Restructuring

- [x] ✅ Initialize git repository in current workspace
- [x] ✅ Create new directory structure as outlined in strategy
- [x] ✅ Create comprehensive `.gitignore` file for sensitive data
- [x] ✅ Move existing files to appropriate locations in new structure

### Day 3-4: External Storage Setup

- [ ] Mount 1TB external drive on proxmox host
- [ ] Set up NFS/Samba share for VM access
- [ ] Create storage hierarchy on external drive
- [ ] Test VM access to shared storage
- [ ] Document mount procedures and paths

### Day 5-7: Basic Automation

- [x] ✅ Create deployment scripts for each VM _(backup automation created)_
- [x] ✅ Set up git hooks for automated backup to external storage _(hourly cron backup to local storage)_
- [x] ✅ Create update workflow documentation _(git guide, backup strategy docs)_
- [x] ✅ Test basic deployment workflow _(backup scripts tested and working)_

---

## Short-term Goals (Month 1)

### Week 2: VM Audit & Migration

#### Docker VM Tasks

- [ ] **Audit current state**: Document all active services and configs
- [ ] **Clean up directory structure**:
  - [ ] Move `/opt/docker/homepage` to `/opt/configs/homepage`
  - [ ] Move `/opt/docker/wikijs` configs (consolidate with main compose)
  - [ ] Remove duplicate docker-compose files
- [ ] **Preserve backup system**: Keep existing `/opt/scripts/backup.sh` automation
- [ ] **Extend backup script**: Modify backup.sh to also backup webby VM configurations
- [ ] **Create VM deployment script** for docker VM updates
- [ ] **Document current backup retention** (hourly wiki DB backups)

#### Doc VM Tasks

- [ ] **Audit paperless setup**: Document current configuration
- [ ] **Verify external storage mounts**: Document `/mnt/paperless_storage_ssd/` setup
- [ ] **Extract environment variables**: Create template for secrets management
- [ ] **Create deployment script** for doc VM updates
- [ ] **Test backup/restore procedures** for paperless data

#### Webby VM Tasks

- [ ] **Coordinate with colleague**: Get current state of web app project
- [ ] **Document existing git workflow**: Understand current setup
- [ ] **Assess integration needs**: How to fit into overall organization
- [ ] **Create deployment script** (if needed/wanted by colleague)

### Week 3: Standardization

- [ ] **Create standard docker-compose templates**:
  - [ ] Base template with common patterns
  - [ ] Environment variable management standard
  - [ ] Volume mounting patterns
  - [ ] Network configuration standards
- [ ] **Standardize directory structures** across VMs
- [ ] **Create common configuration patterns**:
  - [ ] Logging configuration
  - [ ] Restart policies
  - [ ] Health checks
- [ ] **Set up configuration validation scripts**

### Week 4: Testing & Validation

- [ ] **Test deployment scripts** on non-critical services first
- [ ] **Validate backup and restore procedures**:
  - [ ] Test wiki DB restore from backup
  - [ ] Test paperless data restore
  - [ ] Test configuration rollback
- [ ] **Create rollback procedures** for each VM
- [ ] **Document troubleshooting guides** for common issues
- [ ] **Conduct end-to-end test** of entire workflow

---

## Medium-term Goals (Month 2-3)

### Advanced Automation

- [ ] **Set up CI/CD pipeline** for configuration deployment
- [ ] **Create automated testing** for configurations before deployment
- [ ] **Implement configuration drift monitoring**:
  - [ ] Scripts to detect when VM configs diverge from repo
  - [ ] Automated alerts for configuration drift
- [ ] **Set up alerting** for failed deployments
- [ ] **Create health check dashboard** for all VMs

### Documentation & Training

- [ ] **Create comprehensive documentation**:
  - [ ] Setup procedures for new VMs
  - [ ] Configuration management best practices
  - [ ] Backup and restore procedures
- [ ] **Set up knowledge base** for common procedures
- [ ] **Create troubleshooting guides** for each service
- [ ] **Document best practices** learned during implementation

---

## Long-term Goals (Month 4+)

### Cloud Integration (Phase 2)

- [ ] **Set up rclone** for Dropbox backup integration
- [ ] **Implement automated cloud backup**:
  - [ ] Configuration backups to cloud
  - [ ] Database backups to cloud
  - [ ] Retention policies for cloud storage
- [ ] **Create disaster recovery procedures**:
  - [ ] Full VM restoration procedures
  - [ ] Data recovery from cloud backups
  - [ ] Service restoration priority matrix
- [ ] **Set up remote access** to configurations
- [ ] **Implement monitoring** for cloud backup health

---

## Priority Items (Do First)

### High Priority

1. **Initialize git repo** and create `.gitignore`
2. **Clean up docker VM directory structure** (biggest mess currently)
3. **Create deployment script for docker VM** (most complex)
4. **Document current backup systems** (preserve what works)

### Medium Priority

1. **Standardize environment variable management**
2. **Create configuration templates**
3. **Set up external storage integration**

### Low Priority

1. **Advanced automation features**
2. **Cloud integration setup**
3. **Monitoring dashboards**

---

## Notes & Discoveries

### Docker VM Findings

- **Existing backup automation works well** - keep hourly wiki DB backups
- **Directory structure needs major cleanup** - too many scattered configs
- **Main docker-compose.yml in /opt is source of truth**
- **Homepage can be deprecated** in favor of homarr

### Doc VM Findings

- **Very clean setup** - use as organizational template
- **Good use of environment variables** - replicate this pattern
- **External storage properly integrated** - document this approach

### External Storage

- **1TB SSD available on proxmox host** for centralized storage
- **Paperless already using external storage** via symlinks/mounts
- **Need to set up shared access** for other VMs

---

## Completed Items

### ✅ **May 23, 2025 - Foundation Setup Session**

**Repository & Version Control:**

- ✅ Git repository initialized with remote GitHub connection
- ✅ Comprehensive `.gitignore` created (sensitive data, storage, logs, backups)
- ✅ SSH authentication set up between WSL and GitHub (with corporate firewall workaround)
- ✅ Organized directory structure: `vms/`, `infrastructure/`, `shared/`, `automation/`
- ✅ File migration from scattered locations to organized structure

**Automation & Backup System:**

- ✅ **Hourly sensitive data backup** via cron (Mon-Fri 8am-5pm, Sat 8am-12pm)
- ✅ SSH key authentication set up between WSL and all VMs (docker, doc, webby)
- ✅ Created `sync_sensitive_data.sh` script for config backups (excludes large storage)
- ✅ WSL auto-start automation on Windows boot
- ✅ Cron service installed and configured on WSL

**Documentation:**

- ✅ **Git guide** with SSH troubleshooting (corporate network solutions)
- ✅ **Backup strategy documentation** (3-tier approach: hourly configs, git infrastructure, future rclone)
- ✅ **Implementation log** tracking all commands and changes
- ✅ WSL setup and automation documentation

**Infrastructure:**

- ✅ **Fedora WSL** set as default (Ubuntu removed)
- ✅ **Passwordless SSH** to all VMs working
- ✅ **Private backup directory** excluded from git but backed up locally
- ✅ **Multi-tiered backup strategy** planned (rsync → git → rclone to Dropbox)

**Next Priority:** External storage setup and VM directory cleanup (Docker VM needs most work)

---

## Blockers & Issues

_Track any issues that prevent progress_

---

**Last Updated:** May 23, 2025  
**Next Review:** Weekly during implementation phase
