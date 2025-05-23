/* HOW IT WORKS(google doc https://docs.google.com/document/d/1BTHESU9TVTp-fTmxXx4Gc5oNUv5MFvA2udlQSPnj6_U/edit?usp=sharing)
1. Script generates email and sends it to gmail.  rule in gmail inbox auto-forwards to backoffice@ee-jay.com
2.  The loop needs to cycle through every sheet and if the date in cell C1 is more than 2 weeks earlier than today AND Cell B2 is not true it should run the script.  
see test version here: https://script.google.com/u/0/home/projects/1Gb2mm6x_XBz0o1Wcg9Zwp9SAA_fnZs7dsB2dv4omhLWmdK4dArRN46tB/edit
*/

var ss = SpreadsheetApp.getActiveSpreadsheet();
var sheets = ss.getSheets();
let sheetCounter = '';
var sheet = '';

function loopSheets() {
  for (var i = 2; i < sheets.length; i++) {
    sheetCounter = sheets[i];

    var val = sheetCounter.getRange('C1').getValue();
    var val2 = sheetCounter.getRange('S201').getValue();

    if (val < new Date() - 2 * 168 * 60 * 60 * 1000 && !val2) {
      sheet = sheetCounter.getSheetId();
      createPDF(sheet, val);
      sheetCounter.getRange('S201').setValue(true);
    } else if (val < new Date() - 2 * 168 * 60 * 60 * 1000 && val2) {
      continue;
    } else {
      break;
    }
  }
}

function createPDF(e, val) {
  var sheetDateToString = Utilities.formatDate(
    val,
    Session.getScriptTimeZone(),
    'yyyy.MM.dd'
  );

  var url = ss.getUrl();

  //remove the trailing 'edit' from the url
  url = url.replace(/edit$/, '');

  //additional parameters for exporting the sheet as a pdf
  const url_ext =
    'export?exportFormat=pdf&format=pdf' + //export as pdf
    //below parameters are optional...
    '&size=letter' + //paper size
    '&portrait=false' + //orientation, false for landscape
    '&fitw=true' + //fit to width, false for actual size
    '&sheetnames=false&printtitle=false&pagenumbers=false' + //hide optional headers and footers
    '&gridlines=false' + //hide gridlines
    '&fzr=false' + //do not repeat row headers (frozen rows) on each page
    '&gid=' +
    e; //the sheet's Id

  var token = ScriptApp.getOAuthToken();

  var response = UrlFetchApp.fetch(url + url_ext, {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });

  var blob = response
    .getBlob()
    .setName(sheetDateToString + ' ESTL Transfer Book' + '.pdf');

  //from here you should be able to use and manipulate the blob to send and email or create a file per usual.
  const email = 'backoffice@ee-jay.com';
  const subject = sheetDateToString + ' ESTL Transfer Book';
  var body = 'ESTL Transfer Book Archive';
  //Place receipient email between the marks
  GmailApp.sendEmail(email, subject, body, { attachments: [blob] });
  return;
}
