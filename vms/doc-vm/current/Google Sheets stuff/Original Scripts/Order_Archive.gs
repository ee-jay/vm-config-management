function moveOldOrders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSheet = ss.getSheetByName('Order_List');
  var archiveSheet = ss.getSheetByName('Order_Archive');

  // Get all data from Order_List
  var data = sourceSheet
    .getRange(2, 1, sourceSheet.getLastRow() - 1, sourceSheet.getLastColumn())
    .getValues();

  // Get today's date minus 7 days
  var targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - 7);
  targetDate.setHours(0, 0, 0, 0); // Normalize the time for accurate comparison

  var rowsToMove = [];

  // Get the last value in column A of the archive sheet (new primary key column)
  var lastPrimaryKey = archiveSheet
    .getRange(archiveSheet.getLastRow(), 1)
    .getValue();
  var nextPrimaryKeyNumber = lastPrimaryKey
    ? parseInt(lastPrimaryKey.replace('TBOA', ''), 10) + 1
    : 1; // Extract the number and increment it
  var nextPrimaryKey = 'TBOA' + nextPrimaryKeyNumber; // Add the 'TBOA' prefix

  // Find rows where the date in column A (unshifted on Order_List) matches targetDate
  for (var i = 0; i < data.length; i++) {
    var rowDate = new Date(data[i][0]); // Date is in column A (index 0 on Order_List)
    rowDate.setHours(0, 0, 0, 0); // Normalize the time for accurate comparison

    if (rowDate.getTime() === targetDate.getTime()) {
      var row = data[i];
      var valueInC = row[2]; // Column C (index 2 on Order_List)
      var valueInI = row[8]; // Column I (index 8 on Order_List)
      var valueInL = row[11]; // Column L (index 11 on Order_List)

      // Check if columns C, I, and L are populated with non-empty values or zeros
      if (valueInC && valueInI === 0 && valueInL === 0) {
        // Check if columns B, D-H, J-K, M-O are all blank
        var otherColumns = row
          .slice(1, 2) // Column B (index 1)
          .concat(row.slice(3, 7)) // Columns D-H (index 3-7)
          .concat(row.slice(9, 10)) // Columns J-K (index 9-10)
          .concat(row.slice(12, 15)); // Columns M-O (index 12-14)

        // If all these columns are blank, skip this row
        if (otherColumns.every(cell => cell === '')) {
          continue; // Skip to the next row without adding it to rowsToMove
        }
      }

      // Add the next primary key value with prefix to the row and shift the rest of the row data
      row.unshift(nextPrimaryKey);
      rowsToMove.push(row);

      // Increment the primary key for the next row
      nextPrimaryKeyNumber++;
      nextPrimaryKey = 'TBOA ' + nextPrimaryKeyNumber;
    }
  }

  if (rowsToMove.length > 0) {
    // Get the last row of the archive sheet
    var lastRow = archiveSheet.getLastRow();

    // Copy rows to Order_Archive, including the new primary key with prefix
    archiveSheet
      .getRange(lastRow + 1, 1, rowsToMove.length, rowsToMove[0].length)
      .setValues(rowsToMove);
  }
}

//----------------------------- OLD SCRIPT -----------------------------------------------

/*function moveOldOrders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSheet = ss.getSheetByName('Order_List');
  var archiveSheet = ss.getSheetByName('Order_Archive');
  
  // Get all data from Order_List
  var data = sourceSheet.getRange(2, 1, sourceSheet.getLastRow() - 1, sourceSheet.getLastColumn()).getValues();
  
  // Get today's date minus 7 days
  var targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - 7);
  targetDate.setHours(0, 0, 0, 0);  // Normalize the time for accurate comparison
  
  var rowsToMove = [];

  // Find rows where the date in column A matches targetDate
  for (var i = 0; i < data.length; i++) {
    var rowDate = new Date(data[i][0]);  // Assuming date is in column A (index 0)
    rowDate.setHours(0, 0, 0, 0);  // Normalize the time for accurate comparison
    
    if (rowDate.getTime() === targetDate.getTime()) {
      rowsToMove.push(data[i]);
    }
  }
  
  if (rowsToMove.length > 0) {
    // Get the last row of the archive sheet
    var lastRow = archiveSheet.getLastRow();
    
    // Copy rows to Order_Archive
    archiveSheet.getRange(lastRow + 1, 1, rowsToMove.length, rowsToMove[0].length).setValues(rowsToMove);
  }
}
*/
