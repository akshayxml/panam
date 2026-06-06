import {GiReceiveMoney, GiMoneyStack} from "react-icons/gi";
import {GrOverview, GrGrow} from "react-icons/gr";
import { FaSackDollar, FaArrowUpRightDots } from "react-icons/fa6";
import {FaLock, FaPiggyBank, FaShieldAlt, FaMoneyBill, FaHome, FaHandHoldingMedical, FaExternalLinkAlt, FaFolderPlus} from "react-icons/fa";
import {AiFillGold, AiFillDollarCircle} from "react-icons/ai";
import { CgEditBlackPoint } from "react-icons/cg";
import { RiMoneyRupeeCircleFill, RiDeleteBin2Fill } from "react-icons/ri";
import { MdOutlineStackedLineChart } from "react-icons/md";
import { MdElderly } from "react-icons/md";
import { PiImageBrokenThin } from "react-icons/pi";
import { MdRedeem } from "react-icons/md";
import { FaCalendarDay } from "react-icons/fa";
import { GiArrowScope } from "react-icons/gi";

export const iconMap = {
    "_overview": <GrOverview/>,
    "_generic": <CgEditBlackPoint/>,
    "_postadd": <FaFolderPlus/>,
    "_link": <FaExternalLinkAlt/>,
    "_delete": <RiDeleteBin2Fill/>,
    "_uparrowright": <FaArrowUpRightDots/>,
    "_error": <PiImageBrokenThin/>,
    "_redeem": <MdRedeem/>,
    "_calendar": <FaCalendarDay/>,
    "piggy": <FaPiggyBank />,
    "shield": <FaShieldAlt/>,
    "gold": <AiFillGold />,
    "lock": <FaLock/>,
    "receivemoney": <GiReceiveMoney/>,
    "rupeecircle": <RiMoneyRupeeCircleFill/>,
    "lines": <MdOutlineStackedLineChart/>,
    "moneybill": <FaMoneyBill/>,
    "dollarsack": <FaSackDollar/>,
    "dollarcircle": <AiFillDollarCircle/>,
    "moneystack": <GiMoneyStack/>,
    "plant": <GrGrow/>,
    "home": <FaHome/>,
    "elderly": <MdElderly/>,
    "medical": <FaHandHoldingMedical/>,
    "arrowscope": <GiArrowScope />,
};