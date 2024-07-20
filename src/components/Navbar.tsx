import LogoIcon from "../../public/logo_light.svg";
import GithubIcon from "../../public/github.svg";
import AddIcon from "../../public/add.svg";
import RefreshIcon from "../../public/refresh.svg";
import SettingsIcon from "../../public/settings.svg";
import MenuIcon from '@mui/icons-material/Menu';

const Navbar = ({onRefresh,
                    onOpenAdd,
                    setHamburgerToggle}) => {

    return (
        <div className="navbar">
            <div className="logo-box">
                <LogoIcon className="logo"/>
                <span>
                    Panam
                </span>
            </div>
            <div className="hamburger" onClick={() => {
                setHamburgerToggle()}
            }
            >
                <MenuIcon/>
            </div>
            <div className="icons">
                <AddIcon className="icon" onClick={()=>onOpenAdd(true)}/>
                <RefreshIcon className="icon" onClick={onRefresh}/>
                <GithubIcon className="icon"/>
                <SettingsIcon className="icon"/>
            </div>

        </div>
    )
}

export default Navbar