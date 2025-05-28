- Scripts set up for ESTL & MSP dispatch sheets to save pdfs to gdrive instead of emailing. once in this drive, rclone runs via a cron job on the doc server host every 5 minutes using the rclone move command, which removes the file from gdrive, moving it to the paperless consume directory on the host(/mnt/paperless_storage_ssd/consume).

  - scripts that run under different emails -- make sure that the account has access to the google drive folder. Dispatch sheeets weren't making it through because the email sending them were the dispatch gmails. I had to add those emails as editors to the gdrive folder. The files were also not being deleted because the scripts that send the file over were running under other emails. I fixed it and they now set ownership of the pdfs they creat to sheets.eejay@gmail.com before sending the pdf.

- workflows to tag dispatch sheets & transfer books are based on file names including strings like "ESTL Dispatch SHeet". Paperless finds keywords for nearly all shipper tags in these files so each one has 2 workflows. 1. at time of consumption, with string match of "ESTL Dispatch SHeet", it sets the 'ESTL' and 'Dispatch sheet' tags, which are needed to trigger the step 2 flows. These run after the document is added and remove ALL tags then reassign the 'ESTL' and "dispatch sheet' tags.

# Todo

---

# Paperless-ngx Complete Setup Elements

## 🐳 **Core Infrastructure**

- **`docker-compose.yml`** - Complete Paperless-ngx stack (Redis, PostgreSQL, Gotenberg, Tika)
- **`paperless.env.template`** - Environment variables template for configuration

## 📥 **Document Ingestion Pipeline**

- **Google Drive Integration** - See `rclone/gdrive-rclone-sync-to-doc.md`
  - Cron job runs every 5 minutes: `rclone move gdrive:PaperlessUploads /mnt/paperless_storage_ssd/consume`
  - Google Apps Scripts save PDFs to Google Drive folder
- **Google Apps Scripts** - See `Google Sheets stuff/` directory
  - `archive_to_drive_ESTL.js` - Creates PDFs and uploads to Google Drive
  - `cleanup_paperless_uploads.js` - Cleans up processed files

## 🏷️ **Document Processing & Workflows**

- **Dispatch Sheet Workflows** - See `paperless setup notes.md`
  - ESTL & MSP dispatch sheets auto-tagged based on filename strings
  - Two-stage workflow: initial tagging → tag cleanup → final tagging
- **Transfer Book Workflows** - See `xfer book workflow.md`
- **Regex Patterns** - See `paperless regex guide.md`

## 💾 **Backup System**

- **Dropbox Backup Plan** - See `rclone/dropbox-backup-plan.md`
  - Daily automated backups of media, config, and database
  - 4 working scripts in `/opt/scripts/` on doc-vm
  - Retention: 7 days local, 30 days Dropbox

## 🔧 **Utilities & Scripts**

- **`send pdf`** - PDF sending utility
- **`dispatch_sheet.bat`** - Batch file for dispatch processing
- **`Notes`** - Quick reference notes

## 📚 **Documentation**

- **`claude initial transcript.md`** - Setup conversation history
- **`paperless setup notes.md`** - Workflow configuration notes

## 🗄️ **Storage**

- **External SSD Mount** - `/mnt/paperless_storage_ssd/`
  - Media files, consume directory, export directory
  - Mounted via Proxmox external storage

This represents a complete document management pipeline from creation → ingestion → processing → backup.
