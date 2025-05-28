function cleanupPaperlessUploads() {
  // Clean up the PaperlessUploads folder by deleting all files
  // This runs nightly to prevent accumulation of files that rclone can't delete
  // (especially shared files owned by others)

  const folderName = 'PaperlessUploads';
  let deletedCount = 0;
  let errorCount = 0;
  let errors = [];

  try {
    // Find the PaperlessUploads folder
    const folders = DriveApp.getFoldersByName(folderName);

    if (!folders.hasNext()) {
      Logger.log('PaperlessUploads folder not found');
      return;
    }

    const folder = folders.next();
    const files = folder.getFiles();

    Logger.log('Starting cleanup of PaperlessUploads folder...');

    // Delete all files in the folder
    while (files.hasNext()) {
      const file = files.next();
      const fileName = file.getName();

      try {
        // Move file to trash (works for shared files if you have edit access)
        file.setTrashed(true);
        deletedCount++;
        Logger.log(`✅ Deleted: ${fileName}`);

        // Small delay to avoid hitting API limits
        Utilities.sleep(100);
      } catch (fileError) {
        errorCount++;
        const errorMsg = `❌ Could not delete: ${fileName} - ${fileError.toString()}`;
        Logger.log(errorMsg);
        errors.push(errorMsg);
      }
    }

    // Log summary
    Logger.log(`\n=== Cleanup Summary ===`);
    Logger.log(`Files deleted: ${deletedCount}`);
    Logger.log(`Errors: ${errorCount}`);

    if (errors.length > 0) {
      Logger.log(`\nError details:`);
      errors.forEach(error => Logger.log(error));
    }

    // Optional: Send email notification if there were errors
    if (errorCount > 0) {
      sendCleanupNotification(deletedCount, errorCount, errors);
    }
  } catch (mainError) {
    Logger.log(`❌ Main cleanup error: ${mainError.toString()}`);

    // Send error notification
    try {
      GmailApp.sendEmail(
        'backoffice@ee-jay.com',
        'PaperlessUploads Cleanup Failed',
        `The nightly cleanup of PaperlessUploads folder failed with error:\n\n${mainError.toString()}`
      );
    } catch (emailError) {
      Logger.log(`Failed to send error notification: ${emailError.toString()}`);
    }
  }
}

function sendCleanupNotification(deletedCount, errorCount, errors) {
  // Send email notification about cleanup results (only if there were errors)
  try {
    const subject = `PaperlessUploads Cleanup Report - ${errorCount} Errors`;
    const body = `
Nightly cleanup of PaperlessUploads folder completed:

✅ Files successfully deleted: ${deletedCount}
❌ Files with errors: ${errorCount}

${errorCount > 0 ? '\nError details:\n' + errors.join('\n') : ''}

This is an automated notification from the PaperlessUploads cleanup script.
    `.trim();

    GmailApp.sendEmail('backoffice@ee-jay.com', subject, body);
    Logger.log('Cleanup notification sent');
  } catch (emailError) {
    Logger.log(`Failed to send cleanup notification: ${emailError.toString()}`);
  }
}
