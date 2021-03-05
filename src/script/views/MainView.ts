import BaseView from "./BaseView";
import ConfigData, { SORTTYPE } from "../models/ConfigData";
import MyUtils from "../tools/MyUtils";
import PlatformMgr from "../mgrCommon/PlatformMgr";
import EventMgr from "../mgrCommon/EventMgr";
import SoundMgr from "../mgrCommon/SoundMgr";
import UserData from "../models/UserData";
import SceneMgr from "../mgr3d/SceneMgr";
import HttpMgr from "../mgrCommon/HttpMgr";
import { cionAni } from "./cionAni";
import { SHARE_VIDEO_TYPE } from "../mgrCommon/StatisticsMgr";
import { RewardViewType } from "./RewardView";
import MyLog from "../tools/MyLog";
import WXAPI from "../platform/wx/WXAPI";
import { EventDefine } from "../mgrCommon/EventDefine";
import GameMgr, { GameStatus } from "../mgr3d/GameMgr";
import WuDian from "../center/view/WuDian";

export default class MainView extends BaseView {
    private btnSound:Laya.Image;
    private btnVirbort:Laya.Image;
    private btnService:Laya.Image;

    private img_gold:Laya.Image;
    private img_goldhint:Laya.Image;
    private goldLab:Laya.Label;
    private goldImgPro:Laya.Image;
    private goldImgMask:Laya.Sprite;

    private title:Laya.Image;

    private btnInvite:Laya.Image;
    private img_hint:Laya.Image;
    private inviteIconImg:Laya.Image;
    private yqwLab:Laya.Label;
    private inviteGoldLab:Laya.Label;

    private btnRank:Laya.Image;

    private btnStart:Laya.Image;

    private btnShop:Laya.Image;

    private goldBgImg:Laya.Image;
    private coinNum:Laya.FontClip;
    private coinNumUnit:Laya.FontClip;
    private goleIconImg:Laya.Image;

    private leftTT:Laya.Image;
    private centerImg:Laya.Image;
    private img_adMove:Laya.Image;
    private settingPop:Laya.Image;
    private settingBtn:Laya.Image;

    private img_start:Laya.Image;

    private imgHintY = 0;

    constructor() { 
        super(); 
    }
    
    onAwake(): void {
        super.onAwake();

        
        this.goldBgImg = this.owner.getChildByName("goldBgImg") as Laya.Image;

        this.leftTT =  this.goldBgImg.getChildByName("leftTT") as Laya.Image;
        this.centerImg = this.owner.getChildByName("centerImg") as Laya.Image;

        let leftTop = this.leftTT.getChildByName("lefttop") as Laya.Image;
        this.settingPop = leftTop.getChildByName("settingS").getChildByName("settingPop") as Laya.Image;
        this.img_adMove = this.owner.getChildByName("centerImg").getChildByName("img_adMove") as Laya.Image;

        this.coinNumUnit = this.goldBgImg.getChildByName("myMoneyUnitClip") as Laya.FontClip;
        this.coinNum = this.goldBgImg.getChildByName("myMoneyClip") as Laya.FontClip;
        this.goleIconImg = this.goldBgImg.getChildByName("goleIconImg") as Laya.Image;
        MyUtils.autoScreenSize([this.goldBgImg]);
        //this.leftTT.y += 8;

        this.btnSound = this.settingPop.getChildByName("musicBtn") as Laya.Image;
        this.btnVirbort = this.settingPop.getChildByName("vibrateBtn") as Laya.Image;
        this.btnService = this.settingPop.getChildByName("serviceBtn") as Laya.Image;
        this.settingBtn =  leftTop.getChildByName("settingBtn") as Laya.Image;
        this.InitSetting();

        (leftTop.getChildByName("settingS")  as Laya.Image).pos(this.settingBtn.x, this.settingBtn.y);

        this.switchOptionUI();

         this.img_start =  this.img_adMove.getChildByName("img_start") as Laya.Image;
        //邀请
        this.btnInvite =  this.img_adMove.getChildByName("img_invite") as Laya.Image;
        this.img_hint = this.btnInvite.getChildByName("img_hint") as Laya.Image;
        this.inviteIconImg = this.img_hint.getChildByName("inviteIconImg") as Laya.Image;
        this.yqwLab = this.img_hint.getChildByName("yqwLab") as Laya.Label;
        this.inviteGoldLab = this.img_hint.getChildByName("inviteGoldLab") as Laya.Label;
        this.imgHintY = this.img_hint.y;

        // 分享开关操作
        let shareBool = (ConfigData.ctrlInfo.inviteFriendsControl==1 && ConfigData.ctrlInfo.inviteShareMaxCount>UserData.inviteShareCount);
        this.yqwLab.visible = !shareBool;
        this.inviteIconImg.visible = shareBool;
        this.inviteGoldLab.visible = shareBool;
        this.inviteGoldLab.text =  ConfigData.ctrlInfo.inviteFriendsGolds?ConfigData.ctrlInfo.inviteFriendsGolds.toString():"0";
        this.imgHintY = this.img_hint.y;

        //排行
        this.btnRank =  this.img_adMove.getChildByName("img_rank") as Laya.Image;
        //商店
        this.btnShop =  this.img_adMove.getChildByName("img_shop") as Laya.Image;
        //在线金币
        this.img_gold =  this.img_adMove.getChildByName("img_gold") as Laya.Image;
        this.img_goldhint = this.img_gold.getChildByName("img_goldhint") as Laya.Image ;
        this.goldLab = this.img_goldhint.getChildByName("goldLab") as Laya.Label;
        this.goldImgPro = this.img_gold.getChildByName("goldImgPro") as Laya.Image;
        this.goldImgMask = this.goldImgPro.mask as Laya.Image;
        this.img_goldhint.y = this.imgHintY;

        let banner = this.owner.getChildByName("img_banner") as Laya.Image;

         this.title = this.centerImg.getChildByName("img_logo") as Laya.Image;

        this.btnStart = this.owner.getChildByName("img_play") as Laya.Image;

        // let self = this;
        // Laya.timer.frameOnce(20, this, function () {
        //     new Promise((resolve,reject) => {
        //         PlatformMgr.callAPIMethodByProxy("createAuthorizationButton",{
        //             x: self.btnStart.x,
        //             y: self.btnStart.y - this.offset.y,
        //             width: self.btnStart.width,
        //             isFull:true,
        //             height: self.btnStart.height,
        //             successBack: self[self.btnStart.name+"Func"],
        //             failBack:  self[self.btnStart.name+"Func"]
        //         });
        //         resolve(resolve);
        //     }).then(()=>{
        //         let arr = [self.btnRank,self.img_gold,self.btnInvite];
        //         for (let index = 0; index < arr.length; index++) {
        //             const btn = arr[index];
        //             PlatformMgr.callAPIMethodByProxy("createAuthorizationButton",{
        //                 x: btn.x,
        //                 y: btn.y - this.offset.y,
        //                 width: btn.width,
        //                 height: btn.height,
        //                 successBack: self[btn.name+"Func"],
        //                 failBack: self[btn.name+"Func"]
        //             });
        //         }
        //     })
        // });
    }

    onEnable(): void {
        this.addEvent();
        this.img_hint.y = this.imgHintY;
        Laya.Tween.clearTween(this.img_hint);
        this.tweenAniDown(this.img_hint, {y:this.img_hint.y+10}, {y:this.img_hint.y}, 500);

        this.img_goldhint.y = this.imgHintY;
        Laya.Tween.clearTween(this.img_goldhint);
        this.tweenAniDown(this.img_goldhint, {y:this.img_goldhint.y+10}, {y:this.img_goldhint.y}, 500);

        Laya.Tween.clearTween(this.img_start);
        this.tweenAniDown(this.img_start, {scaleX:1.05, scaleY:1.05}, {scaleX:0.95, scaleY:0.95}, 400);

        this.refreshCoin();
        this.offlineGoldInit();
    }


    private refreshCoin(){
        // let result = MyUtils.scoreConversion(UserData.gold);
        // this.coinNum.value = result.value;
        // this.coinNumUnit.visible = (result.isK!=null);
        // let imgname = ["T", "B", "M", "K"];
        // let vl = result.value.length*21;
        // if(result.isK){
        //     this.coinNumUnit.value = imgname[result.isK];
        //     let tl = vl;
        //     vl += 2 + 35;
        //    this.coinNumUnit.x = 118-vl/2+tl+2;
        // }
        // this.coinNum.x = 118-vl/2;

        this.coinNum.value = UserData.getMoney() + "";
    }

    switchOptionUI() {
        if (ConfigData.isSound) {
            this.btnSound.skin = "mainview/zhuye_btn_shengyin_open.png";
        }
        else {
            this.btnSound.skin = "mainview/zhuye_btn_shengyin_close.png";
        }
        if  (ConfigData.isVirbort) {
            this.btnVirbort.skin = "mainview/zhuye_btn_zhendong_open.png";
        }
        else {
            this.btnVirbort.skin = "mainview/zhuye_btn_zhendong_close.png";
        }
    }

    public openView(data?: any): void {  
            
        super.openView(data);
    
        // this.ShowBanner();

        if(Global.Data.noShowUI)
        {

        }
        else{
            Laya.timer.once(1000,this,()=>{
                Laya.Scene.open("AllFlows.scene",false,()=>{
                    Laya.Scene.open("AllFlows1.scene",false);
                });
            })
        }

        //PlatformMgr.callAPIMethodByProxy("showInterstitialAD");
    }

    public addEvent() {
        super.addEvent();
        this.btnSound.on(Laya.Event.CLICK, this, this.soundBtnClick);
        this.btnVirbort.on(Laya.Event.CLICK, this, this.virbortBtnClick);
        
        this.btnRank.on(Laya.Event.CLICK, this, this.btnRankFunc);
        this.btnService.on(Laya.Event.CLICK, this, this.btnServiceFunc);
        this.btnInvite.on(Laya.Event.CLICK, this, this.btnInviteFunc);
        this.img_gold.on(Laya.Event.CLICK, this, this.img_goldFunc);

        this.img_start.on(Laya.Event.CLICK, this, this.onClickDoubleStartGame);

        Laya.timer.once(1000,this,()=>{this.btnStart.on(Laya.Event.CLICK, this, this.btnStartFunc);});
        
        this.btnShop.on(Laya.Event.CLICK, this, this.btnGotoShopFunc);

        this.settingBtn.on(Laya.Event.CLICK,this,this.onClickSetting);//设置设置
    }
    
    private virbortBtnClick() {
        ConfigData.isVirbort = !ConfigData.isVirbort;
        if  (ConfigData.isVirbort) {
            this.btnVirbort.skin = "mainview/zhuye_btn_zhendong_open.png";
        }
        else {
            this.btnVirbort.skin = "mainview/zhuye_btn_zhendong_close.png";
        }
        ConfigData.setVirbort(ConfigData.isVirbort ? "" : "1");
    }

    private soundBtnClick() {
        ConfigData.isSound = !ConfigData.isSound;
        if (ConfigData.isSound) {
            this.btnSound.skin = "mainview/zhuye_btn_shengyin_open.png";
        }
        else {
            this.btnSound.skin = "mainview/zhuye_btn_shengyin_close.png";
        }
        if(ConfigData.isSound){
            ConfigData.setSound("");
            //console.log("soundBtnClick playBGM");
            //SoundMgr.instance.playBGM()
        }else{
            ConfigData.setSound("1");
            //console.log("soundBtnClick stopBGM");
            //SoundMgr.instance.stopBGM();
        }
    }

    private btnInviteFunc() {
        if (this._isClick) {
            return;
        }
        this._isClick = true;
        Laya.timer.once(500, this, () => {
            this._isClick = null;
        });

        let _d = {
            caller:this,
            callback:(res)=>{
                if(res.success){
                   // EventMgr.instance.emit("openTip","分享成功");
                    if(this.inviteGoldLab.visible){
                        HttpMgr.instance.shareCallback(this, ()=>{
                            if(UserData.inviteShareCount>=ConfigData.ctrlInfo.inviteShareMaxCount){
                                this.yqwLab.visible = true;
                                this.inviteIconImg.visible = false;
                                this.inviteGoldLab.visible = false;
                            }
                        });
                        EventMgr.instance.emit("openTip","获得"+this.inviteGoldLab.text+"金币");
                        this.OVERhuoquAIn();
                    }
                }else{
                    EventMgr.instance.emit("openTip","分享失败");
                }
            },
            type:1
        };
        PlatformMgr.callAPIMethodByProxy("shareAppMessage",_d);
    }

    private btnServiceFunc() {
        if (this._isClick) {
            return;
        }
        this._isClick = true;
        Laya.timer.once(500, this, () => {
            this._isClick = null;
        });
        PlatformMgr.callAPIMethodByProxy("openCustomerServiceConversation");
    }


    private btnGotoShopFunc() {
        if (this._isClick) {
            return;
        }
        this._isClick = true;
        Laya.timer.once(500, this, () => {
            this._isClick = null;
        });
        EventMgr.instance.emit("openSkinShop");
        SoundMgr.instance.playSound("button");
    }

    private btnRankFunc() {
        if (this._isClick) {
            return;
        }
        this._isClick = true;
        Laya.timer.once(500, this, () => {
            this._isClick = null;
        });
        EventMgr.instance.emit("openRank",{_type:SORTTYPE.LEVEL}); 
    }

    private btnStartFunc() {
        if (this._isClick) {
            return;
        }
        if(UserData.curMultiple<=1){
            WXAPI.ald("开始游戏--视频");
        }
        PlatformMgr.callAPIMethodByProxy("destoryAuthorization");
        PlatformMgr.callAPIMethodByProxy("destoryAllBannerAd");
        this._isClick = true;
        Laya.timer.once(500, this, () => {
            this._isClick = null;
        });
        //直接打开游戏界面
        // EventMgr.instance.emit("openFighting");
        //cscs
        // this.openWuDianScene();
        // EventMgr.instance.emit("openSkinTrial");
        if(WuDian.canShow())
        {
            this.openWuDianScene();
        }
        else{
            EventMgr.instance.emit("openFighting");
        }
    }
    openWuDianScene()
    {
        this.closeView();
        Laya.Scene.open("WuDian.scene",null,()=>{
            GameMgr.Instance.gameStatus = GameStatus.Pause;
            EventMgr.instance.emit("openFighting");
            SceneMgr.Instance.mapComp.init(false);
        });
        SceneMgr.Instance.mapComp.init(true);
        GameMgr.Instance.gameStatus = GameStatus.Execute;
    }

    public removeEvent() {
        this.btnSound.off(Laya.Event.CLICK, this, this.soundBtnClick);
        this.btnVirbort.off(Laya.Event.CLICK, this, this.virbortBtnClick);
        
        this.btnRank.off(Laya.Event.CLICK, this, this.btnRankFunc);
        this.btnService.off(Laya.Event.CLICK, this, this.btnServiceFunc);
        this.btnInvite.off(Laya.Event.CLICK, this, this.btnInviteFunc);
        this.btnStart.off(Laya.Event.CLICK, this, this.btnStartFunc);
        this.img_gold.off(Laya.Event.CLICK, this, this.img_goldFunc);

        this.settingBtn.off(Laya.Event.CLICK,this,this.onClickSetting);//设置设置

        this.img_start.off(Laya.Event.CLICK, this, this.onClickDoubleStartGame);
        super.removeEvent();
    }


    private DIX = 0;
    private DIXMAX = 6; //个数
    // 金币奖励动画
	public OVERhuoquAIn() {
        this.DIX = 0;
        Laya.timer.clear(this, this.goldFlyAniLoop);
        Laya.timer.loop(50, this, this.goldFlyAniLoop);
    }
    private goldFlyAniLoop(){
        if (this.DIX <= this.DIXMAX) {
            this.DIX = this.DIX + 1;
            if (this.DIX > this.DIXMAX) {
                this.qudonghua(true);
                Laya.timer.once(1000, this, ()=>{
                    this.refreshCoin();
                })
            }
            else {
                this.qudonghua(false);
            }
        }
        else {
            Laya.timer.clear(this, this.goldFlyAniLoop);
          
        }
    }

    public qudonghua(bOOL: boolean) {
        var CONINAIN: cionAni = Laya.Pool.getItem("CONINAIN");
        let originalPos = {x:this.centerImg.x+this.img_adMove.x+this.btnInvite.x, y:this.centerImg.y+this.img_adMove.y+this.btnInvite.y};
        let targetPos = {x:this.leftTT.x+this.goldBgImg.x+this.goleIconImg.x, y:this.leftTT.y+this.goldBgImg.y+this.goleIconImg.y};
        if (CONINAIN == null) {
            let theimg = undefined;
            theimg = new cionAni();
            this.owner.addChild(theimg);
            theimg.OVERhuoquAIn(bOOL, originalPos, targetPos);
        }
        else {
            let theimg = undefined;
            theimg = CONINAIN;
            this.owner.addChild(theimg);
            theimg.OVERhuoquAIn(bOOL, originalPos, targetPos);
        }
    }


    private tweenAniDown(obj, propsDown, propsUp, time){
        Laya.Tween.to(obj, propsDown, time, null, Laya.Handler.create(this, ()=>{
            this.tweenAniUp(obj, propsDown, propsUp, time);
        }));
    }
    private tweenAniUp(obj, propsDown, propsUp, time){
        Laya.Tween.to(obj, propsUp, time, null, Laya.Handler.create(this, ()=>{
            this.tweenAniDown(obj, propsDown, propsUp, time);
        }));
    }

    private InitSetting():void{
        Laya.Tween.clearTween(this.settingPop);
        this.settingPop.y = -160;
        this.popSetting = false;
    }

    private popSetting:boolean;
    private onClickSetting(){
        if(this.popSetting){
            Laya.Tween.to(this.settingPop, {y:-160}, 200*(this.settingPop.y+160)/230);
        }
        else{
            Laya.Tween.to(this.settingPop, {y:70}, 200*(70-this.settingPop.y)/230);
        }
        this.popSetting = !this.popSetting;
    }


    private maskTargetRot = -90;  
    private offlineGoldLoop(){
        let now = new Date().getTime();
        let timeTo = ConfigData.ctrlInfo.onlineTimes*60 - ConfigData.offlineTimeSpent - (now-ConfigData.ctrlInfo.startOfflineTime)/1000;
        let curMoney = 0; 
        if(timeTo>0){
            this.maskTargetRot = -90;
            Laya.Tween.to(this, {maskTargetRot:270}, ConfigData.ctrlInfo.onlineItemSecond*1000-100);
            curMoney = Math.floor((ConfigData.offlineTimeSpent+(now-ConfigData.ctrlInfo.startOfflineTime)/1000)/ConfigData.ctrlInfo.onlineItemSecond)*ConfigData.ctrlInfo.onlineItemGold;
        }else{
            curMoney = Math.floor(ConfigData.ctrlInfo.onlineTimes*60/ConfigData.ctrlInfo.onlineItemSecond)*ConfigData.ctrlInfo.onlineItemGold;
        }
        this.goldLab.text = curMoney>=0 ? curMoney.toString() : "0";
        //UserData.offlineAwardAddMoney = curMoney;
    }

    goldImgMaskUpdate(){ 
        this.goldImgMask.graphics.clear();
        this.goldImgMask.graphics.drawPie(40, 40, 40, -90, this.maskTargetRot, "#ff0000");
    }
    private offlineGoldInit(){        
        
        this.offlineGoldLoop();
        Laya.timer.clear(this, this.offlineGoldLoop);
        Laya.timer.loop(ConfigData.ctrlInfo.onlineItemSecond*1000, this, this.offlineGoldLoop);
        Laya.timer.clear(this, this.goldImgMaskUpdate);
        Laya.timer.frameLoop(2,this, this.goldImgMaskUpdate);
    }

    private onClickDoubleStartGame() {
        if (PlatformMgr.ptAPI) {
            WXAPI.ald("双倍开始--视频");
            PlatformMgr.callAPIMethodByProxy("showVideo",{
                posID:201,
                _type:SHARE_VIDEO_TYPE.START_GAME,
                caller:this, 
                callBackSuc:() => {
                    //双倍开局
                    UserData.curMultiple = 2;
                    this.btnStartFunc();
                    WXAPI.ald("双倍开始成功--视频");
                    EventMgr.instance.emit("openTip", "当前关卡收益X2");
                },
                callBackFail:() => {
                    EventMgr.instance.emit("openTip", "看完视频才能获得双倍加成");
                },
                callBackErro:() => {
                    EventMgr.instance.emit("openTip", "今日视频次数已用完");

                }
            });
        } else {
            //直接双倍开局
            UserData.curMultiple = 2;
            EventMgr.instance.emit("openSkinTrial");
            EventMgr.instance.emit("openTip", "当前关卡收益X2");
        }
    }

    private img_goldFunc(){
        let tg = parseInt(this.goldLab.text);

      if(tg>0){
        let data = {
            type:RewardViewType.Offline,
            gold:tg
        };
        PlatformMgr.callAPIMethodByProxy("destoryAllBannerAd");
        EventMgr.instance.emit("openRewardView",data);
            
       }
    }
}