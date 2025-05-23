//This script pulls the sheet name and pro number from a day on the transfer book and place them in columns A & B of the Order_Copy Sheet.
//It can copy about 2.5 Days worth of orders before timing out. It is extremely slow, taking 30 seconds per order.  That should be fine if the script is set to run every day.  This version is made for the initial pull of all orders.  It should be modified for daily use later so it doesn't search every single day.
function transferData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets(); // Get all sheets in the workbook
  var targetSheet = ss.getSheetByName('Order_Table');

  // Define the columns to check in the source sheets
  var columns = ['G', 'O', 'W'];

  // Function to check if an order number already exists in the target sheet's column B
  function orderExistsInTarget(order) {
    var columnBValues = targetSheet.getRange('B:B').getValues();
    for (var k = 0; k < columnBValues.length; k++) {
      if (columnBValues[k][0] === order) {
        return true;
      }
    }
    return false;
  }

  // Iterate through all sheets
  for (var s = 1; s < sheets.length; s++) {
    var currentSheet = sheets[s];

    // If the sheet's name is "PRO#", stop the script
    if (currentSheet.getName() === 'PRO#') {
      break;
    }

    var lastRowInTarget = targetSheet.getLastRow();

    for (var i = 0; i < 8; i++) {
      // 8 blocks based on your pattern
      for (var j = 0; j < columns.length; j++) {
        var cellValue = currentSheet
          .getRange(columns[j] + (4 + i * 18))
          .getValue();

        // If the cell isn't empty, and the order number doesn't already exist in targetSheet's column B
        if (cellValue && !orderExistsInTarget(cellValue)) {
          targetSheet
            .getRange(lastRowInTarget + 1, 1)
            .setValue(currentSheet.getName());
          targetSheet.getRange(lastRowInTarget + 1, 2).setValue(cellValue);
          lastRowInTarget++; // Increase the index for the next value
        }
      }
    }
  }
}
