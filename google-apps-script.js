/**
 * Google Apps Script for YGN TV SRT Editor
 * Handles dynamic sheet (tab) creation based on Movie/Series name.
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === "save") {
      const senderName = data.senderName;
      const movieName = data.movieName;
      const description = data.description; // S1E1 or Movie
      const fileName = data.fileName;
      const timestamp = new Date();

      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sheet = ss.getSheetByName(movieName);

      // If the sheet for this movie/series doesn't exist, create it
      if (!sheet) {
        sheet = ss.insertSheet(movieName);
        // Add Header Row
        sheet.appendRow(["Timestamp", "Editor Name", "Description", "File Name"]);
        // Format Header
        sheet.getRange(1, 1, 1, 4).setFontWeight("bold").setBackground("#f3f3f3");
        sheet.setFrozenRows(1);
      }

      // Append the data
      sheet.appendRow([timestamp, senderName, description, fileName]);

      return ContentService.createTextOutput(JSON.stringify({ "status": "success", "message": "Data saved to tab: " + movieName }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": "Invalid action" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
