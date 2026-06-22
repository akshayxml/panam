import LogoIcon from "./logo.svg";               // string URL
import { ReactComponent as Logo } from "./logo.svg";  // React component
import AddIcon from "../../public/add.svg";
import RefreshIcon from "../../public/refresh.svg";
import SettingsIcon from "../../public/settings.svg";
import MenuIcon from '@mui/icons-material/Menu';

const Navbar = ({   onRefresh,
                    dialogType,
                    setDialogType,
                    showSettings,
                    onShowSettings,
                    setHamburgerToggle}) => {

    return (
        <div className="navbar" onClick={() => {
            if(dialogType)
                setDialogType('')
            if(showSettings)
                onShowSettings(false)
        }}>
            <div className="logo-box">
<img src={LogoIcon} className="logo" alt="Logo" />
                <span>
                    Panam
                </span>
            </div>
            <div className="hamburger" onClick={() => {
                setHamburgerToggle()}}
            >
                <MenuIcon/>
            </div>
            {process.env.NODE_ENV === "development" &&
                <p>
                    This is a demo website. Data cannot be modified.
                </p>
            }
            <div className="icons">
                <div title="Add Transaction">
                    <img src={AddIcon} className="icon" onClick={() => setDialogType('addTransaction')} alt="Add" />                </div>
                <div title="Refresh data">
                    <img src={RefreshIcon} className="icon" onClick={() => onRefresh()} alt="Refresh" />                </div>
                <div id="settings-icon" title="Settings">
                    <img src={SettingsIcon} className="icon" onClick={() => onShowSettings(!showSettings)} alt="Settings" />
                </div>
            </div>

        </div>
    )
}

export default Navbar