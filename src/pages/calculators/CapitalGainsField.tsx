import React, {useState} from "react";
import TextField from "@mui/material/TextField";
import {getCapitalGainsData} from "../../utils/calculator.utils";
import {formatPercentage, formatToIndianCurrency} from "../../utils/common";

const MuiTextField = ({value, setValue}) => {
    return <TextField
        type="number" size="small"
        value={value}
        onChange={(event) => {
            setValue(event.target.value)
        }}
        InputProps={{ inputProps: { min: 0} }}
        InputLabelProps={{
            style: { color: 'var(--soft-color)' },
        }}
        sx={{
            width: '35px',
            height: '25px',
            marginRight: '3px',
            marginLeft: '3px',
            input: {
                color: 'var(--soft-color)'
            },
            "& .MuiInputBase-input": {
                fontSize: 10,
                height: 4,
                padding: 1
            },
            '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                    borderColor: 'var(--soft-color)'
                }
            },
            "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                borderColor: 'var(--ultra-soft-color)',
            },
            '& input[type=number]': {
                'MozAppearance': 'textfield'
            },
            '& input[type=number]::-webkit-outer-spin-button': {
                'WebkitAppearance': 'none',
                margin: 0
            },
            '& input[type=number]::-webkit-inner-spin-button': {
                'WebkitAppearance': 'none',
                margin: 0
            }
        }}
    />;
};

const CalculatedValueBox = ({label, percentageShare, amount, taxPercentage}) => {
    return (
        <div className="calculated-data-values">
            <div className="calculated-data-value-box">
                <div className="label">
                    {label}
                    {percentageShare >= 0 && percentageShare <= 100 &&
                        <>
                            <hr style={{width: percentageShare*80}}/>
                            <p>{formatPercentage(percentageShare)}</p>
                        </>
                    }
                </div>
                <div className="value-minibox">
                    <div className={`${amount > 0 ? 'green-color' : amount < 0 ? 'red-color' : ''} value-main`}>
                        {formatToIndianCurrency(amount, 0, false)}
                    </div>
                    <div className="value-sub">
                        {formatToIndianCurrency((Math.max(0,amount*taxPercentage))/100, 0, false)} tax
                    </div>
                </div>
            </div>

        </div>
    )
}

const CapitalGainsField = ({
                               selectedInstrument,
                               selectedUnitField,
                               selectedBuyNavField,
                               selectedCurrentNavField,
                               transactionsRowMap,
                               fieldName,
}) => {
    if(!selectedInstrument)
        return <div></div>

    const [shortTermPeriod, setShortTermPeriod] = useState(12);
    const [shortTermTax, setShortTermTax] = useState(20);
    const [longTermTax, setLongTermTax] = useState(12.5);

    const [longTermValue, shortTermValue] =
        getCapitalGainsData(transactionsRowMap, selectedInstrument, fieldName,
            selectedUnitField, selectedBuyNavField, selectedCurrentNavField,
            shortTermPeriod)

    const shortTermPercentage = shortTermValue/(shortTermValue+longTermValue)
    const longTermPercentage = longTermValue/(shortTermValue+longTermValue)

    return (
        <div className="calculated-data-row">
            <div className="calculated-data-options">
                <div className="field-name">
                    {fieldName}
                </div>
                <div className="input-field">
                    Short Term Period
                    <MuiTextField value={shortTermPeriod} setValue={setShortTermPeriod}/>
                    <span style={{color: 'var(--ultra-soft-color)'}}>months </span>
                </div>
                <div className="input-field">
                    Short Term Tax
                    <MuiTextField value={shortTermTax} setValue={setShortTermTax}/>
                    <span style={{color: 'var(--ultra-soft-color)'}}>% </span>
                </div>
                <div className="input-field">
                    Long Term Tax
                    <MuiTextField value={longTermTax} setValue={setLongTermTax}/>
                    <span style={{color: 'var(--ultra-soft-color)'}}>% </span>
                </div>
            </div>
            <div className="calculated-value-box-container">
                <CalculatedValueBox label="Short Term" percentageShare={shortTermPercentage} amount={shortTermValue} taxPercentage={shortTermTax}/>
                <CalculatedValueBox label="Long Term" percentageShare={longTermPercentage} amount={longTermValue} taxPercentage={longTermTax}/>
            </div>
        </div>
    )
}

export default CapitalGainsField