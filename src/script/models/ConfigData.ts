import MyUtils from "../tools/MyUtils";
import StorageMgr from "../mgrCommon/StorageMgr";
import MyLog from "../tools/MyLog";
import HttpMgr from "../mgrCommon/HttpMgr";

export enum MAINBTNSTYPE {
    LANDSCAPE = 0,
    VERTICAL
}

export enum SORTTYPE {
    LEVEL = 0,  //关卡模式
    ENDLESS     //无尽模式
}

export enum OPERATINGTYPE{ //游戏操作方式
    DRAGE = 0, //左右拖拽
    TOUCH      //点击屏幕
}

export enum OS_T{
    IOS,
    Android
}

export default class ConfigData {
    public static encryptDES:boolean = true; //是否加密通讯
    public static encryptDESKey1:string = "qire1";
    public static encryptDESKey2:string = "qire2";
    public static encryptDESKey3:string = "qire3";
    public static mainBtnsType:number = 1;  //主页按钮排列方式使用哪种
    public static beginnerGuide:number = 1; //新手引导类型

    public static releasePlatform = "";//发布平台 wx fb
    public static configs: any = [];
    private static cacheConfigs:Array<{key:string, value:any}> = [];
    public static language:string = "cn";
    public static languageData: any = null;

    public static isLog: boolean = true; //是否开启日志
    public static myAppid = "";
    public static version = "100";
    //public static jsonVersion = "100";
    //public static serverUrl: string = "http://192.168.1.164:8080/";
    //public static serverUrl: string = "http://47.99.178.155:8080/";
    public static serverUrl: string = "https://xyx.biaocr.com/";
    public static statisticsUrl:string = "https://log.zuancr.com";
    //public static jsonVersionUrl: string = "";
    public static aladingStatus:number = 1;  //阿拉丁开关
    public static isCreateAuthorization:boolean = false; //是否创建了授权按钮
    public static repeatAuthorization:boolean = false; //是否创建了授权按钮
    public static isSound: boolean = true;
    public static isVirbort: boolean = true;
    public static allAdsControl = [];
    public static ctrlInfo: any = {
        isShare:0,
        isWudian:0, //误点开关                    
        shareInfo: null,
        mainAdMy:false,//banner广告控制 //是否开启自己做的主页的广告条
        adInfo: null, 
        isGoldeggs:false,//砸金蛋开关
        lateDelay:[1600,1400,1600,1600,1100,1100],//误点延时//之前填1个数，修改后为数组，分别控制皮肤试用界面、复活界面、结算金币界面、结算界面、在线金币领取界面、离线收益界面的。
        isGoldeggsReward:1000, //砸金蛋奖励
        adRefreshTimes:0,
        innerAD_delayed_time:120000,
        adDelayedTime:30000,
        isVideo:1,  //以下是默认值，后面配置
        inviteFriendsControl:0,
        inviteFriendsGolds:1000,
        inviteShareMaxCount:8,
        trialAdd:0.3,
        onlineTimes:360,
        onlineItemSecond:10,
        onlineItemGold:4,
        startOfflineTime:new Date().getTime(),
        fuhuoUiType:3,
        //allAdsControl:[{ad_position_id:1,ad_status:1,ad_type:1,ad_id:""}],
        shareBntSwitch:0,
        videoBntSwitch:0,
        marqueeBntSwitch:0,
        backHomeControl:0,
        btuMove:[],
        btuAppear:[],
        adCancelTolist:[],
        gameBackTolist:[]
    };//游戏控制信息
    public static systemInfo: any = {};//设备系统信息
    public static osType:OS_T;        //操作系统

    public static bannerAdIds = [""];
    public static rewardedAdIds = [""];
    public static interstitialIds = [""];
    
    public static firstTimeOpenMainUI:Boolean = true;

    public static offlineTimeSpent:number = 0;
    public static wudian_level = [1,1,1,1,1,1];
    public static resurgenceADId = 1006;    //复活广告索引

    public static serverUrls = {
        server:"",   
    }

    public static configUrls = {
        level:"",
        
        count: 1
    }

    public static initLocal(){
        ConfigData.isSound = StorageMgr.getLocalSound();
        ConfigData.isVirbort = StorageMgr.getLocalVirbort();
        if (Laya.Browser.onMiniGame) {
            this.releasePlatform = "wx";
            this.systemInfo = wx.getSystemInfoSync();
            if(this.systemInfo && this.systemInfo.system.indexOf("iOS") >= 0)
                this.osType = OS_T.IOS;
			else
                this.osType = OS_T.Android;
        }
    }

    public static RequestConfig(e:string){
        HttpMgr.instance.getConfig(e,(_key,res)=>{
            ConfigData.cacheConfigs.push({key:_key, value:res});
            if(ConfigData.cacheConfigs.length == ConfigData.configUrls.count){    //当所有配置表全部下载完成之后再写入，防止新旧数据不匹配
                for(let i = 0; i < ConfigData.cacheConfigs.length; i++){
                    ConfigData.initConfigData(ConfigData.cacheConfigs[i].key, ConfigData.cacheConfigs[i].value, true);
                }
            }
        });
    }

    public static initConfigData(e:string, _d:any,remote:boolean = false){
        if(remote){
            ConfigData.configs[e] = _d;
        }else{
            if(!ConfigData.configs[e])
                ConfigData.configs[e] = _d;
        }
    }

    public static initServer(data){
        if(data){
            this.encryptDESKey1 = data.encry[0];
            this.encryptDESKey2 = data.encry[1];
            this.encryptDESKey3 = data.encry[2];
            this.serverUrl = data.serverUrl;
            this.statisticsUrl = data.statisticsUrl;
        }
    }

    /**
     * @param configName 配置文件名称
     */
    public static GetConfig(configName:string):any{
        return ConfigData.configs[configName];
    }

    /**
     * @param configName 配置文件名称
     * @param key 要获取的key名称
     * @param value 要获取的key值
     */
    public static GetConfigByKey(configName:string,key:string,value:any):any{
        for (let i = 0; i < ConfigData.configs[configName].length; i++) {
            let findValue = ConfigData.configs[configName][i][key];
            if(findValue == value){
                return ConfigData.configs[configName][i];
            }        
        }
        return null;
    }

    public static getCtrlData(configName: string): any {
        return this.ctrlInfo[configName];
    }

    /**设置声音 */
    static setSound(str) {
        if (!str || str.length <= 0) {
            ConfigData.isSound = true;
            StorageMgr.setLocalSound("");
        } else {
            StorageMgr.setLocalSound("1");
            ConfigData.isSound = false;
        }
    }

    /**
     * 振动设置
     * @param str 
     */
    static setVirbort(str) {
        if (!str || str.length <= 0) {
            ConfigData.isVirbort = true;
            StorageMgr.setLocalVirbort("");
        } else {
            StorageMgr.setLocalVirbort("1");
            ConfigData.isVirbort = false;
        }
    }

    public static getAdData(adId) {
        let srt = this.getCtrlData("adInfo");
        if(MyUtils.isNull(srt)){
            return;
        }
        let adInfos = srt;
        let array = [];
        for (let i = 0; i < adInfos.length; i++) {
            let adInfo = adInfos[i];
            if (adInfo.position == adId) {
                array.push(adInfo);
            }
        }
        return array;
    }
}