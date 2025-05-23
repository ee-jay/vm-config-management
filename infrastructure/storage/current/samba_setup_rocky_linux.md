# Samba Share Setup Guide for Rocky Linux 9.5 with SELinux

## For Paperless-ngx Consumption Directory

This guide provides instructions for setting up a Samba share on Rocky Linux 9.5 with SELinux enabled, specifically configured for a Paperless-ngx consumption directory.

### Network Configuration

- Linux Host IP: 192.168.20.6
- Windows Client IP: 192.168.1.114

### 1. Installation

```bash
# Update system and install Samba packages
sudo dnf update
sudo dnf install samba samba-common samba-client samba-common-tools
```

Package explanation:

- `samba`: Core Samba server
- `samba-common`: Common Samba files
- `samba-client`: Client utilities
- `samba-common-tools`: Includes testparm and other Samba testing tools

### 2. Directory Setup

```bash
# Create directory structure
sudo mkdir -p /mnt/paperless_storage_ssd/consume

# Set SELinux context for the directory
sudo semanage fcontext -a -t samba_share_t "/mnt/paperless_storage_ssd/consume(/.*)?"

# Apply the context
sudo restorecon -Rv /mnt/paperless_storage_ssd/consume

# Verify SELinux context
ls -ldZ /mnt/paperless_storage_ssd/consume
```

### 3. SELinux Configuration

```bash
# Set required SELinux boolean
sudo setsebool -P smbd_anon_write 1

# Create a group for Samba access
sudo groupadd paperless_share

# Add your user to the group
sudo usermod -aG paperless_share trav

# Set directory permissions
sudo chown -R trav:paperless_share /mnt/paperless_storage_ssd/consume
sudo chmod -R 2775 /mnt/paperless_storage_ssd/consume
```

The permissions explained:

- 2775 permissions mean:
  - 2: SGID bit (new files inherit the group)
  - 7: Owner (trav) has full read/write/execute
  - 7: Group (paperless_share) has full read/write/execute
  - 5: Others can read/execute but not write
- This setup allows:
  - You (trav) to have full access locally
  - Samba users to write through the group permissions
  - New files to maintain the correct group ownership

#### Understanding the SGID Bit (2xxx)

The SGID (Set Group ID) bit is a special permission bit that affects directories in two important ways:

1. File Inheritance:

   - When SGID is set on a directory, new files created in that directory automatically inherit the group ownership of the parent directory
   - Without SGID, new files would inherit the primary group of the user creating them

2. Directory Inheritance:
   - New subdirectories also inherit the SGID bit
   - This ensures consistent group ownership throughout the directory tree

Example without SGID:

```bash
# Directory setup without SGID
chmod 0775 /mnt/paperless_storage_ssd/consume
touch /mnt/paperless_storage_ssd/consume/newfile.txt
# newfile.txt gets the primary group of the creating user
```

Example with SGID:

```bash
# Directory setup with SGID
chmod 2775 /mnt/paperless_storage_ssd/consume
touch /mnt/paperless_storage_ssd/consume/newfile.txt
# newfile.txt gets the group 'paperless_share' regardless of who creates it
```

Why this matters for Samba:

- Windows users connect as 'nobody'
- Without SGID, files would get nobody's primary group
- With SGID, files get the paperless_share group
- This ensures consistent permissions for both Samba and local access

You can verify SGID is working:

```bash
# Look for the 's' in the group execute position
ls -la /mnt/paperless_storage_ssd/consume
# Should show: drwxrws--- or similar

# Create a test file and check its group
touch /mnt/paperless_storage_ssd/consume/test.txt
ls -la /mnt/paperless_storage_ssd/consume/test.txt
# Should show paperless_share as the group
```

#### Understanding SELinux Boolean: smbd_anon_write

The `setsebool -P smbd_anon_write 1` command is crucial for our Samba setup:

1. Command breakdown:

   - `setsebool`: SELinux command to modify boolean values
   - `-P`: Makes the change persistent across reboots
   - `smbd_anon_write`: The specific boolean for Samba anonymous writes
   - `1`: Enables the boolean (0 would disable it)

2. What this boolean controls:

   - Allows Samba to write to the filesystem as an anonymous user
   - Affects operations when using `force user = nobody`
   - Required when `guest ok = yes` is set in smb.conf
   - Permits write access even with restrictive SELinux contexts

3. Security implications:

   - Without this boolean: SELinux blocks write attempts from anonymous/guest users
   - With this boolean: Samba can write files as the nobody user
   - Still restricted by:
     - Regular Linux file permissions
     - SELinux file contexts
     - Samba share configurations

4. Verification commands:

```bash
# Check current value
getsebool smbd_anon_write

# List all Samba-related booleans
getsebool -a | grep smbd

# View boolean description
semanage boolean -l | grep smbd_anon_write
```

5. Common issues this boolean fixes:

   - "Permission denied" errors in Windows when writing files
   - SELinux AVC denials in audit log
   - Write failures even with correct Linux permissions
   - Problems with guest access to writable shares

6. Related SELinux booleans you might need:

```bash
# Allow Samba to create new files in writable directories
setsebool -P samba_create_home_dirs 1

# Allow Samba to share any file/directory read/write
setsebool -P samba_export_all_rw 1
```

You can monitor SELinux denials related to Samba with:

```bash
# Watch SELinux denials in real-time
sudo ausearch -m AVC -ts recent | grep smbd

# View all denied actions
sudo grep denied /var/log/audit/audit.log | grep smbd
```

### 4. Samba Configuration

After configuration and running `testparm`, your working configuration should look like this:

```ini
[global]
        client max protocol = SMB3
        client min protocol = SMB2
        dns proxy = No
        map to guest = Bad User
        security = USER
        server min protocol = SMB2
        workgroup = SAMBA
        idmap config * : backend = tdb

[homes]
        browseable = No
        comment = Home Directories
        inherit acls = Yes
        read only = No
        valid users = %S %D%w%S

[printers]
        browseable = No
        comment = All Printers
        create mask = 0600
        path = /var/tmp
        printable = Yes

[print$]
        comment = Printer Drivers
        create mask = 0664
        directory mask = 0775
        force group = @printadmin
        path = /var/lib/samba/drivers
        write list = @printadmin root

[paperless_consume]
        create mask = 0664
        directory mask = 02775
        force group = paperless_share
        force user = nobody
        guest ok = Yes
        path = /mnt/paperless_storage_ssd/consume
        read only = No
```

Key points about this configuration:

1. Global Settings:

   - SMB protocol limits are properly set (SMB2 minimum, SMB3 maximum)
   - Security is set to USER mode
   - Guest access is mapped to "Bad User" (allows guest access when user doesn't exist)
   - Using TDB backend for ID mapping

2. Share Settings:

   - Directory mask is `02775` (note the leading 0)
   - Create mask is `0664` for new files
   - Guest access is enabled
   - Force user/group settings are applied
   - Read-only is disabled (allowing writes)

3. Default Shares:

   - [homes] share is present but secured
   - Printer shares are maintained but can be removed if not needed
   - All default security settings are preserved

4. Notable Differences from Minimal Config:
   - Maintains printer support
   - Keeps [homes] share (but secured)
   - Includes idmap configuration
   - Uses standard workgroup name

To verify the configuration:

```bash
testparm
# Press Enter to see the processed configuration
```

To check active connections once running:

```bash
sudo smbstatus
```

To test access:

```bash
# From Linux
smbclient -L localhost

# From Windows
# Browse to: \\server_ip\paperless_consume
```

### 5. Firewall Configuration

```bash
# Configure firewalld
sudo firewall-cmd --permanent --add-service=samba
sudo firewall-cmd --permanent --add-source=192.168.1.0/24
sudo firewall-cmd --reload

# Verify configuration
sudo firewall-cmd --list-services
```

### 6. Service Management

```bash
# Start and enable Samba services
sudo systemctl enable --now smb nmb

# Verify services are running
sudo systemctl status smb
sudo systemctl status nmb

# If you need to restart the services
sudo systemctl restart smb nmb
```

Service names explained:

- `smb.service`: The main Samba daemon
- `nmb.service`: The NetBIOS name service daemon
- Both services are needed for full Windows compatibility

Note: In Rocky Linux 9.5, the service names are `smb` and `nmb`. This might differ from documentation you find online that references `smbd` and `nmbd`. The correct names for Rocky Linux (and RHEL-based systems) are:

- Use `smb.service` (not smbd.service)
- Use `nmb.service` (not nmbd.service)

You can check the service logs if needed:

```bash
# Check Samba service logs
sudo journalctl -u smb
sudo journalctl -u nmb
```

### 7. Windows Client Connection

1. Open File Explorer
2. In the address bar, type: `\\192.168.20.6\paperless_consume`
3. Windows should connect to the share

### 8. Windows Network Drive Mapping

To create a permanent connection to the share in Windows:

1. Open File Explorer
2. Right-click on "This PC"
3. Select "Map network drive..."
4. Choose a drive letter
5. Enter the path: `\\192.168.20.6\paperless_consume`
6. Check "Reconnect at sign-in"
7. Click "Finish"

This will create a persistent drive mapping that automatically reconnects when you log into Windows.

### Troubleshooting

#### SELinux Issues

```bash
# Monitor SELinux denials
sudo tail -f /var/log/audit/audit.log | grep denied

# Search for Samba-related SELinux denials
sudo ausearch -m AVC -ts recent | grep samba

# Generate potential policy fixes
sudo ausearch -m AVC -ts recent | audit2allow -a

# Check SELinux status
sestatus

# View Samba-related SELinux booleans
getsebool -a | grep samba

# Check directory context
ls -ldZ /mnt/paperless_storage_ssd/consume
```

#### Network Connectivity

```bash
# From Rocky Linux
ping 192.168.1.114

# From Windows
ping 192.168.20.6
```

#### Samba Logs

```bash
# View Samba logs
sudo tail -f /var/log/samba/log.*

# Check listening ports
sudo netstat -tulpn | grep smbd
```

### Security Notes

1. The current configuration allows guest access for testing purposes
2. For production environments, consider:
   - Implementing user authentication
   - Restricting access to specific IP addresses
   - Regular security audits
   - Monitoring access logs
3. When using symlinks:
   - Ensure both the symlink and target directory have correct SELinux contexts
   - Monitor SELinux audit logs for any denied operations
   - Consider using bind mounts instead of symlinks if experiencing issues

### Additional Resources

- [Rocky Linux Documentation](https://docs.rockylinux.org)
- [Samba Documentation](https://www.samba.org/samba/docs/)
- [SELinux User's and Administrator's Guide](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/9/html/using_selinux/index)
