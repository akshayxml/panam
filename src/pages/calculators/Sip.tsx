import React, { useState, useMemo } from "react";
import MuiTextField from "../../components/MuiTextField";
import { formatToIndianCurrency } from "../../utils/common";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTheme } from '@mui/material/styles';
import { getDataGridStyles } from '../../styles/ts-styles/muiDataGridStyles';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

interface SipProps {
    aggregatedData: any;
}

const Sip = ({ aggregatedData }: SipProps) => {
    const theme = useTheme();
    const dataGridStyles = getDataGridStyles(theme);

    const overallData = aggregatedData?.[0];
    const portfolioValue = overallData?.current || 0;

    const [monthlyInvestment, setMonthlyInvestment] = useState<number>(10000);
    const [roi, setRoi] = useState<number>(12);
    const [tenure, setTenure] = useState<number>(10);
    const [stepUp, setStepUp] = useState<number>(10);
    const [lumpSumInput, setLumpSumInput] = useState<number>(0);
    const [usePortfolio, setUsePortfolio] = useState<boolean>(false);

    const calculatedData = useMemo(() => {
        const pMonthly = parseFloat(monthlyInvestment as any) || 0;
        const pRoi = parseFloat(roi as any) || 0;
        const pTenure = parseFloat(tenure as any) || 0;
        const pStepUp = parseFloat(stepUp as any) || 0;
        const pLumpSum = usePortfolio ? portfolioValue : (parseFloat(lumpSumInput as any) || 0);

        const monthlyRate = Math.pow(1 + pRoi / 100, 1 / 12) - 1;
        let balance = pLumpSum;
        let totalInvested = pLumpSum;

        const yearlyDetails: any[] = [];
        const totalMonths = Math.floor(pTenure * 12);

        if (totalMonths <= 0) {
            return {
                yearlyDetails: [],
                finalValue: pLumpSum,
                finalInvested: pLumpSum,
                finalReturns: 0
            };
        }

        for (let month = 1; month <= totalMonths; month++) {
            const yearIndex = Math.floor((month - 1) / 12);
            const currentSip = pMonthly * Math.pow(1 + pStepUp / 100, yearIndex);

            balance = (balance + currentSip) * (1 + monthlyRate);
            totalInvested += currentSip;

            if (month % 12 === 0) {
                const yearNum = month / 12;
                const prevYearInvested = yearNum === 1 ? pLumpSum : yearlyDetails[yearNum - 2].totalInvested;
                const annualInvested = totalInvested - prevYearInvested;

                yearlyDetails.push({
                    id: yearNum,
                    year: `Year ${yearNum}`,
                    monthlyInvestment: Math.round(currentSip),
                    annualInvested: Math.round(annualInvested),
                    totalInvested: Math.round(totalInvested),
                    totalValue: Math.round(balance),
                    estReturns: Math.round(balance - totalInvested)
                });
            }
        }

        const finalValue = Math.round(balance);
        const finalInvested = Math.round(totalInvested);
        const finalReturns = Math.round(finalValue - finalInvested);

        return {
            yearlyDetails,
            finalValue,
            finalInvested,
            finalReturns
        };
    }, [monthlyInvestment, roi, tenure, stepUp, lumpSumInput, usePortfolio, portfolioValue]);

    const columns: GridColDef[] = [
        { field: 'year', headerName: 'Year', flex: 1, headerClassName: 'datagrid-header' },
        {
            field: 'monthlyInvestment',
            headerName: 'Monthly SIP',
            flex: 1.5,
            headerClassName: 'datagrid-header',
            type: 'number',
            renderCell: (params) => formatToIndianCurrency(params.value, 0, false)
        },
        {
            field: 'annualInvested',
            headerName: 'Invested This Year',
            flex: 1.5,
            headerClassName: 'datagrid-header',
            type: 'number',
            renderCell: (params) => formatToIndianCurrency(params.value, 0, false)
        },
        {
            field: 'totalInvested',
            headerName: 'Total Invested',
            flex: 1.5,
            headerClassName: 'datagrid-header',
            type: 'number',
            renderCell: (params) => formatToIndianCurrency(params.value, 0, false)
        },
        {
            field: 'totalValue',
            headerName: 'Total Value',
            flex: 1.5,
            headerClassName: 'datagrid-header',
            type: 'number',
            renderCell: (params) => formatToIndianCurrency(params.value, 0, false)
        },
        {
            field: 'estReturns',
            headerName: 'Estimated Returns',
            flex: 1.5,
            headerClassName: 'datagrid-header',
            type: 'number',
            renderCell: (params) => formatToIndianCurrency(params.value, 0, false)
        }
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="tooltip-container">
                    <p className="tooltip-label">{label}</p>
                    <p className="tooltip-value-container">
                        <span className="tooltip-value-first">Invested: {formatToIndianCurrency(payload[0].value, 0, false)}</span>
                    </p>
                    <p className="tooltip-value-container">
                        <span className="tooltip-value-second">Total Value: {formatToIndianCurrency(payload[1].value, 0, false)}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="form-page">
            <div className="form-page-title">
                SIP Calculator
            </div>
            <div className="form calculator-form">
                <div className="calculator-form-top">
                    <div className="calculator-form-top-field">
                        <MuiTextField
                            label="Monthly Investment Amount"
                            value={monthlyInvestment}
                            setValue={setMonthlyInvestment}
                            width="100%"
                            height="100%"
                            fontSize="16px"
                        />
                    </div>
                    <div className="calculator-form-top-field">
                        <MuiTextField
                            label="Expected ROI (%)"
                            value={roi}
                            setValue={setRoi}
                            width="100%"
                            height="100%"
                            fontSize="16px"
                        />
                    </div>
                    <div className="calculator-form-top-field">
                        <MuiTextField
                            label="Tenure (Years)"
                            value={tenure}
                            setValue={setTenure}
                            width="100%"
                            height="100%"
                            fontSize="16px"
                        />
                    </div>
                    <div className="calculator-form-top-field">
                        <MuiTextField
                            label="Step Up (%) per Year"
                            value={stepUp}
                            setValue={setStepUp}
                            width="100%"
                            height="100%"
                            fontSize="16px"
                        />
                    </div>
                    <div className="calculator-form-top-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <MuiTextField
                            label="Lump Sum / Initial Investment"
                            value={usePortfolio ? Math.round(portfolioValue) : lumpSumInput}
                            setValue={setLumpSumInput}
                            width="100%"
                            height="100%"
                            fontSize="16px"
                        />
                    </div>
                    <div className="calculator-form-top-field" style={{ display: 'flex', alignItems: 'center' }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={usePortfolio}
                                    onChange={(e) => setUsePortfolio((e.target as any).checked)}
                                    sx={{
                                        color: 'var(--ultra-soft-color)',
                                        '&.Mui-checked': {
                                            color: 'var(--secondary)',
                                        },
                                    }}
                                />
                            }
                            label={`Use current overall portfolio value (${formatToIndianCurrency(portfolioValue, 0, false)})`}
                            sx={{ color: 'var(--soft-color)' }}
                        />
                    </div>
                </div>

                <div className="sip-summary-cards">
                    <div className="summary-card">
                        <span className="card-label">Total Investment</span>
                        <span className="card-value">{formatToIndianCurrency(calculatedData.finalInvested, 0, false)}</span>
                    </div>
                    <div className="summary-card">
                        <span className="card-label">Est. Returns</span>
                        <span className="card-value">{formatToIndianCurrency(calculatedData.finalReturns, 0, false)}</span>
                    </div>
                    <div className="summary-card">
                        <span className="card-label">Total Value</span>
                        <span className="card-value">{formatToIndianCurrency(calculatedData.finalValue, 0, false)}</span>
                    </div>
                </div>

                {calculatedData.yearlyDetails.length > 0 && (
                    <div style={{ marginTop: '30px' }}>
                        <h3 style={{ color: 'var(--main-color)', marginBottom: '15px', fontSize: '18px' }}>Growth Chart</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={calculatedData.yearlyDetails} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--ternary)" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="var(--ternary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="var(--ultra-soft-color)" />
                                <XAxis
                                    dataKey="year"
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: 'var(--ultra-soft-color)', fontFamily: 'Inter, sans-serif' }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => formatToIndianCurrency(val, 0, true)}
                                    tick={{ fontSize: 12, fill: 'var(--ultra-soft-color)' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend formatter={(value) => value === "totalInvested" ? "Total Invested" : "Total Value"} />
                                <Area type="monotone" dataKey="totalInvested" stroke="var(--ternary)" fillOpacity={1} fill="url(#colorInvested)" />
                                <Area type="monotone" dataKey="totalValue" stroke="var(--secondary)" fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {calculatedData.yearlyDetails.length > 0 && (
                    <div style={{ marginTop: '40px' }}>
                        <h3 style={{ color: 'var(--main-color)', marginBottom: '15px', fontSize: '18px' }}>Yearly Breakdown</h3>
                        <div style={{ height: 400, width: '100%' }}>
                            <DataGrid
                                rows={calculatedData.yearlyDetails}
                                columns={columns}
                                classes={{ cell: 'cellStyle' }}
                                sx={dataGridStyles}
                                disableRowSelectionOnClick
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sip;
