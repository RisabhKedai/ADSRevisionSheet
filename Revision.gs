let N;

// Add these constants at the top of the file
const FIRST_COLUMN_TO_CLEAR = "G"; // Time Complexity
const LAST_COLUMN_TO_CLEAR = "N"; // Other metadata

function onOpen() {
  updateMenu(); // Build the menu dynamically based on the current state
}

function updateMenu() {
  const ui = SpreadsheetApp.getUi();
  const scriptProperties = PropertiesService.getScriptProperties();
  const revisionState = scriptProperties.getProperty("revisionState") || "idle"; // Default state: idle

  const menu = ui.createMenu("Revision");

  if (revisionState === "generated") {
    menu.addItem("End Revision", "endRevision");
    menu.addItem("Clear Active Revision", "clearActiveRevision");
  } else if (revisionState === "ended") {
    menu.addItem("Clear Active Revision", "clearActiveRevision");
  } else {
    menu.addItem("Generate Revision", "generateRevision");
  }

  menu.addToUi();
}

function updateStateAndNotify(newState, toastMessage, toastTitle) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty("revisionState", newState);
  spreadsheet.toast(toastMessage, toastTitle, 3);
  updateMenu();
}

function getConfigValues() {
  const revisionConfigSheetName = "RevisionConfig";
  const configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    revisionConfigSheetName
  );
  const configData = configSheet.getDataRange().getValues();
  const config = {};

  configData.slice(1).forEach((row) => {
    // Skip header row
    const key = row[0]; // Flag name
    const value = row[1]; // Corresponding value
    config[key] = value;
  });
  return config;
}

function generateRevision() {
  const NOTES_COLUMN = 18;

  const { Number_of_problems: numberOfProblems } = getConfigValues();
  N = numberOfProblems;
  const dataSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Solved Problems");
  const revisionSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Revision");

  const headersRange = dataSheet.getRange(1, 1, 2, dataSheet.getLastColumn()); // Includes header row and row below it

  if (!dataSheet || !revisionSheet) {
    SpreadsheetApp.getActiveSpreadsheet().toast(
      "Data or Revision sheet not found!",
      "Error",
      5
    );
    return;
  }

  const data = dataSheet.getDataRange().getDisplayValues();
  const headers = headersRange.getValues(); // Assume first row contains headers

  // Find the score column index
  const scoreColumnIndex = headers[0].indexOf("SCORE");
  if (scoreColumnIndex === -1) {
    SpreadsheetApp.getActiveSpreadsheet().toast(
      "SCORE column not found in Data sheet!",
      "Error",
      5
    );
    return;
  }

  // Filter rows where score is not empty or invalid
  const filteredRows = data
    .slice(3)
    .filter(
      (row) => row[scoreColumnIndex] !== "" && row[scoreColumnIndex] !== null
    );

  // Sort rows by score in descending order
  filteredRows.sort((a, b) => b[scoreColumnIndex] - a[scoreColumnIndex]);

  // Select the top `numberOfProblems` visible rows
  const selectedRows = getVisibleSelectedRows(
    filteredRows,
    numberOfProblems,
    dataSheet
  );

  // Clear the Revision sheet
  revisionSheet.clear();

  // set new data
  headersRange.copyTo(revisionSheet.getRange(1, 1));
  console.log("No. of selectedRows = ", selectedRows.length);

  selectedRows.forEach((row, index) => {
    const rowIndexInData = 2 + parseInt(row[0]); // +2 to account for headers and start index
    dataSheet
      .getRange(rowIndexInData, 1, 1, dataSheet.getLastColumn())
      .copyTo(revisionSheet.getRange(index + 3, 1)); // +3 to paste below headers
  });

  // Rename Notes column to Hint
  const notesColumnIndex = headers[0].indexOf("NOTES");
  if (notesColumnIndex !== -1) {
    revisionSheet.getRange(1, notesColumnIndex + 1).setValue("HINT");

    // For each selected row, set the note as a tooltip in the HINT column
    selectedRows.forEach((row, index) => {
      const noteCell = revisionSheet.getRange(index + 3, notesColumnIndex + 1);
      const noteValue = row[notesColumnIndex];
      if (noteValue) {
        noteCell.clearContent();
        noteCell.setNote(noteValue);
        noteCell.setValue("ℹ️");
        noteCell.setHorizontalAlignment("center");
      }
    });
  }

  // Clear columns G to K
  const firstColIndex = revisionSheet.getRange("G1").getColumn(); // G
  const lastColIndex1 = revisionSheet.getRange("K1").getColumn(); // K

  // Clear column N
  const firstColIndex2 = revisionSheet.getRange("N1").getColumn(); // N
  const lastColIndex2 = revisionSheet.getRange("N1").getColumn(); // N

  const numRows = revisionSheet.getLastRow();
  if (numRows > 2) {
    // Clear G to K
    revisionSheet
      .getRange(
        3,
        firstColIndex,
        numRows - 2,
        lastColIndex1 - firstColIndex + 1
      )
      .clearContent();

    // Clear N
    revisionSheet
      .getRange(
        3,
        firstColIndex2,
        numRows - 2,
        lastColIndex2 - firstColIndex2 + 1
      )
      .clearContent();
  }

  N = selectedRows.length;

  revisionSheet.hideColumns(12, 2);
  revisionSheet.hideColumns(15);

  updateStateAndNotify(
    "generated",
    "Revision set generated successfully!",
    "Generate Revision"
  );
}

function endRevision() {
  const revisionSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Revision");
  const dataSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Solved Problems");

  // Show reminder to check tags before syncing
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    "Tags Reminder",
    "Please make sure to unveil and update the tags columns (Own Tags & Referred Tags) for each revised problem before syncing.\n\nClick OK to continue with sync.",
    ui.ButtonSet.OK_CANCEL
  );

  if (response !== ui.Button.OK) {
    return;
  }

  // Get all data from both sheets
  const revisionData = revisionSheet.getDataRange().getValues();
  const dataSheetData = dataSheet.getDataRange().getValues();

  // Find column indices
  const headers = revisionData[0];
  const timeColIndex = headers.indexOf("TIME TAKEN (in minutes)");
  const startStopColIndex = headers.indexOf("START /");
  const serialNoColIndex = headers.indexOf("SL NO.");

  // TODO : Use dynamic indexing here instead of hardcoding column letters.
  const solutionColIndices = [6, 7, 8, 9];
  const lastSolvedColIndex = headers.indexOf("LAST SOLVED");

  const validRows = [];
  // Validate timer status
  for (let i = 2; i < revisionData.length; i++) {
    const timeValue = revisionData[i][timeColIndex];
    const startStopValue = revisionData[i][startStopColIndex];
    const lastSolvedValue = revisionData[i][lastSolvedColIndex];

    let isValid = true;
    let errorMessage = "";

    if (!timeValue || timeValue === "") {
      errorMessage += `Missing time value in row ${i + 1}\n`;
      isValid = false;
    }

    if (startStopValue !== "START") {
      errorMessage += `Timer not stopped in row ${i + 1}\n`;
      isValid = false;
    }

    if (!lastSolvedValue) {
      errorMessage += `Missing last solved date in row ${i + 1}\n`;
      isValid = false;
    } else {
      const lastSolvedDate = new Date(lastSolvedValue);
      const today = new Date();
      if (lastSolvedDate.toDateString() !== today.toDateString()) {
        errorMessage += `Problem in row ${i + 1} was not solved today\n`;
        isValid = false;
      }
    }

    if (isValid) {
      validRows.push(i);
    } else {
      SpreadsheetApp.getActiveSpreadsheet().toast(errorMessage, "Warning", 5);
    }
  }

  if (validRows.length === 0) {
    SpreadsheetApp.getUi().alert("No valid rows found to update!");
    return;
  }

  // Proceed with syncing only valid rows
  validRows.forEach((i) => {
    const serialNo = revisionData[i][serialNoColIndex];
    const mainSheetRow = parseInt(serialNo) + 2;

    // Copy non-solution columns first
    const columnsToSkip = new Set(solutionColIndices.map((idx) => idx + 1));
    for (let col = 1; col <= revisionSheet.getLastColumn(); col++) {
      if (!columnsToSkip.has(col)) {
        revisionSheet
          .getRange(i + 1, col, 1, 1)
          .copyTo(dataSheet.getRange(mainSheetRow, col));
      }
    }

    // Copy solution columns only if main sheet doesn't have data
    solutionColIndices.forEach((solIndex) => {
      if (solIndex !== -1) {
        const mainSheetSolution = dataSheetData[mainSheetRow - 1][solIndex];
        if (!mainSheetSolution || mainSheetSolution === "") {
          revisionSheet
            .getRange(i + 1, solIndex + 1, 1, 1)
            .copyTo(dataSheet.getRange(mainSheetRow, solIndex + 1), {
              contentsOnly: false,
              copyFormatting: true,
            });
        }
      }
    });
  });

  updateStateAndNotify("ended", "Revision ended successfully!", "End Revision");
}

function clearActiveRevision() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const revisionSheet = ss.getSheetByName(REVISION_SHEET);

  if (!revisionSheet) {
    SpreadsheetApp.getUi().alert("Revision sheet not found!");
    return;
  }

  const lastRow = revisionSheet.getLastRow();
  if (lastRow > 1) {
    // Only clear if there's data beyond header row
    revisionSheet
      .getRange(3, 1, lastRow - 1, revisionSheet.getLastColumn())
      .clear({
        contentsOnly: true,
        validationsOnly: true,
      })
      .clearNote();
  }
  updateStateAndNotify(
    "idle",
    "Active revision cleared!",
    "Clear Active Revision"
  );
}

// Select the top `numberOfProblems` visible rows
function getVisibleSelectedRows(filteredRows, numberOfProblems, dataSheet) {
  const selectedRows = [];
  let count = 0;
  for (let i = 0; i < filteredRows.length && count < numberOfProblems; i++) {
    const rowIndexInData = 2 + parseInt(filteredRows[i][0]);
    if (!dataSheet.isRowHiddenByUser(rowIndexInData)) {
      selectedRows.push(filteredRows[i]);
      count++;
    }
  }

  return selectedRows;
}
