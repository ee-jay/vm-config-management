# Adding External Storage to a Proxmox VM

This guide explains how to add an external drive to a Proxmox VM, specifically for use with containerized applications.

## Initial Storage Setup in Proxmox GUI

1. In the Proxmox web interface, go to Datacenter → Storage
2. Click "Add" → "Directory"
3. Fill in:
   - ID: brawny_lad (or your preferred name)
   - Directory: /mnt/pve/brawny_lad
   - Content: Disk image, Containers
   - Enable: Yes

After adding, you should see the storage in `pvesm status` with details like:

```
Name         Type     Status     Total         Used       Available    %
brawny_lad   dir     active     1921724676    64         1824032552  0.00%
```

## On the Proxmox Host

1. First, identify and mount the external drive:

```bash
# Check the drive status
lsblk

# Check storage status (must be root)
pvesm status

# Verify the mount
mount | grep brawny_lad
# Should show something like:
# /dev/sdb1 on /mnt/pve/brawny_lad type ext4 (rw,relatime)
```

The storage directory should contain standard Proxmox directories:

- images/
- lost+found/
- private/
- snippets/
- template/

2. Create a new disk image in the storage:

```bash
qemu-img create -f raw /mnt/pve/brawny_lad/images/101/vm-101-disk-1.raw 1800G
```

3. Add the disk to VM configuration (`/etc/pve/qemu-server/101.conf`):

```bash
virtio1: brawny_lad:101/vm-101-disk-1.raw
```

Note: Use the storage ID format (brawny_lad:101/...), not the full path (/mnt/pve/...)

4. Stop and start the VM to apply changes:

```bash
qm stop 101
qm start 101
```

## Inside the VM

1. Identify the new disk:

```bash
lsblk
# You should see a new device like:
# vda         252:0    0  1.8T  0 disk
```

2. Format the new disk:

```bash
sudo mkfs.ext4 /dev/vda
```

3. Create a clean mount point:

```bash
sudo mkdir -p /mnt/paperless_storage_ssd
```

4. Add to fstab for persistent mounting:

```bash
echo "/dev/vda    /mnt/paperless_storage_ssd    ext4    defaults    0 0" | sudo tee -a /etc/fstab
```

5. Mount and set permissions:

```bash
sudo mount -a
# If you see systemd hint, run:
sudo systemctl daemon-reload
sudo mount -a

# Set appropriate permissions for your service user
sudo chown -R your_user:your_user /mnt/paperless_storage_ssd
```

6. Verify the mount:

```bash
df -h
# Should show something like:
# /dev/vda             1.8T   28K  1.7T   1% /mnt/paperless_storage_ssd
```

7. Create service-specific directories:

```bash
# For paperless-ngx
mkdir -p /mnt/paperless_storage_ssd/paperless/{data,media,consume}
```

## Docker Configuration

For containerized applications, use the mount point directly in your docker-compose.yml:

```yaml
version: '3.8'
services:
  paperless:
    image: ghcr.io/paperless-ngx/paperless-ngx:latest
    volumes:
      - /mnt/paperless_storage_ssd/paperless/data:/usr/src/paperless/data
      - /mnt/paperless_storage_ssd/paperless/media:/usr/src/paperless/media
      - /mnt/paperless_storage_ssd/paperless/consume:/usr/src/paperless/consume
```

## Notes

- Replace `101` with your VM ID
- Replace `brawny_lad` with your storage name
- Replace `your_user` with the appropriate username
- The device name (vda, vdb, etc.) may vary depending on your VM configuration
- Always run storage management commands as root on the Proxmox host
- If you get permission errors with `pvesm status`, make sure to use `su` or `sudo -i`
- Keep mount points clean and use subdirectories for specific services
- Avoid unnecessary symlinks unless specifically required
