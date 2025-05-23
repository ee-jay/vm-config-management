function archiveToDriveESTL() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
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

  var blob = response.getBlob().setName(ss.getName() + ' - ' + period + '.pdf');

  // Save the PDF to the 'PaperlessUploads' folder in Google Drive
  var folder = DriveApp.getFoldersByName('PaperlessUploads').hasNext()
    ? DriveApp.getFoldersByName('PaperlessUploads').next()
    : DriveApp.createFolder('PaperlessUploads');

  folder.createFile(blob);
  Logger.log('PDF saved to Google Drive PaperlessUploads folder.');
}
