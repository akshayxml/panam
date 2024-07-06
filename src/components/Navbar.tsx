import React, {useEffect} from 'react'
import {useLocation} from "react-router-dom";
import LogoIcon from "../../public/logo_light.svg";
import GithubIcon from "../../public/github.svg";
import SearchIcon from "../../public/search.svg";
import SettingsIcon from "../../public/settings.svg";

const Navbar = () => {

    const location = useLocation();

    useEffect(() => {
        console.log(location.pathname);
    }, [location]);

    return (
        <div className="navbar">
            <div className="logoBox">
                <LogoIcon className="logo"/>
                <span>
                    Stonks
                </span>
            </div>
            <div className="icons">
                <SearchIcon className="icon"/>
                <GithubIcon className="icon"/>
                <SettingsIcon className="icon"/>
            </div>

        </div>
    )
}

export default Navbar