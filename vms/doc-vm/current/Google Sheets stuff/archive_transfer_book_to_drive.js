function archiveTransferBookToDrive() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var archiveSheet = ss.getSheetByName('Order_Archive');
  var archiveData = archiveSheet.getDataRange().getValues();
  var archiveStatusCol = 32; // Column AF (1-based index)
  var archiveDateCol = 2; // Column B (1-based index) is 'Date' in your CSV

  // Build a map of date string to all row indices (1-based for setValue)
  var dateToRowsMap = {};
  for (var i = 1; i < archiveData.length; i++) {
    // skip header
    var archiveDate = archiveData[i][archiveDateCol - 1];
    if (archiveDate instanceof Date) {
      var archiveDateStr = Utilities.formatDate(
        archiveDate,
        ss.getSpreadsheetTimeZone(),
        'yyyy.MM.dd'
      );
      if (!dateToRowsMap[archiveDateStr]) {
        dateToRowsMap[archiveDateStr] = [];
      }
      dateToRowsMap[archiveDateStr].push(i + 1); // 1-based row index
    }
  }

  // Batch read archive status column (skip header)
  var archiveStatusArr = archiveSheet
    .getRange(2, archiveStatusCol, archiveData.length - 1, 1)
    .getValues();

  var now = new Date();
  var twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Find indices for 'Engine' and the first sheet whose name contains "MASTER" (case-insensitive)
  var startIdx = -1;
  var endIdx = -1;
  for (var i = 0; i < sheets.length; i++) {
    var name = sheets[i].getName();
    if (name === 'Engine') startIdx = i;
    // Fuzzy match: end at first sheet whose name contains 'MASTER' (case-insensitive)
    if (name.toUpperCase().indexOf('MASTER') !== -1) {
      endIdx = i;
      break;
    }
  }
  // --- LOGGING: Engine/MASTER boundary info ---
  // Logger.log('Engine index: ' + startIdx + ', MASTER index: ' + endIdx);
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    // Logger.log('Could not find proper Engine/MASTER boundaries.');
    return;
  }

  // Only process sheets after 'Engine' and before 'MASTER'
  for (var s = startIdx + 1; s < endIdx; s++) {
    var sheet = sheets[s];
    var sheetName = sheet.getName();
    // --- LOGGING: Sheet being checked ---
    // Logger.log('Checking sheet: ' + sheetName);
    var sheetDate = sheet.getRange('C1').getValue();
    if (!(sheetDate instanceof Date)) {
      // Logger.log('Sheet ' + sheetName + ' C1 is not a date, skipping.');
      continue;
    }
    if (sheetDate > twoWeeksAgo) {
      // Logger.log('Sheet ' + sheetName + ' is not older than 2 weeks, skipping.');
      continue;
    }

    var sheetDateStr = Utilities.formatDate(
      sheetDate,
      ss.getSpreadsheetTimeZone(),
      'yyyy.MM.dd'
    );
    // --- LOGGING: Date string and archive row info ---
    // Logger.log('Sheet ' + sheetName + ' date string: ' + sheetDateStr);
    var archiveRows = dateToRowsMap[sheetDateStr] || [];
    // Logger.log('Found ' + archiveRows.length + ' archive rows for date ' + sheetDateStr);
    if (archiveRows.length === 0) {
      // Logger.log('No matching archive rows for ' + sheetName + ', skipping.');
      continue;
    }

    // Check if all rows are already archived (using batch array)
    var allArchived = archiveRows.every(function (row) {
      var status = archiveStatusArr[row - 2][0]; // row-2 because we skipped header
      return status === true || status === 'TRUE';
    });
    if (allArchived) {
      // Logger.log('All archive rows for ' + sheetName + ' already archived, skipping.');
      continue;
    }

    // --- LOGGING: Archiving action ---
    // Logger.log('Archiving sheet: ' + sheetName + ' for date ' + sheetDateStr);
    // Export as PDF
    var url = ss.getUrl().replace(/edit$/, '');
    var url_ext =
      'export?exportFormat=pdf&format=pdf' +
      '&size=letter' +
      '&portrait=false' +
      '&fitw=true' +
      '&sheetnames=false&printtitle=false&pagenumbers=false' +
      '&gridlines=false' +
      '&fzr=false' +
      '&gid=' +
      sheet.getSheetId();
    var token = ScriptApp.getOAuthToken();
    var response = UrlFetchApp.fetch(url + url_ext, {
      headers: { Authorization: 'Bearer ' + token },
      muteHttpExceptions: true,
    });
    if (response.getResponseCode() !== 200) {
      // Logger.log('Export failed for sheet: ' + sheetName + ' (' + sheetDateStr + ')');
      // Logger.log(response.getContentText());
    }
    var blob = response
      .getBlob()
      .setName(sheetDateStr + ' ESTL Transfer Book.pdf');

    // Save to PaperlessUploads
    var folder = DriveApp.getFoldersByName('PaperlessUploads').hasNext()
      ? DriveApp.getFoldersByName('PaperlessUploads').next()
      : DriveApp.createFolder('PaperlessUploads');
    folder.createFile(blob);
    // --- LOGGING: PDF saved ---
    // Logger.log('Saved PDF for ' + sheetName + ' to PaperlessUploads.');

    // Mark all rows as archived in the batch array
    archiveRows.forEach(function (row) {
      archiveStatusArr[row - 2][0] = true; // row-2 because we skipped header
      // Logger.log('Marked row ' + row + ' as archived for date ' + sheetDateStr + ' (batch)');
    });
    // Logger.log('Finished archiving sheet: ' + sheetName + ' for date ' + sheetDateStr);
  }

  // --- LOGGING: Batch update complete ---
  archiveSheet
    .getRange(2, archiveStatusCol, archiveStatusArr.length, 1)
    .setValues(archiveStatusArr);
  SpreadsheetApp.flush();
  // Logger.log('Batch update of archive status complete.');
}
