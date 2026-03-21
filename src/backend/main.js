let faviconUrl = "https://drive.google.com/uc?id=1aQQqYhnESMZ-ZboAs4Rdcu0x8O0ZXlvo&export=download&format=png"
const DAILY_CRON_HOUR = 6
const METADATA_PREFIX = '_'
const REPORTS_PREFIX = '+'
const IGNORE_PREFIX = '*'
const COST_PER_DAY_SHEETNAME = "+costperday"
const DAILY_TRACKER_SHEETNAME = "+dailytracker"
const MONTHLY_SUMMARY_PDF_NAME = "Monthly_Summary.pdf"

function setupTriggers(){
  setupDailyCronTrigger()
  setupMonthlyCronTrigger()
}

function doGet() {
  return HtmlService.createHtmlOutputFromFile("index").setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .setFaviconUrl(faviconUrl)
      .setTitle("Panam")
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .addMetaTag('apple-mobile-web-app-capable', 'yes')
      .addMetaTag('mobile-web-app-capable', 'yes');
}

function fetchData(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let data = {}
  ss.getSheets().forEach((sheet)=>{
    let sheetName = sheet.getSheetName().toLowerCase()
    if(sheetName[0] !== IGNORE_PREFIX){
      data[sheetName]  = sheet.getDataRange().getValues();
      if(sheetName === "_sheet"){
        data[sheetName].push(["sheetUrl", getSheetUrl(ss, null)]);
      }
    }
  })
  return JSON.stringify(data)
}

function addInstrument(data){
  if(!data.hasOwnProperty("name") || !data.hasOwnProperty("label")){
    return {
      statusCode: 400,
      status: "Mandatory data missing"
    }
  }

  try{
    let ss = SpreadsheetApp.getActiveSpreadsheet()
    let instrumentMetadataSheet = ss.getSheetByName("_instrument");
    let columnMetadataSheet = ss.getSheetByName("_column");

    if(checkValueExistsInColumn(instrumentMetadataSheet, "Name", data.name) || ss.getSheetByName(data.name)){
      return {
        statusCode: 400,
        status: "Instrument with same name already exists",
      }
    }
    if(checkValueExistsInColumn(instrumentMetadataSheet, "Label", data.label)){
      return {
        statusCode: 400,
        status: "Instrument with same label already exists",
      }
    }

    let resp = updateInstrumentMetadata(data, instrumentMetadataSheet);
    if(resp.statusCode !== 200){
      deleteRowsWithValue(instrumentMetadataSheet, "Name", data.name)
      return resp;
    }
    resp = updateColumnMetadata(data, columnMetadataSheet, instrumentMetadataSheet);
    if(resp.statusCode !== 200){
      deleteRowsWithValue(columnMetadataSheet, "Instrument", data.name)
      deleteRowsWithValue(instrumentMetadataSheet, "Name", data.name)
      return resp;
    }
    resp = addInstrumentSheet(data, columnMetadataSheet, instrumentMetadataSheet);
    if(resp.statusCode !== 200){
      deleteRowsWithValue(columnMetadataSheet, "Instrument", data.name)
      deleteRowsWithValue(instrumentMetadataSheet, "Name", data.name)
      ss.deleteSheet(ss.getSheetByName(data.name))
      return resp;
    }

    let sheet = ss.getSheetByName(data.name)
    let lastRow = sheet.getLastRow();
    sheet.getRange(lastRow+1, 2).setValue("Manually add entry in this row and then refresh the app.");

    let lastColumn = sheet.getLastColumn();
    let range = sheet.getRange(1, 1, 1, lastColumn);
    range.setFontWeight('bold');

    return{
      statusCode: 200,
      status: "Success",
      instrumentSheetUrl: getSheetUrl(ss, ss.getSheetByName(data.name))
    }
  }
  catch(e){
    return{
      statusCode: 400,
      status: "Something went wrong",
    }
  }
}

function updateInstrumentTransactions(sheetName, rowMap){
  let ss = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = ss.getSheetByName(sheetName);
  let numRows = sheet.getLastRow();
  let firstCell = numRows > 0 ? sheet.getRange('A2').getValue() : '';
  if ((numRows < 2) || (firstCell === '')) {
    return {
      statusCode: 400,
      status: (numRows > 1 && firstCell === '') ? "At least one entry must be manually added to the sheet" : "Header column missing from sheet",
      instrumentSheetUrl: getSheetUrl(ss, sheet)
    }
  }

  let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  let newRowData = headers.map(header => {
    if (rowMap.hasOwnProperty(header)) {
      return rowMap[header];
    } else {
      let lastRow = sheet.getLastRow();
      if(header.toLowerCase() === "id"){
        return lastRow;
      }
      let formula = sheet.getRange(lastRow, headers.indexOf(header) + 1).getFormula();
      return formula.replace(new RegExp(lastRow, 'g'), lastRow+1).replace(new RegExp(lastRow-1, 'g'), lastRow);
    }
  });

  sheet.appendRow(newRowData);

  return {
    statusCode: 200,
    status: "Success"
  }
}

function deleteInstrument(instrument){
  try{
    let ss = SpreadsheetApp.getActiveSpreadsheet()
    ss.deleteSheet(ss.getSheetByName(instrument))
    deleteRowsWithValue(ss.getSheetByName('_column'), "Instrument", instrument)
    deleteRowsWithValue(ss.getSheetByName('_instrument'), "Name", instrument)
    return{
      statusCode: 200,
      status: "Success"
    }
  }
  catch (e){
    return{
      statusCode: 400,
      status: e
    }
  }
}

function addCostPerDayEntry(newEntry){
  let ss = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = ss.getSheetByName(COST_PER_DAY_SHEETNAME);

  let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const requiredFields = ['Name', 'PurchaseDate', 'PurchaseCost']

  let newRowData = headers.map(header => {
    trimmedHeader = header.split(' ').join('');
    if (requiredFields.includes(trimmedHeader)) {
      return newEntry[trimmedHeader];
    } else {
      let lastRow = sheet.getLastRow();
      if(header.toLowerCase() === "id"){
        return lastRow;
      }
      let formula = sheet.getRange(lastRow, headers.indexOf(header) + 1).getFormula();
      return formula.replace(new RegExp(lastRow, 'g'), lastRow+1).replace(new RegExp(lastRow-1, 'g'), lastRow);
    }
  });

  sheet.appendRow(newRowData);

  return {
    statusCode: 200,
    status: "Success"
  }
}