import Home from "./pages/Home";
import {
    createBrowserRouter,
    RouterProvider,
    Outlet,
} from "react-router-dom";
import Instruments from "./pages/Instruments";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Menu from "./components/Menu";
import React, { useEffect, useState } from 'react';
import Add from "./components/Add/Add";
import DynamicIcons from "./components/DynamicIcons";

function App() {
    console.log(process.env.NODE_ENV)
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedMenuItem, setSelectedMenuItem] = useState("");
    const [openAdd, setOpenAdd] = useState(false);
    const fetchSheetData = () => {
        console.log("fetching...")
        setLoading(true);
        if (process.env.NODE_ENV == "development"){
            let data = {"instruments": ["mutualfund", "epf", "fdss", "lic", "nps", "sgb"],
                "headerMap":{"mutualfund":["id","Name"],"epf":["id","Name"]},
                "dataMap":{"mutualfund":[[1,"Mirae"]],"epf":[[1,"Contr"]]},
            };
            setData(data);
            setLoading(false);
        }
        else{
            google.script.run.withSuccessHandler((data) => {
                setData(JSON.parse(data));
                console.log("data ", JSON.parse(data).config)
                setLoading(false)
            }).withFailureHandler((error) => {
                console.error("Error fetching data:", error);
                setData([]);
                setLoading(false);
            }).fetchData();
        }
    };

    useEffect(() => {
        fetchSheetData();
    }, []);

    let Layout = () =>{
        return (
            <div className="main">
                <Navbar onRefresh={fetchSheetData} onOpenAdd={setOpenAdd}/>
                <div className="container">
                    <div className="menuContainer">
                        <Menu instruments={data?.instruments} selectedMenuItem={selectedMenuItem} setSelectedMenuItem={setSelectedMenuItem}/>
                    </div>
                    <div className="contentContainer">
                        <Outlet/>
                        {openAdd && <Add
                            instruments={data?.instruments}
                            headerMap={data?.headerMap}
                            dataMap={data?.dataMap}
                            setOpenAdd={setOpenAdd}
                        />}
                    </div>
                </div>
                <Footer/>
            </div>
        )
    }
    if(loading){
        Layout = () => {
            return <div>Loading..</div> //TODO setup loading icon
        }
    }
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Layout/>,
            children: [
                {
                    path: "/",
                    element: (
                        <Home/>
                    ),
                },
                {
                    path: "transactions",
                    element: <Instruments
                        headerMap={data?.headerMap}
                        data={data?.dataMap}
                        config={data?.config}
                        instrument={selectedMenuItem}
                    />,
                },
            ],
        },
        {
            path: "*",
            element: <Layout/>,
            children: [
                {
                    path: "*",
                    element: (
                        <Home/>
                    ),
                },
            ]
        }
    ]);
    return (
        <RouterProvider router={router} />
    );
}

export default App