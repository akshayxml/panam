import React, {useEffect, useState} from "react";
import {formatPercentage, formatToIndianCurrency, getDisplayName} from "../../../utils/common";
import InstrumentDetails from "./InstrumentDetails";

const ValueCard = ({ label, value, valueClass = ''}) => (
    <div>
        <span>{label}</span>
        <p className={valueClass}>{value}</p>
    </div>
);

const DetailsBox = ({aggregatedData, metadata, instruments}) => {
    const [overallData, _] = aggregatedData
    const [dataSource, setDataSource] = useState("overall")

    const overallReturns = overallData.current - overallData.invested;
    const overallReturnsPerc = overallData.invested ? overallReturns/overallData.invested : 0;

    const handleDataSourceChange = (value) => {
        if(instruments.includes(value) || value == "overall")
            setDataSource(value);
    }

    return (
        <>
            <div>
                <h6 className="box-title"> Details </h6>
            </div>
            <hr/>
            <div className="box-content">
                <div className="overall-card">
                    <div>
                        <ValueCard
                            label="Current"
                            value={formatToIndianCurrency(overallData.current, 0, false)}
                        />
                        <ValueCard
                            label="Invested"
                            value={formatToIndianCurrency(overallData.invested, 0, false)}
                        />
                    </div>
                    <div>
                        <ValueCard
                            label="Total Returns"
                            value={`${formatToIndianCurrency(overallReturns, 0, false)} (${formatPercentage(overallReturnsPerc)})`}
                            valueClass={overallReturns > 0 ? 'green-color' : overallReturns < 0 ? 'red-color' : ''}
                        />
                        <ValueCard
                            label="XIRR"
                            value={formatPercentage(overallData.xirr)}
                        />
                    </div>
                </div>
                <InstrumentDetails
                    aggregatedData={aggregatedData}
                    metadata={metadata}
                    dataSource={dataSource}
                    onChange={handleDataSourceChange}/>
            </div>
        </>
    )
}

export default DetailsBox