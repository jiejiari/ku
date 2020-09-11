import PlatformMgr from "./mgrCommon/PlatformMgr";
import ConfigData from "./models/ConfigData";
import StorageMgr from "./mgrCommon/StorageMgr";
import ViewMgr from "./mgrCommon/ViewMgr";
import StatisticsMgr from "./mgrCommon/StatisticsMgr";
import HttpMgr from "./mgrCommon/HttpMgr";
import UserData from "./models/UserData";

export default class MyInit {
    static init(){
        ConfigData.initLocal();
        StorageMgr.getLocalUserData();
        PlatformMgr.initPlatform();
        ViewMgr.instance.init();
        StatisticsMgr.instance.init();
        
        HttpMgr.instance.getAllAdsControl();
        // new Login().login();
    }
}