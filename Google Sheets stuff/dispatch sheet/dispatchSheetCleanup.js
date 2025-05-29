/**
 * Combined script to find and clean up dispatch sheet PDFs directly from root directory
 * This eliminates the PaperlessUploads folder confusion and simplifies the workflow
 *
 * This script should be run by each user on their own Google Drive
 * to clean up dispatch sheet PDFs after they've been processed by paperless
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
 * Finds and deletes dispatch sheet PDFs directly from the root directory
 * Use this for immediate cleanup without using PaperlessUploads folder
 */
function cleanupDispatchSheets() {
  try {
    Logger.log(
      '🔍 Starting cleanup of dispatch sheet PDFs from root directory...'
    );

    var rootFolder = DriveApp.getRootFolder();
    var files = rootFolder.getFiles();

    var deletedCount = 0;
    var totalFiles = 0;
    var totalPDFs = 0;
    var dispatchSheetPDFs = 0;

    while (files.hasNext()) {
      var file = files.next();
      var fileName = file.getName();
      totalFiles++;

      // Check if it's a PDF first
      if (file.getMimeType() === 'application/pdf') {
        totalPDFs++;

        // Check if it contains 'Dispatch Sheet' (case-insensitive)
        if (fileName.toLowerCase().indexOf('dispatch sheet') !== -1) {
          dispatchSheetPDFs++;
          Logger.log('📄 Found dispatch sheet PDF: ' + fileName);

          try {
            file.setTrashed(true);
            Logger.log('🗑️ Moved to trash: ' + fileName);
            deletedCount++;
          } catch (deleteError) {
            Logger.log(
              '❌ Failed to delete file ' +
                fileName +
                ': ' +
                deleteError.toString()
            );
          }
        }
      }
    }

    Logger.log('📊 Cleanup Summary:');
    Logger.log('   Total files checked: ' + totalFiles);
    Logger.log('   Total PDFs found: ' + totalPDFs);
    Logger.log('   Dispatch sheet PDFs found: ' + dispatchSheetPDFs);
    Logger.log('   Files deleted: ' + deletedCount);
  } catch (error) {
    Logger.log(
      '❌ Error in cleanupDispatchSheetsFromRoot: ' + error.toString()
    );
  }
}

/**
 * Diagnostic function to show all dispatch sheet PDFs in root directory
 * Use this to see what files would be affected before running cleanup
 */
function listDispatchSheetsInRoot() {
  try {
    Logger.log('🔍 Listing all dispatch sheet PDFs in root directory...');

    var rootFolder = DriveApp.getRootFolder();
    var files = rootFolder.getFiles();

    var dispatchSheetPDFs = [];
    var totalFiles = 0;

    while (files.hasNext()) {
      var file = files.next();
      var fileName = file.getName();
      totalFiles++;

      // Check if it's a PDF and contains 'Dispatch Sheet'
      if (
        file.getMimeType() === 'application/pdf' &&
        fileName.toLowerCase().indexOf('dispatch sheet') !== -1
      ) {
        dispatchSheetPDFs.push({
          name: fileName,
          id: file.getId(),
          created: file.getDateCreated(),
          size: file.getSize(),
          owner: file.getOwner().getEmail(),
        });
      }
    }

    Logger.log(
      '📊 Found ' +
        dispatchSheetPDFs.length +
        ' dispatch sheet PDFs out of ' +
        totalFiles +
        ' total files:'
    );

    dispatchSheetPDFs.forEach(function (fileInfo, index) {
      Logger.log('  ' + (index + 1) + '. ' + fileInfo.name);
      Logger.log('     📅 Created: ' + fileInfo.created);
      Logger.log('     👤 Owner: ' + fileInfo.owner);
      Logger.log('     💾 Size: ' + fileInfo.size + ' bytes');
      Logger.log('     🆔 ID: ' + fileInfo.id);
      Logger.log('');
    });
  } catch (error) {
    Logger.log('❌ Error in listDispatchSheetsInRoot: ' + error.toString());
  }
}
