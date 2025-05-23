# WSL Auto-Start Configuration Guide

## Method 1: Windows Task Scheduler (Recommended)

### Create Scheduled Task:

1. **Open Task Scheduler:** `Win + R` → `taskschd.msc`
2. **Create Basic Task:**
   - Name: "Start WSL and Cron"
   - Trigger: "When the computer starts"
   - Action: "Start a program"
   - Program: `C:\Users\ESTL-BO-2\Documents\Tech\cursor_ai\automation\start_wsl.bat`
   - ✅ Check "Run with highest privileges"
   - ✅ Check "Run whether user is logged on or not"

### Alternative Task Creation (PowerShell):

```powershell
# Run in PowerShell as Administrator
$action = New-ScheduledTaskAction -Execute "C:\Users\ESTL-BO-2\Documents\Tech\cursor_ai\automation\start_wsl.bat"
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName "WSL-Cron-Autostart" -Action $action -Trigger $trigger -Principal $principal
```

## Method 2: Windows Startup Folder

### Copy to Startup:

1. **Open Startup Folder:** `Win + R` → `shell:startup`
2. **Copy:** `start_wsl.bat` to this folder
3. **Result:** Script runs when user logs in

## Method 3: WSL Configuration

### Enable WSL Auto-Start in Registry:

```cmd
# Run in Command Prompt as Administrator
reg add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run" /v "WSL-Autostart" /t REG_SZ /d "wsl -d fedora -e bash -c 'sudo systemctl start crond'"
```

### WSL Configuration File:

Create `/etc/wsl.conf` in WSL:

```ini
[boot]
systemd=true
command="systemctl start crond"

[interop]
enabled=true
appendWindowsPath=true
```

## Method 4: Systemd Service (Within WSL)

### Enable Cron Service:

```bash
# In WSL, ensure cron starts automatically
sudo systemctl enable crond

# Verify it's enabled
sudo systemctl is-enabled crond
```

## Verification Commands

### Test WSL Status:

```cmd
# Check if WSL is running
wsl -l -v

# Check if cron is running
wsl -d fedora -e systemctl status crond

# Test cron jobs
wsl -d fedora -e crontab -l
```

### Log Monitoring:

```bash
# Monitor cron logs in WSL
sudo tail -f /var/log/cron

# Check backup script logs
tail -f /mnt/c/Users/ESTL-BO-2/Documents/Tech/cursor_ai/automation/backup.log
```

## Troubleshooting

### Common Issues:

1. **WSL doesn't start:** Check Task Scheduler settings
2. **Cron not running:** Verify systemd is enabled
3. **Permissions:** Ensure scripts are executable
4. **SSH keys:** Verify ssh-agent starts with cron

### Debug Commands:

```bash
# Check if systemd is running
wsl -d fedora -e systemctl status

# Check cron service
wsl -d fedora -e sudo systemctl status crond

# Test backup script manually
wsl -d fedora -e /mnt/c/Users/ESTL-BO-2/Documents/Tech/cursor_ai/automation/daily_backup.sh
```
