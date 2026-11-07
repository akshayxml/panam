import React, {useEffect, useState} from "react";
import {Pie, PieChart, ResponsiveContainer, Tooltip} from "recharts";
import convertToDountChartData from "../../utils/donutChart.utils";
import {formatToIndianCurrency, getDisplayName} from "../../utils/common";
import {Radio} from "@mui/material";

const MAX_ITEMS = 6;

const DonutChartBox = ({aggregatedData, metadata}) => {
    if(!aggregatedData)
        return <div></div>
    let [_, instrumentsData] = aggregatedData
    const [data, setData] = useState([])
    const [legendData, setLegendData] = useState([])
    const [dataSource, setDataSource] = useState('overall')
    const [showRadio, setShowRadio] = useState(false)
    const [radioValue, setRadioValue] = useState('name')

    useEffect(() => {
        handleChange(dataSource)
    }, []);

    useEffect(() => {
        handleChange(dataSource)
    }, [radioValue]);

    const instrumentsMetadata = metadata?.instrument

    const handleChange = (value) => {
        setDataSource(value);

        let requiredData;
        if (value.toLowerCase() === "overall") {
            requiredData = instrumentsData;
            setRadioValue("name");
            setShowRadio(false);
        } else {
            requiredData = instrumentsData[value][radioValue];
            if (instrumentsData[value]?.category && Object.keys(instrumentsData[value].category).length) {
                setShowRadio(true);
            } else {
                setRadioValue("name");
                setShowRadio(false);
            }
        }

        const {chartData, legendData} = convertToDountChartData(requiredData, "current", MAX_ITEMS);
        setData(chartData);
        setLegendData(legendData);
    }

    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRadioValue(event.target.value);
    };

    const handleRadioLabelClick = (event, value) => {
        setRadioValue(value);
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip" style={{ backgroundColor: 'var(--soft-bg)', border: '0.5px solid var(--max-soft-color)', padding: '5px', borderRadius: "5px" }}>
                    {payload.map((data, index) => (
                        <div key={index}>
                            <p style={{ fontSize: "12px", marginBottom: 3}}>
                                {`${getDisplayName(instrumentsMetadata, data.name)}`}
                            </p>
                            <p style={{ fontSize: "12px", color: "var(--ultra-soft-color)" }}>
                                {`${formatToIndianCurrency(data.value,2)} (${data.payload.perc.toFixed(2)}%)`}
                            </p>
                        </div>
                    ))}
                </div>
            );
        }

        return null;
    };

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const radius = outerRadius * 1.1;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="var(--ultra-soft-color)" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="label">
                {`${(percent * 100).toFixed(1)}%`}
            </text>
        );
    };

    const CustomLegend = ({payload}) => {
        return (
            <div className="legend-box" style={{}}>
                {payload.map((entry, index) => (
                    <div key={`item-${index}`} className="legend-box-content">
                        <div style={{backgroundColor: entry.fill, width: entry.perc*3}} className="legend-box-square-icon"/>
                        <span className="legend-text">{getDisplayName(instrumentsMetadata, entry.name)} - {entry.perc.toFixed(2)}%</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            <div>
                <h6 className="box-title"> Distribution </h6>
            </div>
            <hr/>
            <div className="box-content" >
                <select
                    className="box-select"
                    onChange={(e)=>{
                        handleChange(e.target.value)
                    }}>
                    <option key="Overall" value="overall">
                        Overall
                    </option>
                    {instrumentsMetadata && instrumentsMetadata.map((element) => (
                        <option key={element.Name} value={element.Name}>
                            {element.Label}
                        </option>
                    ))}
                </select>
                {showRadio &&
                    <div className="radio-group">
                        <div className="radio-box">
                            <Radio
                                checked={radioValue === 'name'}
                                onChange={handleRadioChange}
                                value="name"
                                size="small"
                                inputProps={{ 'aria-label': 'name' }}
                            />
                            <p onClick={(event)=>{handleRadioLabelClick(event, 'name')}}>Name</p>
                        </div>
                        <div className="radio-box">
                            <Radio
                                checked={radioValue === 'category'}
                                onChange={handleRadioChange}
                                value="category"
                                size="small"
                                inputProps={{ 'aria-label': 'category' }}
                            />
                            <p onClick={(event)=>{handleRadioLabelClick(event, 'category')}}>Category</p>
                        </div>
                    </div>
                }
                <ResponsiveContainer aspect={1.2}>
                    <PieChart width={330} height={250}>
                        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%"
                             innerRadius="40%" outerRadius="60%" stroke='var(--soft-bg)' strokeWidth={2}
                             label={renderCustomizedLabel}
                             labelLine={false}
                             />
                        <Tooltip content={CustomTooltip} />
                    </PieChart>
                </ResponsiveContainer>
                <CustomLegend payload={legendData}/>
            </div>
        </>
    )
}

export default DonutChartBox;