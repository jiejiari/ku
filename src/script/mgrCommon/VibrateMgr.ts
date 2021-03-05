import ConfigData from "../models/ConfigData";
import PlatformMgr from "./PlatformMgr";

export default class VibrateMgr {
   
    
    static vibrateShort(): void {
        PlatformMgr.callAPIMethodByProxy("vibrateShort");
    }

    static vibrateLong(): void {
        PlatformMgr.callAPIMethodByProxy("vibrateLong");
    }
}