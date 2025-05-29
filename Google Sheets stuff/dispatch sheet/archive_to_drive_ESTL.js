/*
 * ESTL Dispatch Sheet Archive to Google Drive
 *
 * This script exports the current sheet as a PDF and saves it to the 'PaperlessUploads'
 * folder in Google Drive. Files are processed by rclone and moved to Paperless.
 *
 * Workflow: Sheet → PDF → PaperlessUploads → rclone moves to Paperless via an every 5 minute cron job on the host.
 */

function archiveToDriveESTL(targetSheet) {
  // Ensure all spreadsheet operations are complete before proceeding
  SpreadsheetApp.flush();

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Validate and get the sheet with better error handling
  var sheet;
  try {
    if (targetSheet && typeof targetSheet.getRange === 'function') {
      // targetSheet is a valid Sheet object
      sheet = targetSheet;
      Logger.log('📋 Using provided target sheet: ' + sheet.getName());
    } else if (targetSheet && typeof targetSheet === 'string') {
      // targetSheet is a sheet name string
      sheet = ss.getSheetByName(targetSheet);
      if (!sheet) {
        throw new Error('Sheet not found: ' + targetSheet);
      }
      Logger.log('📋 Using sheet by name: ' + sheet.getName());
    } else {
      // Fall back to active sheet
      sheet = ss.getActiveSheet();
      Logger.log('📋 Using active sheet: ' + sheet.getName());
    }
  } catch (sheetError) {
    Logger.log('❌ Sheet validation error: ' + sheetError.toString());
    // Try to fall back to active sheet
    try {
      sheet = ss.getActiveSheet();
      Logger.log('📋 Fallback to active sheet: ' + sheet.getName());
    } catch (fallbackError) {
      Logger.log('❌ Cannot get any valid sheet: ' + fallbackError.toString());
      return; // Exit if we can't get a valid sheet
    }
  }

  // Date set with format in EST (NYC) used in PDF name
  var sheetdate = sheet.getRange('A1').getValue();
  var period;
  var url = ss.getUrl();

  if (sheetdate instanceof Date) {
    period = Utilities.formatDate(sheetdate, 'GMT+5', 'yyyy.MM.dd');
  } else {
    period = sheetdate.toString();
  }
  // Remove the trailing 'edit' from the url
  url = url.replace(/edit$/, '');

  // Additional parameters for exporting the sheet as a pdf
  var url_ext =
    'export?exportFormat=pdf&format=pdf' +
    '&range=A1:AT263' +
    '&size=1' +
    '&portrait=false' +
    '&fitw=true' +
    '&sheetnames=false&printtitle=false&pagenumbers=false' +
    '&gridlines=false' +
    '&fzr=false' +
    '&gid=' +
    sheet.getSheetId();

  var token = ScriptApp.getOAuthToken();

  var response = UrlFetchApp.fetch(url + url_ext, {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });

  // Use the same naming convention as the working archive() function
  var blob = response.getBlob().setName(ss.getName() + ' - ' + period + '.pdf');

  try {
    // Save the PDF to the 'PaperlessUploads' folder in Google Drive
    var folder = DriveApp.getFoldersByName('PaperlessUploads').hasNext()
      ? DriveApp.getFoldersByName('PaperlessUploads').next()
      : DriveApp.createFolder('PaperlessUploads');

    Logger.log('📁 Creating PDF file: ' + blob.getName());
    var createdFile = folder.createFile(blob);
    Logger.log('✅ PDF file created successfully in PaperlessUploads folder');
    Logger.log('   File ID: ' + createdFile.getId());

    // Add a small delay to ensure file is fully written before rclone might pick it up
    Utilities.sleep(1000);
    Logger.log('📤 File ready for rclone processing');
  } catch (driveError) {
    Logger.log('❌ Google Drive save failed: ' + driveError.toString());

    // Fallback method: Send via email like the working archive() function
    try {
      var email = 'backoffice@ee-jay.com';
      var subject = 'ESTL Dispatch Sheet for Archiving ' + period;
      var body =
        'ESTL Dispatch Sheet Archive (sent via fallback method due to Drive error)';
      GmailApp.sendEmail(email, subject, body, { attachments: [blob] });
      Logger.log('📧 PDF sent via email fallback');
    } catch (emailError) {
      Logger.log('❌ Email fallback also failed: ' + emailError.toString());
    }
  }
}
