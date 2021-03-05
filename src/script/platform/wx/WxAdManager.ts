import ConfigData from "../../models/ConfigData";

export default class WxAdManager {

    private static instance:WxAdManager;
    public static get Instance(){
        if (WxAdManager.instance==null){
            WxAdManager.instance = new WxAdManager;
        }
        return WxAdManager.instance;
    }

    private isInited = false;
    private isInterstitial = false;
    private interstitialList:Array<any> = [];
    public videoPlayedTimes:number = 0;
    
    // public caller:any;
    // public callBackSuc:Function;
    // public callBackFail:Function;
    // public callBackErro:Function;
    // public hasAd:boolean;

    /**
	 * 比较版本号，格式xx.xx.xx
	 * @param v1 当前版本号
	 * @param v2 目标版本号
    */
    public compareVersion(v1, v2): number {
        v1 = v1.split('.')
        v2 = v2.split('.')
        const len = Math.max(v1.length, v2.length)

        while (v1.length < len) {
            v1.push('0')
        }
        while (v2.length < len) {
            v2.push('0')
        }

        for (let i = 0; i < len; i++) {
            const num1 = parseInt(v1[i])
            const num2 = parseInt(v2[i])

            if (num1 > num2) {
            return 1
            } else if (num1 < num2) {
            return -1
            }
        }

        return 0
    }

    public init(){
        if(!Laya.Browser.onMiniGame || this.isInited){
            return;
        }
        if (ConfigData.systemInfo.SDKVersion && this.compareVersion(ConfigData.systemInfo.SDKVersion, "2.0.4") >= 0) {
            this.isInited = true;
            this.showBannerAd_fuhuo(true);
            this.showBannerAd_jiesuanjiemian(true);
            this.showBannerAd_jiesuanjinbi(true);
            this.showBannerAd_shiyongpifu(true);
            this.showBannerAd_zhujiemian(true);
            this.showBannerAd_zhujiemianlingqujinbi(true);

            // this.LoadRewardedVideoAdList();
        }

        if (ConfigData.systemInfo.SDKVersion && this.compareVersion(ConfigData.systemInfo.SDKVersion, "2.6.0") >= 0) {
             // this.isInterstitial = true;
        }
    }

    private getAdInfo(posId:number):any{
        var adInfo = null;
        for(let i=0;i<ConfigData.allAdsControl.length;i++){
            if(ConfigData.allAdsControl[i].ad_position_id==posId){
                adInfo = ConfigData.allAdsControl[i];
            }
        }
        return adInfo;
    }

    private LoadRewardedVideoAdList(){
        ConfigData.allAdsControl.forEach(v=>{
            if(v.ad_type==3){    // ad_tye -- 3：激励视频
                // 201双倍开局，202主界面多倍金币，203试用皮肤，204复活，205结算金币，206商城；
                if(v.ad_position_id==201){
                    this.initRewardedVideoAd_shuangbeikaiju(v.ad_id);
                }else if(v.ad_position_id==202){
                    this.initRewardedVideoAd_zhujiemianduobeijinbi(v.ad_id);
                }else if(v.ad_position_id==203){
                    this.initRewardedVideoAd_shiyongpifu(v.ad_id);
                }else if(v.ad_position_id==204){
                    this.initRewardedVideoAd_fuhuo(v.ad_id);
                }else if(v.ad_position_id==205){
                    this.initRewardedVideoAd_jiesuanjinbi(v.ad_id);
                }else if(v.ad_position_id==206){
                    this.initRewardedVideoAd_shangcheng(v.ad_id);
                }
            }
        });
    }


    //
    private loadInterstitialList(){
        ConfigData.allAdsControl.forEach(v=>{
            if(v.ad_type==1){    // ad_tye -- 1：插屏广告
                this.showInterstitialAd(v.ad_position_id, true);
            }
        });
    }

    public showInterstitialAd(posId:number, onlyLoad:boolean = false):boolean {
        if (!Laya.Browser.onMiniGame||!this.isInterstitial) {
            return false;
        }
        if(!ConfigData.allAdsControl){
            return false;
        }
        var adInfo = this.getAdInfo(posId);
        if(adInfo == null || adInfo.ad_status==0){
            return false;
        }

        // if(Laya.timer.currTimer - this.preBannerTimeList[posId] > 30000){
        //     this.destroyInterstitialAd(posId);
        // }

        if(!this.interstitialList[posId]) {
            this.interstitialList[posId] = window["wx"].createInterstitialAd({adUnitId:adInfo.ad_id,});

            //加载插屏广告。
            if(this.interstitialList[posId]){
                this.interstitialList[posId].load();
            }

            //监听插屏广告加载事件。
            this.interstitialList[posId].onLoad((res) => {

            });
            
            //监听插屏错误事件。
            this.interstitialList[posId].onError((res) => {

            });
            
            //监听插屏广告关闭事件。
            this.interstitialList[posId].onClose((res) => {

            });
        }

        if(onlyLoad){
            return;
        }

        //显示插屏广告。
        if(this.interstitialList[posId]){
            this.interstitialList[posId].show();
        }
    }

    public destroyInterstitialAd(posId:number){
        //销毁插屏广告实例。
        if (this.interstitialList[posId]) {
            this.interstitialList[posId].destroy();
            this.interstitialList[posId] = null;
        }
    }


//----banner
    // 101主界面，102主界面领取金币，103试用皮肤，104复活，105结算金币，106结算界面；
    // 301主界面，302结算界面，303商城

    // 0皮肤试用界面、1复活界面、2结算金币界面、3结算界面、4在线金币领取界面、5离线收益界面的。

    private bannerAd_zhujiemian;
    private bannerAd_zhujiemianlingqujinbi;
    private bannerAd_shiyongpifu;
    private bannerAd_fuhuo;
    private bannerAd_jiesuanjinbi;
    private bannerAd_jiesuanjiemian;

    //主界面Banner
    public showBannerAd_zhujiemian(onlyLoad:boolean = false):boolean {
        if (!Laya.Browser.onMiniGame||!this.isInited) {
            return false;
        }
        if(!ConfigData.allAdsControl){
            return false;
        }
        var adInfo = this.getAdInfo(101);
        if(adInfo == null || adInfo.ad_status==0){
            return false;
        }

        let screenW = ConfigData.systemInfo.windowWidth;
        let _width = (Laya.stage.width/2-140);   // ad_tye -- 2：大banner、4：小banner
        let screenH = ConfigData.systemInfo.windowHeight;

        if(!this.bannerAd_zhujiemian) {
            this.bannerAd_zhujiemian = window["wx"].createBannerAd({
                adUnitId: adInfo.ad_id,
                style: {
                    left: 0,
                    top: screenH - 100,
                    width: _width,
                }
            });
            
            this.bannerAd_zhujiemian.onResize(r => {
                var temAd = WxAdManager.Instance.bannerAd_zhujiemian;
                if(temAd){
                    temAd.style.left = (screenW - temAd.style.realWidth) / 2;
                    temAd.style.top = screenH - temAd.style.realHeight;
                    if (screenH / screenW > 2) {
                        temAd.style.top = temAd.style.top - 10;
                        // console.log("长屏幕手机:",this.bannerHome.style.top);
                    }
                }

            });
            
            this.bannerAd_zhujiemian.onError((res) => {
                // EventMgr.instance.emit(EventDefine.BANNER_ERROR);
                console.log("广告加载错误:", res);
                WxAdManager.Instance.destroyBannerAd_zhujiemian();
            });

            this.bannerAd_zhujiemian.onLoad(()=>{
            });
        }

        if(onlyLoad){
            console.log("预加载广告")
            if (this.bannerAd_zhujiemian != undefined) {
                this.bannerAd_zhujiemian.hide();
            }
            return true;
        }

        if(this.bannerAd_zhujiemian){
            this.bannerAd_zhujiemian.show();
        }


        return true;
    }
    public hideBannerAd_zhujiemian(){
        if (this.bannerAd_zhujiemian) {
            this.bannerAd_zhujiemian.hide();
        }
    }
    public destroyBannerAd_zhujiemian(){
        if(this.bannerAd_zhujiemian){
            this.bannerAd_zhujiemian.destroy();
            this.bannerAd_zhujiemian = null;
        }
    }

    //主界面领取金币Banner
    public showBannerAd_zhujiemianlingqujinbi(onlyLoad:boolean = false):boolean {
        if (!Laya.Browser.onMiniGame||!this.isInited) {
            return false;
        }
        if(!ConfigData.allAdsControl){
            return false;
        }
        var adInfo = this.getAdInfo(102);
        if(adInfo == null || adInfo.ad_status==0){
            return false;
        }

        let screenW = ConfigData.systemInfo.windowWidth;
        let _width = screenW;   // ad_tye -- 2：大banner、4：小banner
        let screenH = ConfigData.systemInfo.windowHeight;

        if(!this.bannerAd_zhujiemianlingqujinbi) {
            this.bannerAd_zhujiemianlingqujinbi = window["wx"].createBannerAd({
                adUnitId: adInfo.ad_id,
                style: {
                    left: 0,
                    top: screenH - 100,
                    width: _width,
                }
            });
            
            this.bannerAd_zhujiemianlingqujinbi.onResize(r => {
                var temAd = WxAdManager.Instance.bannerAd_zhujiemianlingqujinbi;
                if(temAd){
                    temAd.style.left = (screenW - temAd.style.realWidth) / 2;
                    temAd.style.top = screenH - temAd.style.realHeight;
                    if (screenH / screenW > 2) {
                        temAd.style.top = temAd.style.top - 25;
                        // console.log("长屏幕手机:",this.bannerHome.style.top);
                    }
                }

            });
            
            this.bannerAd_zhujiemianlingqujinbi.onError((res) => {
                // EventMgr.instance.emit(EventDefine.BANNER_ERROR);
                console.log("广告加载错误:", res);
                WxAdManager.Instance.destroyBannerAd_zhujiemianlingqujinbi();
            });

            this.bannerAd_zhujiemianlingqujinbi.onLoad(()=>{
                // this.bannerList[posId].show();
            });
        }

        if(onlyLoad){
            console.log("预加载广告");
            if (this.bannerAd_zhujiemianlingqujinbi != undefined) {
                this.bannerAd_zhujiemianlingqujinbi.hide();
            }
            return true;
        }

        if (this.bannerAd_zhujiemianlingqujinbi != undefined) {
            if (ConfigData.wudian_level[4]!=0 && ConfigData.ctrlInfo.isWudian==1) {
                console.log("show_zhujiemianlingqujinbi ConfigData.ctrlInfo.lateDelay[4] = ",ConfigData.ctrlInfo.lateDelay[4]);
                Laya.timer.clear(this,this.show_zhujiemianlingqujinbi);
                Laya.timer.once(ConfigData.ctrlInfo.lateDelay[4], this, this.show_zhujiemianlingqujinbi);

            } else {
                Laya.timer.clear(this,this.show_zhujiemianlingqujinbi);
                Laya.timer.once(700, this, this.show_zhujiemianlingqujinbi);
            }
        }
        return true;
    }
    public show_zhujiemianlingqujinbi(){
        console.log("show_zhujiemianlingqujinbi");
        if(this.bannerAd_zhujiemianlingqujinbi){
            this.bannerAd_zhujiemianlingqujinbi.show();
        }
   
    }
    public hideBannerAd_zhujiemianlingqujinbi(posId:number=NaN){
        if (this.bannerAd_zhujiemianlingqujinbi) {
            this.bannerAd_zhujiemianlingqujinbi.hide();
        }
    }
    public destroyBannerAd_zhujiemianlingqujinbi(){
        if(this.bannerAd_zhujiemianlingqujinbi){
            this.bannerAd_zhujiemianlingqujinbi.destroy();
            this.bannerAd_zhujiemianlingqujinbi = null;
        }
    }

    //试用皮肤Banner
    public showBannerAd_shiyongpifu(onlyLoad:boolean = false):boolean {
        if (!Laya.Browser.onMiniGame||!this.isInited) {
            return false;
        }
        if(!ConfigData.allAdsControl){
            return false;
        }
        var adInfo = this.getAdInfo(103);
        console.log("shiyongpifu adInfo =",adInfo);
        if(adInfo == null || adInfo.ad_status==0){
            return false;
        }

        let screenW = ConfigData.systemInfo.windowWidth;
        let _width = screenW;   // ad_tye -- 2：大banner、4：小banner
        let screenH = ConfigData.systemInfo.windowHeight;

        if(!this.bannerAd_shiyongpifu) {
            this.bannerAd_shiyongpifu = window["wx"].createBannerAd({
                adUnitId: adInfo.ad_id,
                style: {
                    left: 0,
                    top: screenH - 100,
                    width: _width,
                }
            });
            
            this.bannerAd_shiyongpifu.onResize(r => {
                var temAd = WxAdManager.Instance.bannerAd_shiyongpifu;
                if(temAd){
                    temAd.style.left = (screenW - temAd.style.realWidth) / 2;
                    temAd.style.top = screenH - temAd.style.realHeight;
                    if (screenH / screenW > 2) {
                        temAd.style.top = temAd.style.top - 25;
                        // console.log("长屏幕手机:",this.bannerHome.style.top);
                    }
                }

            });
            
            this.bannerAd_shiyongpifu.onError((res) => {
                // EventMgr.instance.emit(EventDefine.BANNER_ERROR);
                console.log("广告加载错误:", res);
                WxAdManager.Instance.destroyBannerAd_zhujiemianlingqujinbi();
            });

            this.bannerAd_shiyongpifu.onLoad(()=>{
                // this.bannerList[posId].show();
            });
        }

        if(onlyLoad){
            console.log("预加载广告")
            if (this.bannerAd_shiyongpifu != undefined) {
                this.bannerAd_shiyongpifu.hide();
            }
            return true;
        }

        if (this.bannerAd_shiyongpifu != undefined) {
            if (ConfigData.wudian_level[0]!=0 && ConfigData.ctrlInfo.isWudian==1) {
                Laya.timer.clear(this,this.show_shiyongpifu);
                console.log("shiyongpifu ConfigData.ctrlInfo.lateDelay[0] ="+ConfigData.ctrlInfo.lateDelay[0]);
                Laya.timer.once(ConfigData.ctrlInfo.lateDelay[0], this, this.show_shiyongpifu);

            } else {
                Laya.timer.clear(this,this.show_shiyongpifu);
                Laya.timer.once(700, this, this.show_shiyongpifu);
            }
        }
        return true;
    }
    public show_shiyongpifu(){
        console.log("show_shiyongpifu");
        if(this.bannerAd_shiyongpifu){
            this.bannerAd_shiyongpifu.show();
        }

    }
    public hideBannerAd_shiyongpifu(posId:number=NaN){
        if (this.bannerAd_shiyongpifu) {
            this.bannerAd_shiyongpifu.hide();
        }
    }
    public destroyBannerAd_shiyongpifu(){
        if(this.bannerAd_shiyongpifu){
            this.bannerAd_shiyongpifu.destroy();
            this.bannerAd_shiyongpifu = null;
        }
    }

    //复活Banner
    public showBannerAd_fuhuo(onlyLoad:boolean = false):boolean {
        if (!Laya.Browser.onMiniGame||!this.isInited) {
            return false;
        }
        if(!ConfigData.allAdsControl){
            return false;
        }
        var adInfo = this.getAdInfo(104);
        console.log("showBannerAd_fuhuo adInfo =",adInfo);
        if(adInfo == null || adInfo.ad_status==0){
            return false;
        }

        let screenW = ConfigData.systemInfo.windowWidth;
        let _width = screenW;   // ad_tye -- 2：大banner、4：小banner
        let screenH = ConfigData.systemInfo.windowHeight;

        if(!this.bannerAd_fuhuo) {
            this.bannerAd_fuhuo = window["wx"].createBannerAd({
                adUnitId: adInfo.ad_id,
                style: {
                    left: 0,
                    top: screenH - 100,
                    width: _width,
                }
            });
            
            this.bannerAd_fuhuo.onResize(r => {
                var temAd = WxAdManager.Instance.bannerAd_fuhuo;
                if(temAd){
                    temAd.style.left = (screenW - temAd.style.realWidth) / 2;
                    temAd.style.top = screenH - temAd.style.realHeight;
                    if (screenH / screenW > 2) {
                        temAd.style.top = temAd.style.top - 25;
                        // console.log("长屏幕手机:",this.bannerHome.style.top);
                    }
                }

            });
            
            this.bannerAd_fuhuo.onError((res) => {
                // EventMgr.instance.emit(EventDefine.BANNER_ERROR);
                console.log("广告加载错误:", res);
                WxAdManager.Instance.destroyBannerAd_zhujiemianlingqujinbi();
            });

            this.bannerAd_fuhuo.onLoad(()=>{
                // this.bannerList[posId].show();
            });
        }

        if(onlyLoad){
            console.log("预加载广告")
            if (this.bannerAd_fuhuo != undefined) {
                this.bannerAd_fuhuo.hide();
            }
            return true;
        }

        if (this.bannerAd_fuhuo != undefined) {
            if (ConfigData.wudian_level[1]!=0 && ConfigData.ctrlInfo.isWudian==1) {
                Laya.timer.clear(this,this.show_fuhuo);
                Laya.timer.once(ConfigData.ctrlInfo.lateDelay[1], this, this.show_fuhuo);
                console.log("shiyongpifu ConfigData.ctrlInfo.lateDelay[1] ="+ConfigData.ctrlInfo.lateDelay[1]);
            } else {
                Laya.timer.clear(this,this.show_fuhuo);
                Laya.timer.once(700, this, this.show_fuhuo);
            }
        }

        return true;
    }
    public show_fuhuo(){
        console.log("show_fuhuo");
        if(this.bannerAd_fuhuo){
            this.bannerAd_fuhuo.show();
        }

    }
    public hideBannerAd_fuhuo(posId:number=NaN){
        if (this.bannerAd_fuhuo) {
            this.bannerAd_fuhuo.hide();
        }
    }
    public destroyBannerAd_fuhuo(){
        if(this.bannerAd_fuhuo){
            this.bannerAd_fuhuo.destroy();
            this.bannerAd_fuhuo = null;
        }
    }

    //结算金币Banner
    public showBannerAd_jiesuanjinbi(onlyLoad:boolean = false):boolean {
        if (!Laya.Browser.onMiniGame||!this.isInited) {
            return false;
        }
        if(!ConfigData.allAdsControl){
            return false;
        }
        var adInfo = this.getAdInfo(105);
        console.log("showBannerAd_jiesuanjinbi adInfo =",adInfo);
        if(adInfo == null || adInfo.ad_status==0){
            return false;
        }

        let screenW = ConfigData.systemInfo.windowWidth;
        let _width = screenW;   // ad_tye -- 2：大banner、4：小banner
        let screenH = ConfigData.systemInfo.windowHeight;

        if(!this.bannerAd_jiesuanjinbi) {
            this.bannerAd_jiesuanjinbi = window["wx"].createBannerAd({
                adUnitId: adInfo.ad_id,
                style: {
                    left: 0,
                    top: screenH - 100,
                    width: _width,
                }
            });
            
            this.bannerAd_jiesuanjinbi.onResize(r => {
                var temAd = WxAdManager.Instance.bannerAd_jiesuanjinbi;
                if(temAd){
                    temAd.style.left = (screenW - temAd.style.realWidth) / 2;
                    temAd.style.top = screenH - temAd.style.realHeight;
                    if (screenH / screenW > 2) {
                        temAd.style.top = temAd.style.top - 25;
                        // console.log("长屏幕手机:",this.bannerHome.style.top);
                    }
                }

            });
            
            this.bannerAd_jiesuanjinbi.onError((res) => {
                // EventMgr.instance.emit(EventDefine.BANNER_ERROR);
                console.log("广告加载错误:", res);
                WxAdManager.Instance.destroyBannerAd_zhujiemianlingqujinbi();
            });

            this.bannerAd_jiesuanjinbi.onLoad(()=>{
                // this.bannerList[posId].show();
            });
        }

        if(onlyLoad){
            console.log("预加载广告");
            if (this.bannerAd_jiesuanjinbi != undefined) {
                this.bannerAd_jiesuanjinbi.hide();
            }
            return true;
        }

        if (this.bannerAd_jiesuanjinbi != undefined) {
            if (ConfigData.wudian_level[2]!=0 && ConfigData.ctrlInfo.isWudian==1) {
                console.log("show_jiesuanjinbi ConfigData.ctrlInfo.lateDelay[2] = ",ConfigData.ctrlInfo.lateDelay[2]);
                Laya.timer.clear(this,this.show_jiesuanjinbi);
                Laya.timer.once(ConfigData.ctrlInfo.lateDelay[2], this, this.show_jiesuanjinbi);

            } else {
                Laya.timer.clear(this,this.show_jiesuanjinbi);
                Laya.timer.once(700, this, this.show_jiesuanjinbi);
            }
        }

        return true;
    }
    public show_jiesuanjinbi(){
        console.log("show_jiesuanjinbi");
        if(this.bannerAd_jiesuanjinbi){
            this.bannerAd_jiesuanjinbi.show();
        }
     
    }
    public hideBannerAd_jiesuanjinbi(posId:number=NaN){
        if (this.bannerAd_jiesuanjinbi) {
            this.bannerAd_jiesuanjinbi.hide();
        }
    }
    public destroyBannerAd_jiesuanjinbi(){
        if(this.bannerAd_jiesuanjinbi){
            this.bannerAd_jiesuanjinbi.destroy();
            this.bannerAd_jiesuanjinbi = null;
        }
    }

    //结算界面Banner
    public showBannerAd_jiesuanjiemian(onlyLoad:boolean = false):boolean {
        if (!Laya.Browser.onMiniGame||!this.isInited) {
            return false;
        }
        if(!ConfigData.allAdsControl){
            return false;
        }
        var adInfo = this.getAdInfo(106);
        if(adInfo == null || adInfo.ad_status==0){
            return false;
        }

        let screenW = ConfigData.systemInfo.windowWidth;
        let _width = screenW;   // ad_tye -- 2：大banner、4：小banner
        let screenH = ConfigData.systemInfo.windowHeight;

        if(!this.bannerAd_jiesuanjiemian) {
            this.bannerAd_jiesuanjiemian = window["wx"].createBannerAd({
                adUnitId: adInfo.ad_id,
                style: {
                    left: 0,
                    top: screenH - 100,
                    width: _width,
                }
            });
            
            this.bannerAd_jiesuanjiemian.onResize(r => {
                var temAd = WxAdManager.Instance.bannerAd_jiesuanjiemian;
                if(temAd){
                    temAd.style.left = (screenW - temAd.style.realWidth) / 2;
                    temAd.style.top = screenH - temAd.style.realHeight;
                    if (screenH / screenW > 2) {
                        temAd.style.top = temAd.style.top - 25;
                        // console.log("长屏幕手机:",this.bannerHome.style.top);
                    }
                }

            });
            
            this.bannerAd_jiesuanjiemian.onError((res) => {
                // EventMgr.instance.emit(EventDefine.BANNER_ERROR);
                console.log("广告加载错误:", res);
                WxAdManager.Instance.destroyBannerAd_zhujiemianlingqujinbi();
            });

            this.bannerAd_jiesuanjiemian.onLoad(()=>{
                // this.bannerList[posId].show();
            });
        }

        if(onlyLoad){
            console.log("预加载广告");
            if (this.bannerAd_jiesuanjiemian != undefined) {
                this.bannerAd_jiesuanjiemian.hide();
            }
            return true;
        }

        if (this.bannerAd_jiesuanjiemian != undefined) {
            if (ConfigData.wudian_level[3]!=0 && ConfigData.ctrlInfo.isWudian==1) {
                Laya.timer.clear(this,this.show_jiesuanjiemian);
                Laya.timer.once(ConfigData.ctrlInfo.lateDelay[3], this, this.show_jiesuanjiemian);
                console.log("show_jiesuanjiemian ConfigData.ctrlInfo.lateDelay[3] = ",ConfigData.ctrlInfo.lateDelay[3]);
            } else {
                Laya.timer.clear(this,this.show_jiesuanjiemian);
                Laya.timer.once(700, this, this.show_jiesuanjiemian);
            }
        }

        return true;
    }
    public show_jiesuanjiemian(){
        console.log("show_jiesuanjiemian");
        if(this.bannerAd_jiesuanjiemian){
            this.bannerAd_jiesuanjiemian.show();
        }
        
    };
    public hideBannerAd_jiesuanjiemian(posId:number=NaN){
        if (this.bannerAd_jiesuanjiemian) {
            this.bannerAd_jiesuanjiemian.hide();
        }
    }
    public destroyBannerAd_jiesuanjiemian(){
        if(this.bannerAd_jiesuanjiemian){
            this.bannerAd_jiesuanjiemian.destroy();
            this.bannerAd_jiesuanjiemian = null;
        }
    }


    public hideBannerAd(){
        Laya.timer.clear(this,this.show_zhujiemianlingqujinbi);
        Laya.timer.clear(this,this.show_shiyongpifu);
        Laya.timer.clear(this,this.show_fuhuo);
        Laya.timer.clear(this,this.show_jiesuanjinbi);
        Laya.timer.clear(this,this.show_jiesuanjiemian);
        this.hideBannerAd_fuhuo();
        this.hideBannerAd_jiesuanjiemian();
        this.hideBannerAd_jiesuanjinbi();
        this.hideBannerAd_shiyongpifu();
        this.hideBannerAd_zhujiemian();
        this.hideBannerAd_zhujiemianlingqujinbi();
    }



//----激励视频
    // 201双倍开局，202主界面多倍金币，203试用皮肤，204复活，205结算金币，206商城；
    
    public rewardedVideoAd_shuangbeikaiju;
    public caller_shuangbeikaiju:any;
    public callBackSuc_shuangbeikaiju:Function;
    public callBackFail_shuangbeikaiju:Function;
    public callBackErro_shuangbeikaiju:Function;
    public hasAd_shuangbeikaiju:boolean;
    //201双倍开局
    public initRewardedVideoAd_shuangbeikaiju(ad_id) {
        if (!Laya.Browser.onMiniGame||!this.isInited) {
            return;
        }

        this.rewardedVideoAd_shuangbeikaiju = window["wx"].createRewardedVideoAd({ adUnitId: ad_id });
        if (this.rewardedVideoAd_shuangbeikaiju == undefined) {
            return;
        }
        this.rewardedVideoAd_shuangbeikaiju.onLoad(() => {
            WxAdManager.Instance.hasAd_shuangbeikaiju = true;
        });
        this.rewardedVideoAd_shuangbeikaiju.onError(err => {
            WxAdManager.Instance.hasAd_shuangbeikaiju = false;

            if (WxAdManager.Instance.callBackErro_shuangbeikaiju != null) {
                WxAdManager.Instance.callBackErro_shuangbeikaiju(WxAdManager.Instance.caller_shuangbeikaiju);
            }
        });
        this.rewardedVideoAd_shuangbeikaiju.onClose(res => {
            // 用户点击了【关闭广告】按钮
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if (res && res.isEnded || res === undefined) {
                // 正常播放结束，可以下发游戏奖励
                WxAdManager.Instance.videoPlayedTimes += 1;
                if (WxAdManager.Instance.callBackSuc_shuangbeikaiju != null) {
                    WxAdManager.Instance.callBackSuc_shuangbeikaiju(WxAdManager.Instance.caller_shuangbeikaiju);
                }
            }
            else {
                // 播放中途退出，不下发游戏奖励
                if (WxAdManager.Instance.callBackFail_shuangbeikaiju != null) {
                    WxAdManager.Instance.callBackFail_shuangbeikaiju(WxAdManager.Instance.caller_shuangbeikaiju);
                }
            }
        });
    }
    public showVideo_shuangbeikaiju(posId:number, caller: any, callBackSuc: Function, callBackFail: Function, callBackErro?: Function) {
        if (!this.isInited) {
            return;
        }
        this.caller_shuangbeikaiju = caller;
        this.callBackSuc_shuangbeikaiju = callBackSuc;
        this.callBackFail_shuangbeikaiju = callBackFail;
        this.callBackErro_shuangbeikaiju = callBackErro;
        if (this.hasAd_shuangbeikaiju) {
            this.hasAd_shuangbeikaiju = false;
            this.rewardedVideoAd_shuangbeikaiju.show();
        }
        else {
            this.rewardedVideoAd_shuangbeikaiju.load()
                .then(() => {
                    WxAdManager.Instance.rewardedVideoAd_shuangbeikaiju.show();
                    WxAdManager.Instance.hasAd_shuangbeikaiju = false;
                })
        }
    }

    public rewardedVideoAd_zhujiemianduobeijinbi;
    public caller_zhujiemianduobeijinbi:any;
    public callBackSuc_zhujiemianduobeijinbi:Function;
    public callBackFail_zhujiemianduobeijinbi:Function;
    public callBackErro_zhujiemianduobeijinbi:Function;
    public hasAd_zhujiemianduobeijinbi:boolean;
    //202主界面多倍金币
    public initRewardedVideoAd_zhujiemianduobeijinbi(ad_id) {
        if (!Laya.Browser.onMiniGame||!this.isInited) {
            return;
        }

        this.rewardedVideoAd_zhujiemianduobeijinbi = window["wx"].createRewardedVideoAd({ adUnitId: ad_id });
        if (this.rewardedVideoAd_zhujiemianduobeijinbi == undefined) {
            return;
        }
        this.rewardedVideoAd_zhujiemianduobeijinbi.onLoad(() => {
            WxAdManager.Instance.hasAd_zhujiemianduobeijinbi = true;
        });
        this.rewardedVideoAd_zhujiemianduobeijinbi.onError(err => {
            WxAdManager.Instance.hasAd_zhujiemianduobeijinbi = false;

            if (WxAdManager.Instance.callBackErro_zhujiemianduobeijinbi != null) {
                WxAdManager.Instance.callBackErro_zhujiemianduobeijinbi(WxAdManager.Instance.caller_zhujiemianduobeijinbi);
            } else {
                if (WxAdManager.Instance.callBackSuc_zhujiemianduobeijinbi != null) {
                    WxAdManager.Instance.callBackSuc_zhujiemianduobeijinbi(WxAdManager.Instance.caller_zhujiemianduobeijinbi);
                }
            }
        });
        this.rewardedVideoAd_zhujiemianduobeijinbi.onClose(res => {
            // 用户点击了【关闭广告】按钮
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if (res && res.isEnded || res === undefined) {
                // 正常播放结束，可以下发游戏奖励
                WxAdManager.Instance.videoPlayedTimes += 1;
                if (WxAdManager.Instance.callBackSuc_zhujiemianduobeijinbi != null) {
                    WxAdManager.Instance.callBackSuc_zhujiemianduobeijinbi(WxAdManager.Instance.caller_zhujiemianduobeijinbi);
                }
            }
            else {
                // 播放中途退出，不下发游戏奖励
                if (WxAdManager.Instance.callBackFail_zhujiemianduobeijinbi != null) {
                    WxAdManager.Instance.callBackFail_zhujiemianduobeijinbi(WxAdManager.Instance.caller_zhujiemianduobeijinbi);
                }
            }
        });
    }
    public showVideo_zhujiemianduobeijinbi(posId:number, caller: any, callBackSuc: Function, callBackFail: Function, callBackErro?: Function) {
        if (!this.isInited) {
            return;
        }
        this.caller_zhujiemianduobeijinbi = caller;
        this.callBackSuc_zhujiemianduobeijinbi = callBackSuc;
        this.callBackFail_zhujiemianduobeijinbi = callBackFail;
        this.callBackErro_zhujiemianduobeijinbi = callBackErro;
        if (this.hasAd_zhujiemianduobeijinbi) {
            this.hasAd_zhujiemianduobeijinbi = false;
            this.rewardedVideoAd_zhujiemianduobeijinbi.show();
        }
        else {
            this.rewardedVideoAd_zhujiemianduobeijinbi.load()
                .then(() => {
                    WxAdManager.Instance.rewardedVideoAd_zhujiemianduobeijinbi.show();
                    WxAdManager.Instance.hasAd_zhujiemianduobeijinbi = false;
                })
        }
    }

    public rewardedVideoAd_shiyongpifu;
    public caller_shiyongpifu:any;
    public callBackSuc_shiyongpifu:Function;
    public callBackFail_shiyongpifu:Function;
    public callBackErro_shiyongpifu:Function;
    public hasAd_shiyongpifu:boolean;
    //203试用皮肤
    public initRewardedVideoAd_shiyongpifu(ad_id) {
        if (!Laya.Browser.onMiniGame||!this.isInited) {
            return;
        }

        this.rewardedVideoAd_shiyongpifu = window["wx"].createRewardedVideoAd({ adUnitId: ad_id });
        if (this.rewardedVideoAd_shiyongpifu == undefined) {
            return;
        }
        this.rewardedVideoAd_shiyongpifu.onLoad(() => {
            WxAdManager.Instance.hasAd_shiyongpifu = true;
        });
        this.rewardedVideoAd_shiyongpifu.onError(err => {
            WxAdManager.Instance.hasAd_shiyongpifu = false;

            if (WxAdManager.Instance.callBackErro_shiyongpifu != null) {
                WxAdManager.Instance.callBackErro_shiyongpifu(WxAdManager.Instance.caller_shiyongpifu);
            } else {
                if (WxAdManager.Instance.callBackSuc_shiyongpifu != null) {
                    WxAdManager.Instance.callBackSuc_shiyongpifu(WxAdManager.Instance.caller_shiyongpifu);
                }
            }
        });
        this.rewardedVideoAd_shiyongpifu.onClose(res => {
            // 用户点击了【关闭广告】按钮
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if (res && res.isEnded || res === undefined) {
                // 正常播放结束，可以下发游戏奖励
                WxAdManager.Instance.videoPlayedTimes += 1;
                if (WxAdManager.Instance.callBackSuc_shiyongpifu != null) {
                    WxAdManager.Instance.callBackSuc_shiyongpifu(WxAdManager.Instance.caller_shiyongpifu);
                }
            }
            else {
                // 播放中途退出，不下发游戏奖励
                if (WxAdManager.Instance.callBackFail_shiyongpifu != null) {
                    WxAdManager.Instance.callBackFail_shiyongpifu(WxAdManager.Instance.caller_shiyongpifu);
                }
            }
        });
    }
    public showVideo_shiyongpifu(posId:number, caller: any, callBackSuc: Function, callBackFail: Function, callBackErro?: Function) {
        if (!this.isInited) {
            return;
        }
        this.caller_shiyongpifu = caller;
        this.callBackSuc_shiyongpifu = callBackSuc;
        this.callBackFail_shiyongpifu = callBackFail;
        this.callBackErro_shiyongpifu = callBackErro;
        if (this.hasAd_shiyongpifu) {
            this.hasAd_shiyongpifu = false;
            this.rewardedVideoAd_shiyongpifu.show();
        }
        else {
            this.rewardedVideoAd_shiyongpifu.load()
                .then(() => {
                    WxAdManager.Instance.rewardedVideoAd_shiyongpifu.show();
                    WxAdManager.Instance.hasAd_shiyongpifu = false;
                })
        }
    }

    public rewardedVideoAd_fuhuo;
    public caller_fuhuo:any;
    public callBackSuc_fuhuo:Function;
    public callBackFail_fuhuo:Function;
    public callBackErro_fuhuo:Function;
    public hasAd_fuhuo:boolean;
    //204复活
    public initRewardedVideoAd_fuhuo(ad_id) {
        if (!Laya.Browser.onMiniGame||!this.isInited) {
            return;
        }

        this.rewardedVideoAd_fuhuo = window["wx"].createRewardedVideoAd({ adUnitId: ad_id });
        if (this.rewardedVideoAd_fuhuo == undefined) {
            return;
        }
        this.rewardedVideoAd_fuhuo.onLoad(() => {
            WxAdManager.Instance.hasAd_fuhuo = true;
        });
        this.rewardedVideoAd_fuhuo.onError(err => {
            WxAdManager.Instance.hasAd_fuhuo = false;

            if (WxAdManager.Instance.callBackErro_fuhuo != null) {
                WxAdManager.Instance.callBackErro_fuhuo(WxAdManager.Instance.caller_fuhuo);
            }
        });
        this.rewardedVideoAd_fuhuo.onClose(res => {
            // 用户点击了【关闭广告】按钮
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if (res && res.isEnded || res === undefined) {
                // 正常播放结束，可以下发游戏奖励
                WxAdManager.Instance.videoPlayedTimes += 1;
                if (WxAdManager.Instance.callBackSuc_fuhuo != null) {
                    WxAdManager.Instance.callBackSuc_fuhuo(WxAdManager.Instance.caller_fuhuo);
                }
            }
            else {
                // 播放中途退出，不下发游戏奖励
                if (WxAdManager.Instance.callBackFail_fuhuo != null) {
                    WxAdManager.Instance.callBackFail_fuhuo(WxAdManager.Instance.caller_fuhuo);
                }
            }
        });
    }
    public showVideo_fuhuo(posId:number, caller: any, callBackSuc: Function, callBackFail: Function, callBackErro?: Function) {
        if (!this.isInited) {
            return;
        }
        this.caller_fuhuo = caller;
        this.callBackSuc_fuhuo = callBackSuc;
        this.callBackFail_fuhuo = callBackFail;
        this.callBackErro_fuhuo = callBackErro;
        if (this.hasAd_fuhuo) {
            this.hasAd_fuhuo = false;
            this.rewardedVideoAd_fuhuo.show();
        }
        else {
            this.rewardedVideoAd_fuhuo.load()
                .then(() => {
                    WxAdManager.Instance.rewardedVideoAd_fuhuo.show();
                    WxAdManager.Instance.hasAd_fuhuo = false;
                })
        }
    }

    public rewardedVideoAd_jiesuanjinbi;
    public caller_jiesuanjinbi:any;
    public callBackSuc_jiesuanjinbi:Function;
    public callBackFail_jiesuanjinbi:Function;
    public callBackErro_jiesuanjinbi:Function;
    public hasAd_jiesuanjinbi:boolean;
    //205结算金币
    public initRewardedVideoAd_jiesuanjinbi(ad_id) {
        if (!Laya.Browser.onMiniGame||!this.isInited) {
            return;
        }

        this.rewardedVideoAd_jiesuanjinbi = window["wx"].createRewardedVideoAd({ adUnitId: ad_id });
        if (this.rewardedVideoAd_jiesuanjinbi == undefined) {
            return;
        }
        this.rewardedVideoAd_jiesuanjinbi.onLoad(() => {
            WxAdManager.Instance.hasAd_jiesuanjinbi = true;
        });
        this.rewardedVideoAd_jiesuanjinbi.onError(err => {
            WxAdManager.Instance.hasAd_jiesuanjinbi = false;

            if (WxAdManager.Instance.callBackErro_jiesuanjinbi != null) {
                WxAdManager.Instance.callBackErro_jiesuanjinbi(WxAdManager.Instance.caller_jiesuanjinbi);
            } else {
                if (WxAdManager.Instance.callBackSuc_jiesuanjinbi != null) {
                    WxAdManager.Instance.callBackSuc_jiesuanjinbi(WxAdManager.Instance.caller_jiesuanjinbi);
                }
            }
        });
        this.rewardedVideoAd_jiesuanjinbi.onClose(res => {
            // 用户点击了【关闭广告】按钮
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if (res && res.isEnded || res === undefined) {
                // 正常播放结束，可以下发游戏奖励
                WxAdManager.Instance.videoPlayedTimes += 1;
                if (WxAdManager.Instance.callBackSuc_jiesuanjinbi != null) {
                    WxAdManager.Instance.callBackSuc_jiesuanjinbi(WxAdManager.Instance.caller_jiesuanjinbi);
                }
            }
            else {
                // 播放中途退出，不下发游戏奖励
                if (WxAdManager.Instance.callBackFail_jiesuanjinbi != null) {
                    WxAdManager.Instance.callBackFail_jiesuanjinbi(WxAdManager.Instance.caller_jiesuanjinbi);
                }
            }
        });
    }
    public showVideo_jiesuanjinbi(posId:number, caller: any, callBackSuc: Function, callBackFail: Function, callBackErro?: Function) {
        if (!this.isInited) {
            return;
        }
        this.caller_jiesuanjinbi = caller;
        this.callBackSuc_jiesuanjinbi = callBackSuc;
        this.callBackFail_jiesuanjinbi = callBackFail;
        this.callBackErro_jiesuanjinbi = callBackErro;
        if (this.hasAd_jiesuanjinbi) {
            this.hasAd_jiesuanjinbi = false;
            this.rewardedVideoAd_jiesuanjinbi.show();
        }
        else {
            this.rewardedVideoAd_jiesuanjinbi.load()
                .then(() => {
                    WxAdManager.Instance.rewardedVideoAd_jiesuanjinbi.show();
                    WxAdManager.Instance.hasAd_jiesuanjinbi = false;
                })
        }
    }

    public rewardedVideoAd_shangcheng;
    public caller_shangcheng:any;
    public callBackSuc_shangcheng:Function;
    public callBackFail_shangcheng:Function;
    public callBackErro_shangcheng:Function;
    public hasAd_shangcheng:boolean;
    //206商城
    public initRewardedVideoAd_shangcheng(ad_id) {
        if (!Laya.Browser.onMiniGame||!this.isInited) {
            return;
        }

        this.rewardedVideoAd_shangcheng = window["wx"].createRewardedVideoAd({ adUnitId: ad_id });
        if (this.rewardedVideoAd_shangcheng == undefined) {
            return;
        }
        this.rewardedVideoAd_shangcheng.onLoad(() => {
            WxAdManager.Instance.hasAd_shangcheng = true;
        });
        this.rewardedVideoAd_shangcheng.onError(err => {
            WxAdManager.Instance.hasAd_shangcheng = false;

            if (WxAdManager.Instance.callBackErro_shangcheng != null) {
                WxAdManager.Instance.callBackErro_shangcheng(WxAdManager.Instance.caller_shangcheng);
            } else {
                if (WxAdManager.Instance.callBackSuc_shangcheng != null) {
                    WxAdManager.Instance.callBackSuc_shangcheng(WxAdManager.Instance.caller_shangcheng);
                }
            }
        });
        this.rewardedVideoAd_shangcheng.onClose(res => {
            // 用户点击了【关闭广告】按钮
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if (res && res.isEnded || res === undefined) {
                // 正常播放结束，可以下发游戏奖励
                WxAdManager.Instance.videoPlayedTimes += 1;
                if (WxAdManager.Instance.callBackSuc_shangcheng != null) {
                    WxAdManager.Instance.callBackSuc_shangcheng(WxAdManager.Instance.caller_shangcheng);
                }
            }
            else {
                // 播放中途退出，不下发游戏奖励
                if (WxAdManager.Instance.callBackFail_shangcheng != null) {
                    WxAdManager.Instance.callBackFail_shangcheng(WxAdManager.Instance.caller_shangcheng);
                }
            }
        });
    }
    public showVideo_shangcheng(posId:number, caller: any, callBackSuc: Function, callBackFail: Function, callBackErro?: Function) {
        if (!this.isInited) {
            return;
        }
        this.caller_shangcheng = caller;
        this.callBackSuc_shangcheng = callBackSuc;
        this.callBackFail_shangcheng = callBackFail;
        this.callBackErro_shangcheng = callBackErro;
        if (this.hasAd_shangcheng) {
            this.hasAd_shangcheng = false;
            this.rewardedVideoAd_shangcheng.show();
        }
        else {
            this.rewardedVideoAd_shangcheng.load()
                .then(() => {
                    WxAdManager.Instance.rewardedVideoAd_shangcheng.show();
                    WxAdManager.Instance.hasAd_shangcheng = false;
                })
        }
    }

}