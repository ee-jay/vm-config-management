/**
 * Main function to reset the current sheet page
 * Prompts user for confirmation, archives data, clears ranges, and updates date
 */
function ResetPageNew() {
  var daySheet = SpreadsheetApp.getActiveSheet();
  var activeSheetName = daySheet.getSheetName();

  // Get user confirmation before proceeding
  if (!getUserConfirmation(activeSheetName)) {
    return;
  }

  // Archive the current sheet data
  archiveCurrentSheet(daySheet);

  // Get sheet structure information
  var sheetStructure = getSheetStructure(daySheet);

  // Clear data from various sections
  clearSheetData(daySheet, sheetStructure);

  // Update date and sheet name if appropriate
  updateSheetDate(daySheet);

  // Apply color coding to rows
  applyRowColoring(daySheet, sheetStructure);

  // Call Deliveries function
  Deliveries();
}

/**
 * Prompts user for confirmation before resetting the page
 */
function getUserConfirmation(sheetName) {
  var ui = SpreadsheetApp.getUi();
  var result = ui.alert(
    'Are you sure you want to Reset Page ' + sheetName + '?',
    ui.ButtonSet.YES_NO
  );
  return result == ui.Button.YES;
}

/**
 * Archives the current sheet using both methods
 */
function archiveCurrentSheet(daySheet) {
  archiveToDriveESTL(daySheet);
  archive();
}

/**
 * Finds and returns the structure/layout of the sheet (row and column positions)
 */
function getSheetStructure(daySheet) {
  return {
    // Column boundaries
    firstColumn: daySheet
      .getRange('A1:AA2')
      .createTextFinder('Pro#')
      .findNext()
      .getColumn(),
    lastColumn: daySheet
      .getRange('A1:AC2')
      .createTextFinder('LAST COLUMN ON DISPATCH SHEET')
      .findNext()
      .getColumn(),

    // Driver section boundaries
    firstDriverRow: daySheet
      .getRange('A1:AA2')
      .createTextFinder('Drivers')
      .findNext()
      .getRow(),
    lastDriverRow: daySheet
      .getRange('A1:A')
      .createTextFinder('MASTER')
      .findNext()
      .getRow(),

    // Loader section boundaries
    firstLoaderRow: daySheet
      .getRange('A1:A')
      .createTextFinder('Loaders')
      .findNext()
      .getRow(),
    lastLoaderRow: daySheet
      .getRange('A1:A198')
      .createTextFinder('Dispatch')
      .findPrevious()
      .getRow(),

    // Dispatch section boundaries
    firstDispatchRow: daySheet
      .getRange('A1:A198')
      .createTextFinder('Dispatch')
      .findNext()
      .getRow(),
    lastDispatchRow: daySheet
      .getRange('A1:A')
      .createTextFinder('End Of Shift')
      .findNext()
      .getRow(),

    // Shop section boundaries
    firstShopRow: daySheet
      .getRange('A1:A')
      .createTextFinder('Shop')
      .findNext()
      .getRow(),
    lastShopRow: daySheet
      .getRange('A1:A')
      .createTextFinder('LAST ROW ON DISPATCH SHEET')
      .findNext()
      .getRow(),
  };
}

/**
 * Calculates range notations for different sections of the sheet
 */
function calculateSectionRanges(daySheet, structure) {
  return {
    driverRange: daySheet
      .getRange(
        structure.firstDriverRow + 1,
        structure.firstColumn,
        structure.lastDriverRow - structure.firstDriverRow - 1,
        structure.lastColumn + 1 - structure.firstColumn
      )
      .getA1Notation(),

    loaderRange: daySheet
      .getRange(
        structure.firstLoaderRow + 1,
        structure.firstColumn,
        structure.lastLoaderRow - structure.firstLoaderRow - 2,
        structure.lastColumn + 1 - structure.firstColumn
      )
      .getA1Notation(),

    dispatchRange: daySheet
      .getRange(
        structure.firstDispatchRow + 1,
        structure.firstColumn,
        structure.lastDispatchRow - structure.firstDispatchRow - 1,
        structure.lastColumn + 1 - structure.firstColumn
      )
      .getA1Notation(),

    shopRange: daySheet
      .getRange(
        structure.firstShopRow + 1,
        structure.firstColumn,
        structure.lastShopRow - structure.firstShopRow - 1,
        structure.lastColumn + 1 - structure.firstColumn
      )
      .getA1Notation(),
  };
}

/**
 * Calculates time column ranges for different sections
 */
function calculateTimeRanges(daySheet, structure) {
  return {
    loaderTimes: daySheet
      .getRange(
        structure.firstLoaderRow + 1,
        3,
        structure.lastLoaderRow - structure.firstLoaderRow - 2,
        1
      )
      .getA1Notation(),

    dispatchTimes: daySheet
      .getRange(
        structure.firstDispatchRow + 1,
        3,
        structure.lastDispatchRow - structure.firstDispatchRow - 2,
        1
      )
      .getA1Notation(),

    shopTimes: daySheet
      .getRange(
        structure.firstShopRow + 1,
        3,
        structure.lastShopRow - structure.firstShopRow - 1,
        1
      )
      .getA1Notation(),
  };
}

/**
 * Clears all data from the sheet sections
 */
function clearSheetData(daySheet, structure) {
  var sectionRanges = calculateSectionRanges(daySheet, structure);
  var timeRanges = calculateTimeRanges(daySheet, structure);

  // Clear driver names and set background
  daySheet
    .getRange(
      structure.firstDriverRow,
      2,
      structure.lastDriverRow - structure.firstDriverRow - 1,
      2
    )
    .activate()
    .clear({ contentsOnly: true, skipFilteredRows: true })
    .setBackground('#ffffff');

  // Clear specific D column cells
  var dColumnCells = [
    'D6',
    'D11',
    'D16',
    'D21',
    'D26',
    'D31',
    'D36',
    'D41',
    'D46',
    'D51',
    'D56',
    'D61',
    'D66',
    'D71',
    'D76',
    'D81',
    'D86',
    'D91',
    'D96',
  ];
  daySheet
    .getRangeList(dColumnCells)
    .activate()
    .clear({ contentsOnly: true, skipFilteredRows: true })
    .setBackground('#ffffff');

  // Clear time columns
  daySheet
    .getRangeList([
      timeRanges.loaderTimes,
      timeRanges.dispatchTimes,
      timeRanges.shopTimes,
    ])
    .activate()
    .clear({ contentsOnly: true, skipFilteredRows: true });

  // Clear main section ranges
  daySheet
    .getRangeList([
      sectionRanges.driverRange,
      sectionRanges.loaderRange,
      sectionRanges.dispatchRange,
      sectionRanges.shopRange,
    ])
    .activate()
    .clear({ contentsOnly: true, skipFilteredRows: true })
    .setBackground('#ffffff');

  // Clear comments
  daySheet.getRange(sectionRanges.driverRange).setComment(null);
  daySheet.getRange(sectionRanges.dispatchRange).setComment(null);

  // Set time format for specific columns
  daySheet
    .getRangeList(['H3:H174', 'N3:N174', 'T3:T174', 'Z3:Z174'])
    .activate()
    .setNumberFormat('h":"mm" "am/pm');

  // Set background color for AC column
  daySheet.getRangeList(['AC3:AC87']).activate().setBackground('#00ffff');
}

/**
 * Gets the day name from day number
 */
function getDayName(dayNumber) {
  var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dayNames[dayNumber];
}

/**
 * Updates the sheet date and name if the date difference is less than 7 days
 */
function updateSheetDate(daySheet) {
  var currentSheetDate = daySheet.getRange('A1').getValue();
  var nextSheetDate = new Date(
    currentSheetDate.getTime() + 168 * 60 * 60 * 1000
  ); // Add 7 days

  var dayName = getDayName(nextSheetDate.getDay());
  var formatMonthDay = Utilities.formatDate(nextSheetDate, 'GMT-6', 'M/d');
  var displayDateforSheet = dayName + ' ' + formatMonthDay;

  var differenceInDays = (nextSheetDate - new Date()) / (24 * 60 * 60 * 1000);

  if (differenceInDays < 7) {
    daySheet.getRange('A1').setValue(nextSheetDate);
    daySheet.setName(displayDateforSheet);
  }
}

/**
 * Applies color coding to specific rows
 */
function applyRowColoring(daySheet, structure) {
  // Color loader rows red
  daySheet
    .getRange(structure.firstLoaderRow - 1, 1, 1, structure.lastColumn - 1)
    .setBackground('#ff0000');
  daySheet
    .getRange(structure.lastLoaderRow - 1, 1, 1, structure.lastColumn - 1)
    .setBackground('#ff0000');

  // Color end of shift rows yellow
  daySheet
    .getRange(structure.lastDispatchRow, 1, 5, structure.lastColumn - 1)
    .setBackground('#ffff00');

  // Color row after end of shift red
  daySheet
    .getRange(structure.lastDispatchRow + 5, 1, 1, structure.lastColumn - 1)
    .setBackground('#ff0000');
}
