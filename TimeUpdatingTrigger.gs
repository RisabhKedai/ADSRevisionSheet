// let timeColumn = 14;
// let hiddenColumn=15
// Define sheet names as constants
const SOLVED_PROBLEMS_SHEET = "Solved Problems";
const REVISION_SHEET = "Revision";

function createTimeDrivenTrigger() {
  ScriptApp.newTrigger("updateTimers")
    .timeBased()
    .everyMinutes(1) // Set to 1 minute for every minute
    .create();
}

function formatTime(seconds) {
  Logger.log("Format Time");
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Add leading zeros to minutes and seconds if necessary
  return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
}

function pad(num) {
  return num < 10 ? `0${num}` : num; // Add leading zero for single-digit hours, minutes, or seconds
}

function updateTimers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  // Update timers for both sheets
  updateTimersForSheet(ss.getSheetByName(SOLVED_PROBLEMS_SHEET));
  updateTimersForSheet(ss.getSheetByName(REVISION_SHEET));
}

function updateTimersForSheet(sheet) {
  Logger.log(`Update the sheet ${sheet.getName()}`);
  if (!sheet) return; // Skip if sheet doesn't exist

  const lastRow = sheet.getLastRow();

  for (let row = 2; row <= lastRow; row++) {
    const startTimeCell = sheet.getRange(row, hiddenColumn);
    const timeTakenCell = sheet.getRange(row, timeColumn);

    const startTime = startTimeCell.getValue();
    if (startTime && startTime.startsWith("startTime=")) {
      const startDate = new Date(startTime.split("startTime=")[1]);
      const elapsedSeconds = (new Date() - startDate) / 1000;

      const formattedTime = formatTime(elapsedSeconds);
      timeTakenCell.setValue(formattedTime);
    }
  }
  SpreadsheetApp.flush();
}
