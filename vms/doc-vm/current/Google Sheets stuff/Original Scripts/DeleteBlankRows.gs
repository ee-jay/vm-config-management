function deleteBlankRowsInBatch() {
  // Variables for customization
  const sheetName = 'Order_Archive'; // Replace with your target sheet name
  const batchSize = 50; // Number of rows to delete in a batch

  // Get the sheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    Logger.log(`Sheet '${sheetName}' not found.`);
    return;
  }

  const range = sheet.getDataRange();
  const values = range.getValues();
  const rowsToDelete = [];

  // Collect rows where columns B & E are both blank
  for (let i = 0; i < values.length; i++) {
    const columnF = values[i][5]; // Column F
    const columnH = values[i][7]; // Column H

    if (columnF === '' && columnH === '') {
      rowsToDelete.push(i + 1); // Store the row number (1-based index)
    }
  }

  // Delete rows in batches
  while (rowsToDelete.length > 0) {
    const batch = rowsToDelete.splice(0, batchSize);
    const batchOffset = batch.length - 1;

    for (let i = batchOffset; i >= 0; i--) {
      sheet.deleteRow(batch[i]);
    }
  }

  Logger.log(`Completed deleting rows from sheet '${sheetName}'.`);
}
