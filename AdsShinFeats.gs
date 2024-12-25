let timerIntervals = {}; // Object to keep track of timers for each row
let startStopColumn = 17;
let timeColumn = 14;
let hiddenColumn = 15;
let lastSolvedColumn = 11;
let tagSheetName = "Topics";
let dataSheetName = "Solved Problems";
let revisionSheetName = "Revision";
let tagColumn = 1;
let ownCheckboxColumn = 5;
let referredCheckboxColumn = 6;
let ownTagsColumn = 12;
let referredTagsColumn = 13;

function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;

  if (
    sheet.getName() === dataSheetName ||
    sheet.getName() === revisionSheetName
  ) {
    handleTimerActions(sheet, range);
    handleTagDropdownConflict(sheet, range);
  } else if (sheet.getName() === tagSheetName) {
    handleCheckboxFilters(sheet, range);
  }
}

function handleTimerActions(sheet, range) {
  if (range.getColumn() === startStopColumn) {
    const action = range.getValue().toUpperCase(); // Get value from the dropdown (Start/Stop)
    if (action === "STOP") {
      startTimer(sheet, range.getRow());
    } else if (action === "START") {
      stopTimer(sheet, range.getRow());
    }
  }
}

function startTimer(sheet, row) {
  const startTimeCell = sheet.getRange(row, hiddenColumn);
  if (
    startTimeCell.getValue() &&
    startTimeCell.getValue().startsWith("startTime=")
  ) {
    SpreadsheetApp.getActiveSpreadsheet().toast(
      "Timer already running for row " + row
    );
    return;
  }
  startTimeCell.setValue("startTime=" + new Date());
  SpreadsheetApp.getActiveSpreadsheet().toast("Timer started for row " + row);
}

function stopTimer(sheet, row) {
  const startTimeCell = sheet.getRange(row, hiddenColumn);
  const timeTakenCell = sheet.getRange(row, timeColumn);
  const lastSolvedCell = sheet.getRange(row, lastSolvedColumn);
  let startTime = startTimeCell.getValue().split("startTime=")?.[1];

  if (!startTime) {
    SpreadsheetApp.getActiveSpreadsheet().toast(
      "No timer running for row " + row
    );
    return;
  }

  startTime = new Date(startTime);
  const elapsedSeconds = (new Date() - startTime) / 1000;
  const formattedTime = formatTime(elapsedSeconds);
  timeTakenCell.setValue(formattedTime);
  const formattedDate = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "dd/MMM/yyyy"
  );
  lastSolvedCell.setValue(formattedDate);

  // Update revision count if in Revision sheet
  if (sheet.getName() === revisionSheetName) {
    const revisionColumn = 5;
    const revisionCell = sheet.getRange(row, revisionColumn);
    const currentValue = revisionCell.getValue();
    const newValue = currentValue ? Number(currentValue) + 1 : 1;
    revisionCell.setValue(newValue);
  }

  startTimeCell.setValue("");
  SpreadsheetApp.flush();
  SpreadsheetApp.getActiveSpreadsheet().toast("Timer stopped for row " + row);
}

function handleCheckboxFilters(sheet, range) {
  if (
    range.getColumn() === ownCheckboxColumn ||
    range.getColumn() === referredCheckboxColumn
  ) {
    filterRowsBasedOnTags();
  }
}

function filterRowsBasedOnTags() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tagSheet = ss.getSheetByName(tagSheetName);
  const dataSheet = ss.getSheetByName(dataSheetName);
  dataSheet.showRows(1, dataSheet.getLastRow());
  const tagData = tagSheet
    .getRange(2, 1, tagSheet.getLastRow() - 1, referredCheckboxColumn)
    .getValues();
  const selectedOwnTags = tagData
    .filter((row) => row[ownCheckboxColumn - 1])
    .map((row) => row[0]);
  const selectedReferredTags = tagData
    .filter((row) => row[referredCheckboxColumn - 1])
    .map((row) => row[0]);
  if (selectedOwnTags.length + selectedReferredTags.length === 0) return;

  const rowsToShow = [];
  const ownDataRange = dataSheet
    .getRange(3, ownTagsColumn, dataSheet.getLastRow(), 1)
    .getValues();
  ownDataRange.forEach((row, rowIndex) => {
    if (selectedOwnTags.some((tag) => row.toString().includes(tag)))
      rowsToShow.push(rowIndex + 3);
  });
  const referredDataRange = dataSheet
    .getRange(3, referredTagsColumn, dataSheet.getLastRow(), 1)
    .getValues();
  referredDataRange.forEach((row, rowIndex) => {
    if (selectedReferredTags.some((tag) => row.toString().includes(tag)))
      rowsToShow.push(rowIndex + 3);
  });
  const uniqueArray = [...new Set(rowsToShow)].sort((a, b) => a - b);
  dataSheet.hideRows(1, dataSheet.getLastRow() - 1);
  dataSheet.showRows(1, 2);
  uniqueArray.forEach((row) => dataSheet.showRows(row, 1));
}

function handleTagDropdownConflict(sheet, range) {
  const firstColumn = 12; // Column number for the first drop-down column
  const secondColumn = 13; // Column number for the second drop-down column
  if (range.getColumn() === firstColumn || range.getColumn() === secondColumn) {
    const firstColumnCell = sheet.getRange(range.getRow(), firstColumn);
    const secondColumnCell = sheet.getRange(range.getRow(), secondColumn);
    const firstColumnValues = firstColumnCell.getValue().split(", ");
    const secondColumnValues = secondColumnCell.getValue().split(", ");
    if (range.getColumn() === firstColumn) {
      const updatedSecondColumnValues = secondColumnValues.filter(
        (val) => !firstColumnValues.includes(val)
      );
      secondColumnCell.setValue(updatedSecondColumnValues.join(", "));
    } else if (range.getColumn() === secondColumn) {
      const updatedFirstColumnValues = firstColumnValues.filter(
        (val) => !secondColumnValues.includes(val)
      );
      firstColumnCell.setValue(updatedFirstColumnValues.join(", "));
    }
  }
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
}

function pad(num) {
  return num < 10 ? `0${num}` : num;
}
