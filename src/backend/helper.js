const updateDailyTracker = () =>{
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let currentTotal = 0, investedTotal =  0;
    ss.getSheets().forEach((sheet)=>{
        let sheetName = sheet.getSheetName().toLowerCase()
        if(sheetName[0] !== METADATA_PREFIX && sheetName[0] !== REPORTS_PREFIX && sheetName[0] !== IGNORE_PREFIX){
            const data  = sheet.getDataRange().getValues();
            const headers = data[0];
            const rows = data.slice(1);
            let instrumentCurrentTotal = 0.0, instrumentInvestedTotal = 0.0;

            rows.forEach(row => {
                if (row.every(cell => cell === "" || cell === null || cell === undefined)) return;
                row.forEach((value, index) => {
                    const header = headers[index].toLowerCase();
                    if (header === "current") instrumentCurrentTotal += value;
                    if (header === "invested") instrumentInvestedTotal += value;
                });
            });

            currentTotal += instrumentCurrentTotal
            investedTotal += instrumentInvestedTotal
        }
    })

    let outputSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(DAILY_TRACKER_SHEETNAME);
    let lastRow = outputSheet.getLastRow();
    outputSheet.getRange(lastRow + 1, 1).setValue(new Date());
    outputSheet.getRange(lastRow + 1, 2).setValue(investedTotal);
    outputSheet.getRange(lastRow + 1, 3).setValue(currentTotal);
}

function updateInstrumentMetadata(data, sheet){
    try{
        let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

        let newInstrumentRow = headers.map(header => {
            let key = Object.keys(data).find(key => key.toLowerCase() === header.toLowerCase())
            if (key) {
                return data[key]
            }
            else if(header.toLowerCase() === "id"){
                return sheet.getLastRow();
            }
        });

        sheet.appendRow(newInstrumentRow);

        return {
            statusCode: 200,
            status: "Success",
        }
    }
    catch(e){
        return {
            statusCode: 400,
            status: "ErrorPage while updating instrument metadata: " + e,
        }
    }
}

function updateColumnMetadata(data, columnSheet){
    try{
        let lastRow = columnSheet.getLastRow();
        columnSheet.appendRow([lastRow++, "id", data.name, true, "int"])
        columnSheet.appendRow([lastRow++, "Name", data.name, false, "text"])
        columnSheet.appendRow([lastRow++, "Date", data.name, false, "date"])
        columnSheet.appendRow([lastRow++, "Invested", data.name, false, "currency"])
        columnSheet.appendRow([lastRow++, "Current", data.name, true, "currency"])

        if(data.hasOwnProperty("fields")){
            data.fields.forEach((field)=>{
                if(field.name !== ""){
                    columnSheet.appendRow([lastRow++, field.name, data.name, field.isAutomated, field.dataType])
                }
            })
        }

        return {
            statusCode: 200,
            status: "Success",
        }
    }
    catch(e){
        return {
            statusCode: 400,
            status: "ErrorPage while updating column metadata: " + e,
        }
    }
}

function addInstrumentSheet(data){
    try{
        let ss = SpreadsheetApp.getActiveSpreadsheet();
        let newSheet = ss.insertSheet();
        newSheet.setName(data.name)

        let headerRow = ["id", "Name", "Date", "Invested"]
        if(data.fields){
            headerRow.push(...data.fields
                .map(item => item.name)
                .filter(name => name && name.trim() !== ""));
        }
        headerRow.push("Current")

        newSheet.appendRow(headerRow);

        return {
            statusCode: 200,
            status: "Success",
        }
    }
    catch(e){
        return {
            statusCode: 400,
            status: "ErrorPage while adding instrument sheet: " + e,
        }
    }
}

function checkValueExistsInColumn(sheet, headerName, valueToCheck) {
    let data = sheet.getDataRange().getValues();

    let headerRow = data[0];
    let columnIndex = headerRow.indexOf(headerName);
    if (columnIndex === -1) {
        throw new Error("Header not found: " + headerName);
    }

    for (let i = 1; i < data.length; i++) {
        if (data[i][columnIndex] === valueToCheck) {
            return true;
        }
    }

    return false;
}

function deleteRowsWithValue(sheet, headerName, valueToDelete) {
    if (!sheet) {
        return;
    }

    let dataRange = sheet.getDataRange();
    let data = dataRange.getValues();

    let headerRow = data[0];
    let columnIndex = headerRow.indexOf(headerName);

    if (columnIndex === -1) {
        Logger.log('Header not found: ' + headerName);
        return;
    }

    let rowsToDelete = [];

    for (let i = 1; i < data.length; i++) {
        if (data[i][columnIndex] === valueToDelete) {
            rowsToDelete.push(i + 1);
        }
    }

    for (let j = rowsToDelete.length - 1; j >= 0; j--) {
        sheet.deleteRow(rowsToDelete[j]);
    }
}

function getSheetUrl(spreadsheet, sheet) {
    let sheetId = sheet? sheet.getSheetId() : "";
    return spreadsheet.getUrl() + '#gid=' + (sheetId ? sheetId : "");
}

function fetchSgbPrice(url) {
    try {
        const response = UrlFetchApp.fetch(url);
        const data = JSON.parse(response.getContentText());
        const price = parseFloat(data.price);
        return price;
    } catch (e) {
        console.error("Error fetching or parsing price: " + e.toString());
        return null;
    }
}

function sendMonthlySummaryEmail() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let currentTotal = 0, investedTotal = 0;
    let assetAllocation = [];

    ss.getSheets().forEach((sheet) => {
        let sheetName = sheet.getSheetName().toLowerCase();
        if (sheetName[0] !== METADATA_PREFIX && sheetName[0] !== REPORTS_PREFIX && sheetName[0] !== IGNORE_PREFIX) {
            const data = sheet.getDataRange().getValues();
            if (data.length < 2) return;
            const headers = data[0];
            const rows = data.slice(1);
            let instrumentCurrentTotal = 0.0, instrumentInvestedTotal = 0.0;

            rows.forEach(row => {
                if (row.every(cell => cell === "" || cell === null || cell === undefined)) return;
                row.forEach((value, index) => {
                    const header = headers[index].toLowerCase();
                    if (header === "current") instrumentCurrentTotal += Number(value) || 0;
                    if (header === "invested") instrumentInvestedTotal += Number(value) || 0;
                });
            });

            currentTotal += instrumentCurrentTotal;
            investedTotal += instrumentInvestedTotal;
            if (instrumentCurrentTotal > 0) {
                assetAllocation.push({ name: sheet.getSheetName(), current: instrumentCurrentTotal });
            }
        }
    });

    let trackerSheet = ss.getSheetByName(DAILY_TRACKER_SHEETNAME);
    let prevInvested = investedTotal;
    let prevCurrent = currentTotal;

    if (trackerSheet) {
        let trackerData = trackerSheet.getDataRange().getValues();
        let now = new Date();
        let targetDate = new Date(now);
        targetDate.setMonth(now.getMonth() - 1);

        let closestRow = null;
        let minTimeDiff = Infinity;

        for (let i = trackerData.length - 1; i >= 1; i--) {
            let rowDate = new Date(trackerData[i][0]);
            let timeDiff = Math.abs(rowDate.getTime() - targetDate.getTime());
            if (timeDiff < minTimeDiff) {
                minTimeDiff = timeDiff;
                closestRow = trackerData[i];
            }
        }

        if (closestRow) {
            prevInvested = Number(closestRow[1]) || prevInvested;
            prevCurrent = Number(closestRow[2]) || prevCurrent;
        } else if (trackerData.length > 1) {
            // Fallback if exactly last month's data isn't available
            prevInvested = Number(trackerData[1][1]) || prevInvested;
            prevCurrent = Number(trackerData[1][2]) || prevCurrent;
        }
    }

    let monthlyInvestment = investedTotal - prevInvested;
    let monthlyReturns = (currentTotal - investedTotal) - (prevCurrent - prevInvested);
    let totalReturns = currentTotal - investedTotal;
    let totalReturnsPercent = investedTotal ? (totalReturns / investedTotal * 100).toFixed(2) : "0.00";

    assetAllocation.sort((a, b) => b.current - a.current);
    let allocationHtml = assetAllocation.map(a => `<li><b>${a.name}:</b> ${(a.current / currentTotal * 100).toFixed(2)}% (${formatToIndianCurrency(a.current)})</li>`).join('');

    let emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #4CAF50; text-align: center;">Monthly Portfolio Summary</h2>
          
          <h3>Portfolio Overview</h3>
          <p><b>Total Portfolio Value:</b> ${formatToIndianCurrency(currentTotal)}</p>
          <p><b>Total Invested:</b> ${formatToIndianCurrency(investedTotal)}</p>
          <p><b>Total Returns:</b> <span style="color: ${totalReturns >= 0 ? 'green' : 'red'};">${formatToIndianCurrency(totalReturns)} (${totalReturnsPercent}%)</span></p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
          
          <h3>Previous Month's Performance</h3>
          <p><b>Investments during previous month:</b> ${formatToIndianCurrency(monthlyInvestment)}</p>
          <p><b>Returns generated previous month:</b> <span style="color: ${monthlyReturns >= 0 ? 'green' : 'red'};">${formatToIndianCurrency(monthlyReturns)}</span></p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
          
          <h3>Asset Allocation</h3>
          <ul style="list-style-type: none; padding-left: 0;">
            ${allocationHtml}
          </ul>
          
          <p style="text-align: center; margin-top: 30px; font-size: 0.9em; color: #777;">
            <i>View your full portfolio in the Panam Web App.</i>
          </p>
      </div>
    `;

    let userEmail = Session.getEffectiveUser().getEmail();
    if (userEmail) {
        let textBlob = Utilities.newBlob(emailHtml, MimeType.HTML, MONTHLY_SUMMARY_PDF_NAME);
        let pdfBlob = textBlob.getAs(MimeType.PDF);

        MailApp.sendEmail({
            to: userEmail,
            subject: "Your Monthly Portfolio Summary - Panam",
            body: "Please find your monthly portfolio summary attached.",
            attachments: [pdfBlob]
        });
    }
}

function formatToIndianCurrency(number, decimalCount = 2) {
    try {
        if (typeof number !== "number") number = parseFloat(number);
        if (isNaN(number)) return "₹0.00";
        const isNegative = number < 0;
        const absNumber = Math.abs(number);
        const signPrefix = isNegative ? '-' : '';
        if (absNumber < 1000) return `${signPrefix}₹${absNumber.toFixed(decimalCount)}`;
        let value, suffix;
        if (absNumber < 100000) { value = (absNumber / 1000); suffix = 'K'; }
        else if (absNumber < 10000000) { value = (absNumber / 100000); suffix = 'L'; }
        else { value = (absNumber / 10000000); suffix = 'Cr'; }
        return `${signPrefix}₹${value.toFixed(decimalCount)}${suffix}`;
    } catch (e) {
        return "₹0.00";
    }
}