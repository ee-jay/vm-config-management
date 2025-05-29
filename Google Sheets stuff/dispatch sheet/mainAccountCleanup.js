/**
 * Cleanup script for the main account (sheets.eejay@gmail.com)
 * This removes files from the main PaperlessUploads folder after rclone processes them
 *
 * When files are removed from here, they get "kicked back" to the other users' drives
 * where their cleanup scripts can handle them
 */

/**
 * Check if a file should be protected from deletion
 * Returns true if the file should NOT be deleted
 */
function isProtectedFile(file) {
  var fileName = file.getName().toLowerCase();
  var mimeType = file.getBlob().getContentType();

  // Protect Google Apps Script files
  if (
    mimeType === 'application/vnd.google-apps.script' ||
    fileName.endsWith('.gs') ||
    fileName.endsWith('.js') ||
    fileName.includes('script') ||
    fileName.includes('.clasp')
  ) {
    return true;
  }

  // Protect Google Sheets, Docs, etc.
  if (mimeType.startsWith('application/vnd.google-apps.')) {
    return true;
  }

  return false;
}

/**
 * Safe cleanup that only removes files older than specified minutes
 * This ensures rclone has had time to process the files before deletion
 */
function cleanupOldFilesFromMain(minutesOld) {
  if (!minutesOld || minutesOld < 1) {
    minutesOld = 9; // Default to 9 minutes (rclone runs every 5 minutes)
  }

  try {
    Logger.log(
      '🔍 Starting age-based cleanup of main PaperlessUploads folder...'
    );
    Logger.log('⏰ Will delete files older than ' + minutesOld + ' minutes');

    var folders = DriveApp.getFoldersByName('PaperlessUploads');

    if (!folders.hasNext()) {
      Logger.log('📁 PaperlessUploads folder not found');
      return;
    }

    var paperlessFolder = folders.next();
    var files = paperlessFolder.getFiles();
    var cutoffDate = new Date();
    cutoffDate.setMinutes(cutoffDate.getMinutes() - minutesOld);

    var deletedCount = 0;
    var skippedCount = 0;
    var protectedCount = 0;
    var totalFiles = 0;

    Logger.log('📅 Cutoff time: ' + cutoffDate.toString());

    while (files.hasNext()) {
      var file = files.next();
      var fileName = file.getName();
      var fileDate = file.getDateCreated();
      totalFiles++;

      // Check if file is protected (script files, Google Workspace files, etc.)
      if (isProtectedFile(file)) {
        protectedCount++;
        Logger.log('🛡️ Protected file (skipped): ' + fileName);
        continue;
      }

      if (fileDate < cutoffDate) {
        Logger.log(
          '📄 Found old file: ' + fileName + ' (created: ' + fileDate + ')'
        );

        try {
          file.setTrashed(true);
          Logger.log('🗑️ Moved to trash (old file): ' + fileName);
          deletedCount++;
        } catch (deleteError) {
          Logger.log(
            '❌ Failed to delete old file ' +
              fileName +
              ': ' +
              deleteError.toString()
          );
        }
      } else {
        skippedCount++;
        Logger.log(
          '⏭️ Skipped recent file: ' + fileName + ' (created: ' + fileDate + ')'
        );
      }
    }

    Logger.log('📊 Age-based Main Cleanup Summary:');
    Logger.log('   Total files checked: ' + totalFiles);
    Logger.log('   Old files deleted: ' + deletedCount);
    Logger.log('   Recent files kept: ' + skippedCount);
    Logger.log('   Protected files: ' + protectedCount);
  } catch (error) {
    Logger.log('❌ Error in cleanupOldFilesFromMain: ' + error.toString());
  }
}
