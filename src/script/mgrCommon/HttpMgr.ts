import MyUtils from "../tools/MyUtils";
import StorageMgr from "./StorageMgr";
import ConfigData, { OS_T } from "../models/ConfigData";
import HttpUtils from "../tools/HttpUtils";
import UserData from "../models/UserData";
import EventMgr from "./EventMgr";
import MyLog from "../tools/MyLog";
import PlatformMgr from "./PlatformMgr";
import WxAdManager from "../platform/wx/WxAdManager";

export default class HttpMgr {
    public static readonly instance: HttpMgr = new HttpMgr();
    private _http:HttpUtils = new HttpUtils();
    private constructor() {
    }

    //广告ID
    public getAllAdsControl():void{
        var self = this;
        var _d: any = {}
        _d.nowVersion = ConfigData.version;
        _d.timeout = self.getAllAdsControl;
            
        this._http.request({
            url: 'getAllAdsControl.action', data: _d, callback: (res) => {
                MyLog.log("getAllAdsControl.action:"+JSON.stringify(res));
                if(res.code == 0 && res.allAdsControl){
                    ConfigData.allAdsControl = JSON.parse(res.allAdsControl);
                    WxAdManager.Instance.init();
                }
        }});
    }

    //登陆
    public login(_d:any): void {
        this._http.request({
            url: 'userLogin.action', data: _d, callback: (res) => {
                MyLog.log("userLogin.action:"+JSON.stringify(res));
                if (res.code == 0) {
                    if(res.sessionId){
                        UserData.sessionId = res.sessionId;
                    }
                    if(_d.success){
                        _d.success(res)
                    }
                }else{
                    // sessionId 过期
                    UserData.sessionId = "";
                    if(_d.fail){
                        _d.fail(res)
                    }
                }
                
            }
        })
    }
    
    //拿线上游戏的json配制
	getConfig(key:string, _callback:Function) {
		this._http.getConfig(key ,_callback);
	}

    //开关配制
    public getSystemConfig(): void {
        this._http.request({
			url: 'getSystemParamList.action', data: { nowVersion: ConfigData.version }, callback: (res) => {
                MyLog.log("getSystemParamList.action:"+JSON.stringify(res));
				if (res.code == 0) {
                    let adL = [];
                    if(res.adInfo){
                        adL = JSON.parse(res.adInfo);
                        if(ConfigData.osType == OS_T.IOS){  //IOS平台删除盒子
                            let len = adL.length;
                            for(let i = len - 1; i >= 0; i--){
                                if(adL[i].toHz == 1){
                                    adL.splice(i,1);
                                }
                            }
                        }
                    }
					ConfigData.ctrlInfo = {
						isShare: res.fuhuoControl == 1,
                    	isWudian:res.positionControl, //误点开关                  
						shareInfo: res.shareInfo,
                        mainAdMy:res.noAd,//banner广告控制 //是否开启自己做的主页的广告条
                        adInfo: adL, 
                        isGoldeggs:res.isGoldeggs,//砸金蛋开关
                        lateDelay:res.lateDelay||[1600,1400,1600,1600,1100,1100],//误点延时//之前填1个数，修改后为数组，分别控制皮肤试用界面、复活界面、结算金币界面、结算界面、在线金币领取界面、离线收益界面的。
                        isGoldeggsReward:res.isGoldeggsReward||1000, //砸金蛋奖励
                        adRefreshTimes:res.adRefreshTimes||0,
                        innerAD_delayed_time:res.innerAD_delayed_time||120000,
                        adDelayedTime:res.adDelayedTime||30000,
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
                    }
                    if(res.wudianLevel){
                        //ConfigData.wudian_level = res.wudianLevel.split(",");
                        let strs = (res.wudianLevel.toString()).split(",");
                        if (strs.length > 0) {      
                            ConfigData.wudian_level = [];          
                            for(let i = 0,imax = strs.length;i<imax;++i){
                                ConfigData.wudian_level.push(parseInt(strs[i]));
                            }
                        }
                        // if(ConfigData.wudian_level.length!=4){
                        //     ConfigData.wudian_level = [1,1,0,0]; //格式错误的话，设置为默认值
                        // }
                    }

                    if (res.lateDelay) {
                        let strs = (res.lateDelay.toString()).split(",");
                        if (strs.length > 0) {      
                            ConfigData.ctrlInfo.lateDelay = [];          
                            for(let i = 0,imax = strs.length;i<imax;++i){
                                ConfigData.ctrlInfo.lateDelay.push(parseInt(strs[i]));
                            }
                        }
                    }

                    if(res.bannerAdIds){
                        ConfigData.bannerAdIds = res.bannerAdIds.split(",");
                    }
                    if(res.innerADIds){
                        ConfigData.interstitialIds = res.innerADIds.split(",");
                    }
                    if(res.rewardedAdIds){
                        ConfigData.rewardedAdIds = res.rewardedAdIds.split(",");
                    }
                    if( ConfigData.rewardedAdIds.length>0){
                        ConfigData.ctrlInfo.isVideo = true; //是否有视屏复活
                    }

                    if(res.inviteFriendsControl){
                        ConfigData.ctrlInfo.inviteFriendsControl = res.inviteFriendsControl;
                    }       
                    if(res.inviteFriendsGolds){
                        ConfigData.ctrlInfo.inviteFriendsGolds = res.inviteFriendsGolds;
                    }
                    if(res.inviteShareMaxCount){
                        ConfigData.ctrlInfo.inviteShareMaxCount = res.inviteShareMaxCount;
                    }
                    if(res.trialAdd){
                        ConfigData.ctrlInfo.trialAdd = res.trialAdd;
                    }
                    if(res.onlineTimes){
                        ConfigData.ctrlInfo.onlineTimes = res.onlineTimes;
                    }
                    if(res.onlineItemSecond){
                        ConfigData.ctrlInfo.onlineItemSecond = res.onlineItemSecond;
                    }
                    if(res.onlineItemGold){
                        ConfigData.ctrlInfo.onlineItemGold = res.onlineItemGold;
                    }
                    ConfigData.ctrlInfo.startOfflineTime = new Date().getTime();
                    if(res.fuhuoUiType){  
                        ConfigData.ctrlInfo.fuhuoUiType = res.fuhuoUiType;      // 1：有跑马灯广告位      2：有分享复活按钮      3：只有视频复活和立即跳过按钮
                    }
                    if(res.shareBntSwitch){
                        ConfigData.ctrlInfo.shareBntSwitch = res.shareBntSwitch;
                    }
                    if(res.videoBntSwitch){
                        ConfigData.ctrlInfo.videoBntSwitch = res.videoBntSwitch;
                    }
                    if(res.marqueeBntSwitch){
                        ConfigData.ctrlInfo.marqueeBntSwitch = res.marqueeBntSwitch;
                    }
                    // if(res.allAdsControl){
                    //     ConfigData.allAdsControl = JSON.parse(res.allAdsControl);
                    //     WxAdManager.Instance.init();
                    // }
                    if(res.backHomeControl){
                        ConfigData.ctrlInfo.backHomeControl = res.backHomeControl;
                    }

                    if (res.btuMove) {
                        let strs = (res.btuMove as string).split(",");
                        if (strs.length > 0) {      
                            ConfigData.ctrlInfo.btuMove = [];          
                            for(let i = 0,imax = strs.length;i<imax;++i){
                                ConfigData.ctrlInfo.btuMove.push(parseInt(strs[i]));
                            }
                        }
                    }
                    if (res.btuAppear) {
                        let strs = (res.btuAppear as string).split(",");
                        if (strs.length > 0) {      
                            ConfigData.ctrlInfo.btuAppear = [];          
                            for(let i = 0,imax = strs.length;i<imax;++i){
                                ConfigData.ctrlInfo.btuAppear.push(parseInt(strs[i]));
                            }
                        }
                    }
                    if (res.adCancelTolist) {
                        let strs = (res.adCancelTolist as string).split(",");
                        if (strs.length > 0) {      
                            ConfigData.ctrlInfo.adCancelTolist = [];          
                            for(let i = 0,imax = strs.length;i<imax;++i){
                                ConfigData.ctrlInfo.adCancelTolist.push(parseInt(strs[i]));
                            }
                        }
                    }
                    if (res.gameBackTolist) {
                        let strs = (res.gameBackTolist as string).split(",");
                        if (strs.length > 0) {      
                            ConfigData.ctrlInfo.gameBackTolist = [];          
                            for(let i = 0,imax = strs.length;i<imax;++i){
                                ConfigData.ctrlInfo.gameBackTolist.push(parseInt(strs[i]));
                            }
                        }
                    }

                    PlatformMgr.callAPIMethodByProxy("init");
				}
                EventMgr.instance.emit("getSystemParamListBack");
			},fail:(res)=>{
                EventMgr.instance.emit("getSystemParamListBack");
            }
		});
    }

    //更新用户信息
    public updateUserInfo(){
        this._http.request({
            url: 'updateUserInfo.action', data: {
                nickname:UserData.nickName,
                headimgurl:UserData.avatarUrl,
                sex:UserData.gender,
            }});
    }

    //统计
    public statisticsPost(_d){
        this._http.requestStatistics({data:_d});
    }

    //开始游戏
    public StartGame(){
        this._http.request({
            url: "startGames.action"
        })
    }

    //用户观看视屏次数达到一定次数后会拉视屏失败 失败后开启分享复活
    public videoCallback(){
        this._http.request({
            url: 'videoCallback.action', callback: (res) => {
                if(res.code == 0){
                    UserData.adCount = res.adCount;    
                }
        }});
    }

    public statisticsbannerUpdateCount(){
        this._http.request({
            url: 'videoCallback.action', data:{type:1}, callback: (res) => {
                if(res.code == 0){
                    UserData.bannerTimes = res.bannerTimes;    
                    // console.log("当前拉取广告次数为:"+USER.bannerTimes + " 拉取广告上线为:" +CONFIG.sysCtrlInfo.adRefreshTimes);
                }
        }});
    }

    public updateUserMoney(coin:number){
        this._http.request({
            url: 'updateUserMoney.action', data:{ 
                sessionId:UserData.sessionId,
                money:coin
             }, 
             callback:(res) => {
                if (res.code == 0) {             
                    UserData.gold = res.userMoney;
                }
            },fail:(res)=>{
                // EventMgr.instance.emit("openTip", "结算失败");
            }
        });
    }

    //获取世界排行数据
    public getWorldRank(_d){
        this._http.request({
            url: 'getWorldRank.action',data: { page: 1, type: 1 }, callback: (res) => {
                if(res.code == 0){
                    if(_d.success){
                        _d.success(res)
                    }   
                }
        }});
    }

    //结算
    public Settlement(pass:boolean,gold:number){
        let json = {
            isPass:pass ? 1 : 0,
            level: pass ? UserData.level - 1 : UserData.level,
            money:gold
        }
        UserData.curMultiple = 1;
        
        this._http.request({
            url: 'settle.action', data: json, callback: (res) => {
				if (res.code == 0) {
                    UserData.level = res.level;
                    UserData.gold = res.userMoney;
                    //UserData.curMultiple = 1;
                    let data = {
                        level:res.level
                    }
                    PlatformMgr.callAPIMethodByProxy("uploadRankDate", data);
                    PlatformMgr.callSubDomainMethodByProxy("upSelfScore",res.level);
				}
			}
        })
    }

    public shareCallback(caller: any, fun: any) {
        var action = "shareCallback.action";
        var data: any = {
            sessionId: UserData.sessionId,
            nowVersion: ConfigData.version,
        }

        this._http.request({
            url: 'shareCallback.action',
            data:data,
            callback:(res: any) => {
                console.log(" 分享回调:" + JSON.stringify(res));
                if (res && (res.code == 0)) {
                    UserData.inviteShareCount = res.shareCount;
                    UserData.gold = res.userMoney;
    
                    if (fun) {
                        fun.call(caller, res);
                    }
                }
            }
        });
    }

    public getOfflineAward(num:number, caller: any, fun: any) {
        var action = "getOfflineAward.action";
        var data: any = {
            sessionId: UserData.sessionId,
            type: num
        }

        this._http.request({
            url: 'getOfflineAward.action',
            data:data,
            callback:(res: any) => {
                console.log(" 分享回调:" + JSON.stringify(res));
                if (res && (res.code == 0)) {
                 //   UserData.offlineAwardAddMoney = res.addMoney;
                    UserData.gold= res.userMoney;
                    ConfigData.offlineTimeSpent = 0;
                    ConfigData.ctrlInfo.startOfflineTime = new Date().getTime();
    
                    if (fun) {
                        fun.call(caller, res);
                    }
                }
            }
        });
    }

    //购买皮肤
    public buyView(viewId:number, _callback){
        this._http.request({
            url: 'buyView.action', data:{ 
                sessionId:UserData.sessionId,
                systemViewId:viewId
             }, 
             callback:(res) => {
                if (res.code == 0) {             
                    if(_callback){
                        _callback(res);
                    }
                }
            },fail:(res)=>{
                 EventMgr.instance.emit("openTip",  "购买失败，服务器卡了");
            }
        });
    }	

    //解锁皮肤
    public unlockView(type:number,viewId:number, _callback:any){
        this._http.request({
            url: 'unlockView.action', data:{ 
                sessionId:UserData.sessionId,
                type:type,
                systemViewId:viewId
             }, 
             callback:(res) => {
                if (res.code == 0) {             
                    if(_callback){
                        _callback(res);
                    }
                }
            },fail:(res)=>{
                 EventMgr.instance.emit("openTip", "解锁失败，服务器卡了");
            }
        });
    }	

    //换皮肤
    public changeView(viewId:number){
        this._http.request({
            url: 'changeView.action', data:{ 
                sessionId:UserData.sessionId,
                systemViewId:viewId
             }, 
             callback:(res) => {
                if (res.code == 0) {             
                    UserData.curSelectViewId = res.systemViewId;
                }
            },fail:(res)=>{
                EventMgr.instance.emit("openTip", "切换失败，服务器卡了");
            }
        });
    }	
}

export var MessageE = {

}