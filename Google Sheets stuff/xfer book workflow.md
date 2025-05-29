# Transfer Book Workflow Brainstorm

## Background

- Each sheet in the Google Sheets document represents a transfer book page for a specific day (named like 'Tue 4/24', 'Wed 4/23', etc).
- Cell C1 always contains the current date for that sheet.
- Cell S201 is used as a flag (TRUE/FALSE) to indicate if the sheet has already been archived by the script.
- The current script loops through all sheets, and if the date in C1 is more than 2 weeks old and S201 is not TRUE, it exports the sheet as a PDF and emails it. After archiving, it sets S201 to TRUE to avoid re-archiving.

## Pain Points

- Reliance on in-sheet data (S201 flag) is fragile: many users, volatile data, and prone to human error.
- The process is currently email-based, but we want to move to saving PDFs directly to a Google Drive folder for Paperless ingestion.
- Sheet names and structure are consistent, but the flagging mechanism is not ideal.

## Goals

- Archive each sheet as a PDF to a Google Drive folder (e.g., 'PaperlessUploads') for Paperless.
- Avoid re-archiving the same sheet, but **without** relying on modifying the sheet data itself.
- Make the process robust against user edits and accidental data changes.

## Brainstorm: Alternative Approaches

### 1. Use an External Log

- Maintain a log (e.g., in a separate Google Sheet or Drive file) of sheet names/dates that have already been archived.
  - log already exists, kind of, on Order_Archive sheets. Could modify these to add true/false column to track archiving progress.
- The script checks this log before archiving a sheet.
- Pros: No changes to the volatile data in the main sheet. Persistent across script runs.
- Cons: Slightly more complex, but much more robust.

~~### 2. Use File Existence in Google Drive~~

- files are being removed automatically by rclone move command.
- Before archiving, check if a PDF with the expected name already exists in the target Google Drive folder.
- If it exists, skip archiving that sheet.
- Pros: No external log needed, no changes to the main sheet, simple logic.
- Cons: Relies on consistent naming, but that's already part of the workflow.

### 3. Use Script Properties/Cache

- Store a list of archived sheet names/dates in Script Properties or Cache.
- Pros: No changes to the sheet, no external files.
- Cons: May not persist forever (cache can expire), but Script Properties are persistent.

~~### 4. Timestamp in Sheet Name~~

- not a viable option
- Encode the archive status in the sheet name (e.g., add a suffix like '[ARCHIVED]').
- Pros: Visible to users, no extra files.
- Cons: Sheet names become cluttered, users may accidentally edit/remove the suffix.

---

## Next Steps

- Discuss and select the best approach for your workflow.
- Once decided, update the script to implement the new logic and target the Google Drive folder for Paperless.

---

**Please add your thoughts or let me know which approach you'd like to explore further!**
