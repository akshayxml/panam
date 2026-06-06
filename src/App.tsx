import React, { useState, useEffect, createContext, useContext } from 'react';
import {
    createBrowserRouter,
    RouterProvider,
    Outlet 
} from 'react-router-dom';

import Layout from './pages/Layout'; 
import Home from './pages/Home';
import Instruments from './pages/Instruments';
import AddInstrument from './pages/AddInstrument';
import DeleteInstrument from './pages/DeleteInstrument';
import CapitalGains from './pages/calculators/CapitalGains';
import Redemption from './pages/calculators/Redemption';
import CostPerDay from './pages/calculators/CostPerDay';
import Sip from './pages/calculators/Sip';
import ErrorBoundary from './components/external/ErrorBoundary';
import {devData} from "./devdata.js";
import getProcessedData from "./utils/dataProcessor";
import {dateReviver} from "./utils/common";

export const AppContext = createContext(null);

function LayoutWrapper() {
    const context = useContext(AppContext);
    if (!context) return <p>Loading...</p>; 

    return (
        <ErrorBoundary>
            <Layout
                data={context.data}
                fetchSheetData={context.fetchSheetData}
                setSelectedMenuItem={context.setSelectedMenuItem}
                selectedMenuItem={context.selectedMenuItem}
                setDialogType={context.setDialogType}
                dialogType={context.dialogType}
                setAlertDetails={context.setAlertDetails}
                setAlert={context.setAlert}
                alertDetails={context.alertDetails}
                loading={context.loading}
                dialogProps={context.dialogProps}
                setDialogProps={context.setDialogProps}
            />
        </ErrorBoundary>
    );
}

function HomeWrapper() {
    const context = useContext(AppContext);
    if (!context) return null;
    return (
         <ErrorBoundary> 
            <Home
                instruments={context.data?.instruments}
                metadata={context.data?.metadata}
                reports={context.data?.reports}
                aggregatedData={context.data?.aggregatedData}
            />
         </ErrorBoundary>
    );
}

function InstrumentsWrapper() {
    const context = useContext(AppContext);
    if (!context) return null;
    return (
        <ErrorBoundary>
            <Instruments
                headerMap={context.data?.headerMap}
                transactionsRowMap={context.data?.transactionsRowMap}
                metadata={context.data?.metadata}
                instrument={context.selectedMenuItem} 
                setSelectedMenuItem={context.setSelectedMenuItem}
                setDialogType={context.setDialogType}
            />
        </ErrorBoundary>
    );
}

function AddInstrumentWrapper() {
    const context = useContext(AppContext);
    if (!context) return null;
    return (
        <AddInstrument
            metadata={context.data?.metadata}
            setAlert={context.setAlert}
            fetchSheetData={context.fetchSheetData}
        />
    );
}

function DeleteInstrumentWrapper() {
    const context = useContext(AppContext);
    if (!context) return null;
    return (
        <DeleteInstrument
            metadata={context.data?.metadata}
            setDialogType={context.setDialogType}
            setDialogProps={context.setDialogProps}
            handleInstrumentDelete={context.handleInstrumentDelete}
        />
    );
}

function CapitalGainsWrapper() {
    const context = useContext(AppContext);
    if (!context) return null;
    return (
        <CapitalGains
            metadata={context.data?.metadata}
            transactionsRowMap={context.data?.transactionsRowMap}
            aggregatedData={context.data?.aggregatedData}
        />
    );
}

function RedemptionWrapper() {
    const context = useContext(AppContext);
    if (!context) return null;
    return (
        <Redemption
            metadata={context.data?.metadata}
            transactionsRowMap={context.data?.transactionsRowMap}
            aggregatedData={context.data?.aggregatedData}
        />
    );
}

function CostPerDayWrapper() {
    const context = useContext(AppContext);
    if (!context) return null;
    return (
        <CostPerDay
            costPerDayRowMap={context.data?.reports?.costperday}
            setDialogType={context.setDialogType}
        />
    );
}

function SipWrapper() {
    const context = useContext(AppContext);
    if (!context) return null;
    return (
        <Sip
            aggregatedData={context.data?.aggregatedData}
        />
    );
}

const routerConfig = [
    {
        path: "/",
        element: <LayoutWrapper />,
        children: [
            {
                index: true, 
                element: <HomeWrapper />,
            },
            {
                path: "transactions/:instrumentId",
                element: <InstrumentsWrapper />,
            },
            {
                path: "add/instrument",
                element: <AddInstrumentWrapper />,
            },
            {
                path: "delete/instrument",
                element: <DeleteInstrumentWrapper />,
            },
            {
                path: "calculator/capitalgains",
                element: <CapitalGainsWrapper />
            },
            {
                path: "calculator/redemption",
                element: <RedemptionWrapper />
            },
            {
                path: "calculator/costperday",
                element: <CostPerDayWrapper />
            },
            {
                path: "calculator/sip",
                element: <SipWrapper />
            },
        ],
    },
    {
        path: "*",
        element: <LayoutWrapper />, 
        children: [
            {
                path: "*",
                element: <HomeWrapper />,
            },
        ]
    }
];

const router = createBrowserRouter(routerConfig);

function App() {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedMenuItem, setSelectedMenuItem] = useState(""); 
    const [dialogType, setDialogType] = useState('');
    const [dialogProps, setDialogProps] = useState({});
    const [alertDetails, setAlertDetails] = useState({});

    const fetchSheetData = (enableLoading = true) => {
        console.log("App: fetching sheet data...");
        setLoading(enableLoading);
        if (process.env.NODE_ENV === "development"){
            try {
                let parsedData = JSON.parse(devData, dateReviver);
                console.log("App: Dev data parsed:", parsedData);
                let processed = getProcessedData(parsedData);
                console.log("App: Dev data processed:", processed);
                setData(processed);
                setTimeout(() => {
                    setLoading(false);
                    console.log("App: Dev loading finished.");
                }, 500);
            } catch (error) {
                 console.error("App: Error processing dev data:", error);
                 setData({}); 
                 setLoading(false);
            }
        }
        else {
            // @ts-ignore
            google.script.run.withSuccessHandler((jsonData) => {
                try {
                    const env = process.env.NODE_ENV;
                    const isBeta = env === "beta";
                    console.log(`App: Received ${env} data string (length: ${jsonData?.length})`);
                    if (isBeta) {
                        console.log("Printing fetched data...")
                        console.log(JSON.stringify(jsonData));
                    }

                    let parsedData = JSON.parse(jsonData, dateReviver);
                    if (isBeta) {
                        console.log("App [Beta]: Parsed data:", parsedData);
                    }

                    const processed = getProcessedData(parsedData);
                    setData(processed);
                    setLoading(false);
                    console.log("App: Data processed and loading finished.");
                } catch (error) {
                     console.error("App: Error processing data:", error);
                     setData({});
                     setLoading(false);
                }
            }).withFailureHandler((error) => {
                console.error("App: Error fetching data:", error);
                setData({}); // Set empty data on failure
                setLoading(false);
            }).fetchData(); 
        }
    };

    useEffect(() => {
        fetchSheetData();
    }, []);

    const setAlert = (severity, title, message, timeout) => {
        setAlertDetails(prevState => ({
            ...prevState,
            severity,
            title,
            message,
            timeout,
        }));
    }

     const handleInstrumentDelete = (instrument) => {
        console.log("App: handleInstrumentDelete called for", instrument);
        return new Promise((resolve, reject) => {
            if (process.env.NODE_ENV === "development") {
                 console.log("App: Simulating delete in dev...");
                setTimeout(() => {
                    let response = { statusCode: 200, status: "Success (Simulated)" };
                    setAlert("success", "Success", `Simulated deletion of ${instrument}`, 5);
                    setDialogType('');
                    console.log("App: Simulated delete successful.");
                    resolve(response);
                }, 1500); 
            } else {
                console.log("App: Calling delete script for", instrument);
                // @ts-ignore
                google.script.run
                    .withSuccessHandler((response) => {
                        console.log("App: delete script success:", response);
                        if (response.statusCode >= 200 && response.statusCode < 300) {
                            setAlert("success", "Success", `Deleted ${instrument} successfully.`, 10);
                            setDialogType(''); 
                            fetchSheetData(false);
                            resolve(response);
                        } else {
                             setAlert("error", "Deletion Error", response.status || "Unknown error", 10);
                             reject(response);
                        }
                    })
                    .withFailureHandler((error) => {
                        console.error("App: delete script failure:", error);
                        setAlert("error", "Error", `Failed to delete ${instrument}: ${error.message || error}`, 10);
                        reject(error);
                    })
                    .deleteInstrument(instrument);
            }
        });
    };

    const contextValue = {
        data,
        loading,
        selectedMenuItem,
        setSelectedMenuItem,
        dialogType,
        setDialogType,
        dialogProps,
        setDialogProps,
        alertDetails,
        setAlertDetails, 
        setAlert,
        fetchSheetData,
        handleInstrumentDelete 
    };

    return (
        <AppContext.Provider value={contextValue}>
            <RouterProvider router={router} />
        </AppContext.Provider>
    );
}

export default App;