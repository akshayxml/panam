import {getAggregatedData} from "./aggregator";
import getXirr from 'xirr';

const METADATA_PREFIX = '_'
const REPORTS_PREFIX = '+'

// Rows where every cell is empty (e.g. blank rows left between entries in a sheet) carry no data.
function isBlankRow(row) {
    return row.every(cell => cell === '' || cell === null || cell === undefined);
}

/**
 * Processes data and extracts various maps and instruments.
 *
 * @param {Object} data - The data to be processed.
 * @returns {Array} An array containing transactionsMap, reportsMap, metadataMap, headerMap, and instruments.
 */
function processData(data){
    try{
        let headerMap = {}
        let transactionsMap = {}
        let metadataMap = {}
        let reportsMap = {}
        let instruments = []

        Object.keys(data).forEach((key) => {
            if (key[0] == REPORTS_PREFIX) {
                reportsMap[key.slice(1)] = convertToJSON(data[key]);
            }
            else if (key[0] == METADATA_PREFIX) {
                metadataMap[key.slice(1)] = convertToJSON(data[key]);
            }
            else {
                instruments.push(key)
                const headers = [...data[key][0]];
                const rows = data[key].slice(1).filter(row => !isBlankRow(row));
                headerMap[key] = headers
                headerMap[key].push("XIRR")

                transactionsMap[key] = rows.map(row => {
                    let obj = {};
                    row.forEach((value, index) => {
                        obj[headers[index]] = value;
                    });
                    let cashFlows = [
                        { amount: -obj["Invested"], when: obj["Date"] },
                        { amount: obj["Current"], when: new Date() }
                    ];
                    try{
                        obj["XIRR"] = getXirr(cashFlows)
                    }
                    catch (e){
                        obj["XIRR"] = 0.0
                    }
                    return obj;
                });
            }
        });

        return [transactionsMap, reportsMap, metadataMap, headerMap, instruments];
    }
    catch (e){
        console.error(e)
        return [{}, {}];
    }
}

function convertToJSON(array) {
    const headers = array[0];
    const rows = array.slice(1).filter(row => !isBlankRow(row));

    return rows.map(row => {
        let obj = {};
        row.forEach((value, index) => {
            obj[headers[index]] = value;
        });
        return obj;
    });
}

function getMetadataRowMap(data){
    return Object.keys(data).reduce((metadataMap, key) => {
        if (key[0] == METADATA_PREFIX) {
            metadataMap[key.slice(1)] = convertToJSON(data[key]);
        }
        return metadataMap;
    }, {});
}

function getReportsRowMap(data){
    return Object.keys(data).reduce((reportsMap, key) => {
        if (key[0] == REPORTS_PREFIX) {
            reportsMap[key.slice(1)] = convertToJSON(data[key]);
        }
        return reportsMap;
    }, {});
}

function getTransactionsColumnMap(data){
    return Object.keys(data).reduce((transactionsMap, key) => {
        if (key[0] !== METADATA_PREFIX && key[0] != REPORTS_PREFIX) {
            const headers = data[key][0]
            const rows = data[key].slice(1).filter(row => !isBlankRow(row));
            let columnMap = {}
            headers.forEach((header, columnIndex) => {
                columnMap[header] = rows.map(row => row[columnIndex]);
            });
            transactionsMap[key] = columnMap
        }
        return transactionsMap;
    }, {});
}

function getProcessedData(data){
    let [transactionsRowMap, reports, metadata, headerMap, instruments] = processData(data)
    let aggregatedData = getAggregatedData(transactionsRowMap, metadata)
    let transactionsColumnMap = getTransactionsColumnMap(data);

    return {
        transactionsRowMap: transactionsRowMap,
        metadata: metadata,
        instruments: instruments,
        headerMap: headerMap,
        reports: reports,
        aggregatedData: aggregatedData,
        transactionsColumnMap: transactionsColumnMap,
    }
}

export default getProcessedData;