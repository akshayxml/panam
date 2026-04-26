import Navbar from "../components/Navbar";
import Menu from "../components/Menu";
import {Outlet} from "react-router-dom";
import AlertBox from "../components/AlertBox";
import Footer from "../components/Footer";
import React, {useState} from "react";
import Loading from "../components/Loading";
import Settings from "../components/Settings";
import Dialog from "../components/dialog/Dialog";
import Chatbot from "../components/Chatbot";

const Layout = ({ data,
    fetchSheetData,
    setSelectedMenuItem,
    selectedMenuItem,
    setDialogType,
    dialogType,
    setAlertDetails,
    setAlert,
    alertDetails,
    loading,
    dialogProps,
    setDialogProps
}) =>{
    const [hamburgerToggle, setHamburgerToggle] = useState(false);
    const [showSettings, setShowSettings] = useState(false)

    const changeHamburgerToggle = () => {
        setHamburgerToggle(prevState => !prevState)
    }

    const handleMenuClick = (value) => {
        setSelectedMenuItem(value)
        setHamburgerToggle(!hamburgerToggle)
    }

    return (
        <div className="main">
            <Navbar
                    onRefresh={fetchSheetData}
                    dialogType={dialogType}
                    setDialogType={setDialogType}
                    showSettings={showSettings}
                    onShowSettings={setShowSettings}
                    setHamburgerToggle={changeHamburgerToggle}/>
            <div className="container">
                <Menu
                    instruments={data?.instruments}
                    metadata={data?.metadata}
                    selectedMenuItem={selectedMenuItem}
                    handleMenuClick={handleMenuClick}
                    hamburgerToggle={hamburgerToggle}
                />
                <Settings
                    data={data}
                    showSettings={showSettings}
                    setShowSettings={setShowSettings}
                />
                <div className="content-container">
                    <Outlet/>
                    {loading && <Loading className="loading-overlay"/>}
                    {Object.keys(alertDetails).length > 0 &&
                        <AlertBox
                            alertDetails={alertDetails}
                            setAlertDetails={setAlertDetails}
                        />
                    }
                    {dialogType != '' && <Dialog
                        dialogType={dialogType}
                        setDialogType={setDialogType}
                        instruments={data?.instruments}
                        transactionsColumnMap={data?.transactionsColumnMap}
                        selectedMenuItem={selectedMenuItem}
                        setSelectedMenuItem={setSelectedMenuItem}
                        setAlert={setAlert}
                        metadata={data?.metadata}
                        fetchSheetData={fetchSheetData}
                        dialogProps={dialogProps}
                        setDialogProps={setDialogProps}
                        reports={data?.reports}
                    />}
                </div>
            </div>
            <Footer/>
            <Chatbot />
        </div>
    )
}

export default Layout