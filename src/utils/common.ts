
import moment from "moment/moment";

export function getDisplayName(instrumentsMetadata, instrument) {
    try{
        const entry = instrumentsMetadata.find(item => item.Name.toLowerCase() === instrument.toLowerCase());
        return entry ? entry["Label"] : instrument;
    }
    catch (e){
        console.error(e)
        return instrument
    }
}

export function convertToJson(dataArray){
    try{
        return dataArray && Object.keys(dataArray).length ? dataArray.reduce((acc, item) => {
            const { Name, ...rest } = item;
            acc[Name] = rest;
            return acc;
        }, {}) : {};
    }
    catch (e){
        console.error(e);
        return {}
    }
}

const truncateNumber = (number, decimalCount = 2) => {
    try{
        const isNegative = number < 0;
        const absNumber = Math.abs(number);
        const signPrefix = isNegative ? '-' : ''; 

        if (absNumber < 1000) {
            // Round to avoid floating point noise (e.g. 0.30000000000000004) while keeping integers short.
            const rounded = parseFloat(absNumber.toFixed(decimalCount));
            if (rounded < 1000) {
                return `${isNegative && rounded !== 0 ? '-' : ''}${rounded}`;
            }
        }

        let value;
        let suffix;

        if (absNumber < 100000) {
            value = (absNumber / 1000);
            suffix = 'K';
        } else if (absNumber < 10000000) { 
            value = (absNumber / 100000);
            suffix = 'L'; 
        } else { 
            value = (absNumber / 10000000);
            suffix = 'Cr'; 
        }

        const formattedValue = value.toFixed(decimalCount);
        return `${signPrefix}${formattedValue}${suffix}`; 
    }
    catch (e){
        console.error(e)
        return number;
    }
};

function formatNumberWithLocale(number, symbol = '', decimalCount = 2){
    try{
        const fixedNumber = number.toFixed(decimalCount);
        const parts = fixedNumber.split('.');
        const integerPart = Number(parts[0]).toLocaleString('en-IN');
        const decimalPart = parts[1];

        return `${symbol}${integerPart}${decimalCount > 0 ? '.'+decimalPart : ''}`;
    }
    catch (e){
        console.error(e);
        return 0;
    }
}

export function formatToIndianCurrency(number, decimalCount = 2, truncate = true) {
    const symbol = '₹';
    if(typeof number !== "number"){
        // parseFloat (not parseInt) so numeric strings keep their decimals.
        number = parseFloat(String(number).replace(/,/g, ''));
    }
    if(!Number.isFinite(number)){
        number = 0;
    }
    let value = number
    try{
        value = truncate
            ? `${symbol}${truncateNumber(number, decimalCount)}`
            : `${formatNumberWithLocale(number, symbol, decimalCount)}`;
    }
    catch (e){
        return 0;
    }
    return value;
}

export function formatPercentage(number){
    try {
        return (100 * number).toFixed(1) + '%'
    }
    catch (e){
        return 0 + '%';
    }
}

export function getMainBoxData(instrumentsAggregatedData, itemLimit, instrumentsMetadataJson){
    try{
        const sortedInstruments = Object.keys(instrumentsAggregatedData).map((instrument) => {
            const current = instrumentsAggregatedData[instrument]["current"];
            const invested = instrumentsAggregatedData[instrument]["invested"];
            const difference = instrumentsAggregatedData[instrument]["difference"];

            return {
                instrument,
                invested,
                current,
                difference,
            };
        }).sort((a, b) => b.current - a.current);

        const others = sortedInstruments.slice(itemLimit-1).reduce((acc, instrument) => {
            acc.current += instrument.current;
            acc.invested += instrument.invested;
            acc.difference += instrument.difference;
            return acc;
        }, { instrument: 'Others', current: 0, invested: 0, difference: 0 });

        if(sortedInstruments.length > itemLimit){
            sortedInstruments.splice(itemLimit-1)
            sortedInstruments.push(others);
            instrumentsMetadataJson["Others"] = {
                Label: "Others",
                Icon: "_genericn"
            }
        }

        return sortedInstruments
    }
    catch (e){
        console.error(e)
        return []
    }
}

export function dateReviver(key, value) {
    if (typeof value === 'string' && moment(value, moment.ISO_8601, true).isValid()) {
        return moment(value).toDate();
    }
    return value;
}

export function capitalizeFirstLetter(label){
    return label.charAt(0).toUpperCase() + label.slice(1);
}

export function getDataTypeMap(columnMetadata){
    if(!columnMetadata || Object.keys(columnMetadata).length === 0)
        return {}
    return columnMetadata.reduce((acc, item)=>{
        acc[item.Column] = item.DataType
        return acc;
    }, {});
}

export function objHasKey(object, key){
    return Object.keys(object).find(item => item.toLowerCase() === key.toLowerCase());
}