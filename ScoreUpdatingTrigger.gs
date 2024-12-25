// let sheetName = "Solved Problems";

function createTimeDrivenTrigger() {
  ScriptApp.newTrigger("updateScores")
    .timeBased()
    .everyDays(1)
    .atHour(3)
    .create();
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

function getTime(time) {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  // Convert to total minutes
  const totalMinutes = hours * 60 * 60 + minutes * 60 + seconds;
  return totalMinutes;
}

function updateScores() {
  const dataSheetName = "Solved Problems";
  const dataSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(dataSheetName);
  const data = dataSheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(2);

  const today = new Date();
  let scoreColumnIndex = headers.indexOf("SCORE");

  // Fetch dynamic weights from the config sheet
  const { Number_of_problems: _, ...config } = getConfigValues();
  // Ensure SCORE column exists
  if (scoreColumnIndex === -1) {
    const scoreHeaderRange = dataSheet.getRange(1, headers.length + 1, 2, 1);
    scoreHeaderRange.merge();
    scoreHeaderRange
      .setValue("SCORE")
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle");

    // Update headers array to include the new column
    headers.push("SCORE");

    // Update scoreColumnIndex to reflect the new column index
    scoreColumnIndex = headers.length - 1;
  }

  const updatedRows = rows.map((row, index) => {
    // Logger.log(row[headers.indexOf('LAST SOLVED')])
    // const [day, month, year] = row[headers.indexOf('LAST SOLVED')].split('/').map(Number);
    // const lastSolved = new Date(year, month - 1, day);
    const lastSolved = new Date(row[headers.indexOf("LAST SOLVED")]);
    const difficulty = row[headers.indexOf("DIFFICULTY")];
    const revisions = parseInt(row[headers.indexOf("REVISIONS")]) || 0;
    const important = row[headers.indexOf("IMPORTANT")] === "true";
    let solvedTime = row[headers.indexOf("TIME TAKEN (in minutes)")];

    if (solvedTime) {
      solvedTime = getTime(solvedTime);
    }
    solvedTime = solvedTime || 1;

    // row[headers.indexOf('TIME TAKEN')];
    // const ownTags = row[headers.indexOf('OWN TAGS SOLVED')].split(',');
    // const referredTags = row[headers.indexOf('REFERRED TAGS')].split(',');

    const daysSinceLastSolved = Math.floor(
      (today - lastSolved) / (1000 * 60 * 60 * 24)
    );
    const difficultyWeight = { EASY: 1, MEDIUM: 2, HARD: 3 }[difficulty] || 1;

    // const tagPerformance = getTagPerformance();
    // const tagAdjustment = ownTags.reduce((sum, tag) => sum + (1 - (tagPerformance[tag] || 0)), 0)
    //   + referredTags.reduce((sum, tag) => sum + (1 - (tagPerformance[tag] || 0)) / 2, 0);

    let score =
      config["Last_Solved"] * daysSinceLastSolved +
      config["Difficulty"] * difficultyWeight -
      config["Revisions"] * revisions +
      (important ? config["Important_Bonus"] : 0) +
      config["Solve_time"] * solvedTime;
    if (!score) score = "";
    // Logger.log([lastSolved, difficulty, revisions, important, solvedTime, score]);
    // Update the SCORE column in the data
    // row[scoreColumnIndex] = score;
    return [score];
  });
  // Logger.log(scoreColumnIndex)
  // Logger.log([updatedRows.length, updatedRows[0].length]);
  // Write updated data back to the sheet
  const range = dataSheet.getRange(
    3,
    scoreColumnIndex + 1,
    updatedRows.length,
    1
  );
  range.setValues(updatedRows);
}
