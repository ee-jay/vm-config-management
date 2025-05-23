# Google Drive to Paperless: rclone Sync Guide

This guide explains how to automatically sync PDFs from a Google Drive folder to your Paperless server's consume directory using rclone. This method is secure, reliable, and works behind firewalls.

---

## 1. Prepare Google Drive Folder

- Create a folder in Google Drive (e.g., `PaperlessUploads`).
- Save or export your PDFs to this folder (e.g., using a Google Apps Script).

## 2. Install rclone on Your Linux Server

- Download and install rclone:
  ```bash
  curl https://rclone.org/install.sh | sudo bash
  ```

## 3. Configure rclone for Google Drive (Headless Setup)

- Run:
  ```bash
  rclone config
  ```
- Choose `n` for a new remote. Name it (e.g., `gdrive`).
- Select `drive` for Google Drive.
- Leave `client_id` and `client_secret` blank (or follow rclone docs to create your own for higher limits).
- For `scope`, enter `1` for full access.
- When prompted for authentication, rclone will display a command like:
  ```
  rclone authorize "drive" "<some_token>"
  ```
- Copy this command and run it on a machine with a web browser (e.g., your Windows PC with rclone installed).
- Complete the Google login and copy the resulting token string.
- Paste the token back into your Linux server's rclone config prompt.
- Complete the rest of the prompts (accept defaults unless you use Team Drives).

## 4. Test rclone Connection

- List your Google Drive files:
  ```bash
  rclone ls gdrive:
  ```
- List your uploads folder:
  ```bash
  rclone ls gdrive:PaperlessUploads
  ```

## 5. Sync Google Drive Folder to Paperless Consume Directory

- Run:
  ```bash
  rclone sync gdrive:PaperlessUploads /mnt/paperless_storage_ssd/consume
  ```
- Replace `/mnt/paperless_storage_ssd/consume` with your actual Paperless consume directory if different.

## 6. Automate with Cron

- Edit your crontab:
  ```bash
  crontab -e
  ```
- Add this line to sync every 5 minutes:
  ```
  */5 * * * * /usr/bin/rclone sync gdrive:PaperlessUploads /mnt/paperless_storage_ssd/consume
  ```
- (Optional) Log output:
  ```
  */5 * * * * /usr/bin/rclone sync gdrive:PaperlessUploads /mnt/paperless_storage_ssd/consume >> /var/log/rclone-sync.log 2>&1
  ```

## 7. Test the Workflow

- Place a PDF in the `PaperlessUploads` folder in Google Drive.
- Wait for the next cron run (or run the sync manually).
- Confirm the file appears in your Paperless consume directory and is processed.

---

## Notes

- Make sure the user running the cron job has write permissions to the consume directory.
- You can adjust the sync interval in cron as needed.
- For more advanced rclone usage, see [rclone.org](https://rclone.org/).

---

**Result:**
Your Google Drive folder is now automatically synced to your Paperless server for seamless document ingestion!
