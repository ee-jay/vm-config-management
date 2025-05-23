function archiveToDriveESTL(targetSheet) {
  // Ensure all spreadsheet operations are complete before proceeding
  SpreadsheetApp.flush();

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  // Use the passed sheet parameter, or fall back to active sheet if not provided
  var sheet = targetSheet || ss.getActiveSheet();
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
    // Primary method: Save the PDF to the 'PaperlessUploads' folder in Google Drive
    var folder = DriveApp.getFoldersByName('PaperlessUploads').hasNext()
      ? DriveApp.getFoldersByName('PaperlessUploads').next()
      : DriveApp.createFolder('PaperlessUploads');

    folder.createFile(blob);

    // Add a small delay to ensure file is fully written before rclone might pick it up
    Utilities.sleep(1000);

    Logger.log('PDF saved to Google Drive PaperlessUploads folder.');
  } catch (driveError) {
    Logger.log('Google Drive save failed: ' + driveError.toString());

    // Fallback method: Send via email like the working archive() function
    try {
      var email = 'backoffice@ee-jay.com';
      var subject = 'ESTL Dispatch Sheet for Archiving ' + period;
      var body = 'ESTL Dispatch Sheet Archive (sent via fallback method)';
      GmailApp.sendEmail(email, subject, body, { attachments: [blob] });
      Logger.log('PDF sent via email fallback');
    } catch (emailError) {
      Logger.log('Email fallback also failed: ' + emailError.toString());
    }
  }
}
