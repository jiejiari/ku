import BaseView from "./BaseView";
import EventMgr from "../mgrCommon/EventMgr";
import PlatformMgr from "../mgrCommon/PlatformMgr";
import ConfigData, { SORTTYPE } from "../models/ConfigData";
import MyUtils from "../tools/MyUtils";
import SoundMgr from "../mgrCommon/SoundMgr";
import MathUtil from "../tools/MathUtil";
import UserData from "../models/UserData";
import HttpMgr from "../mgrCommon/HttpMgr";
import ViewMgr from "../mgrCommon/ViewMgr";
import WXAPI from "../platform/wx/WXAPI";
import { EventDefine } from "../mgrCommon/EventDefine";
import GameMgr from "../mgr3d/GameMgr";
import BannerNode from "../center/ad/BannerNode";

export default class GameOver extends BaseView {
    private btnNext:Laya.Image;
    private btnHome:Laya.Image;
    private btnAgain:Laya.Image;
    // private btnFight:Laya.Image;

    private imgFail:Laya.Image;
    private imgPass:Laya.Image;
    private btnAnchor:Laya.Image;

    private levePanel:Laya.Image;
    // private scorePanel:Laya.Image;

    //private score:Laya.FontClip;
    private passNum:Laya.FontClip;

    private adList:Laya.List;
    private adData:any[];
    private adDataRandom:any[];

    // private img_hint:Laya.Image;
    private inviteIconImg:Laya.Image;
    private yqwLab:Laya.Label;
    private inviteGoldLab:Laya.Label;

    private imgHintY = 0;

    // private _overListLoop: OverAdListLoop;

    constructor() { super(); }
    
    onAwake(): void {
        super.onAwake();

        let content = this.owner.getChildByName("content") as Laya.Image;
        this.btnAnchor = this.owner.getChildByName("btnAnchor") as Laya.Image;

        this.btnNext = this.btnAnchor.getChildByName("btnNext") as Laya.Image;
        this.btnHome = this.btnAnchor.getChildByName("btnHome") as Laya.Image;
        this.btnAgain = this.btnAnchor.getChildByName("btnAgain") as Laya.Image;
        // this.btnFight = btnAnchor.getChildByName("btnFight") as Laya.Image;


        let levePanel = content.getChildByName("levelPanel") as Laya.Image;
        this.passNum = levePanel.getChildByName("passNum") as Laya.FontClip;
        this.imgFail = levePanel.getChildByName("imgFail") as Laya.Image;
        this.imgPass = levePanel.getChildByName("imgPass") as Laya.Image;
        this.levePanel = levePanel;
        
        this.imgFail.visible = false;
        this.imgPass.visible = false;
        
        // let scorePanel = content.getChildByName("scorePanel") as Laya.Image;
        // this.scorePanel = scorePanel;
        //this.score = scorePanel.getChildByName("clipScore") as Laya.FontClip;

        // let adPlane = content.getChildByName("ADPlane") as Laya.Panel;
        // this._overListLoop = adPlane.getComponent(OverAdListLoop);
        // let adData = ConfigData.getAdData(4);
        // this._overListLoop.start(adData);

        // this.img_hint = this.btnFight.getChildByName("img_hint") as Laya.Image;
        // this.inviteIconImg = this.img_hint.getChildByName("inviteIconImg") as Laya.Image;
        // this.yqwLab = this.img_hint.getChildByName("yqwLab") as Laya.Label;
        // this.inviteGoldLab = this.img_hint.getChildByName("inviteGoldLab") as Laya.Label;
        // this.imgHintY = this.img_hint.y;

        // 分享开关操作
        // let shareBool = (ConfigData.ctrlInfo.inviteFriendsControl==1 && ConfigData.ctrlInfo.inviteShareMaxCount>UserData.inviteShareCount);
        // this.yqwLab.visible = !shareBool;
        // this.inviteIconImg.visible = shareBool;
        // this.inviteGoldLab.visible = shareBool;
        // this.inviteGoldLab.text = ConfigData.ctrlInfo.inviteFriendsGolds.toString();
        // this.imgHintY = this.img_hint.y;
    }
    
    goFighting(){
        //再次挑战
        this.nextLevelFunc();

        // EventMgr.instance.emit("openSkinTrial");
    }

    goHome(){
        if(this.btnAnchor.bottom != 324) return;
        GameMgr.Instance.GameExit();
        SoundMgr.instance.playSound("button");
        // if(ConfigData.ctrlInfo.backHomeControl == 1){  // 回首页：做后台开关控制，当开关为0点，点击回首页返回到游戏主界面。当开关为1时，点击回首页直接弹开游戏列表界面。
        //     ViewMgr.instance.openView({
        //         viewName: "ConvergeAd.scene",
        //         closeAll: false,
        //     });
        // }else{
        //     EventMgr.instance.emit("goHome");
        // }
        EventMgr.instance.emit("goHome");
    }

    goShare(){
        let _d = {
            caller:this,
            callback:(res)=>{
                if(!res.success){
                    EventMgr.instance.emit("openTip","分享失败");
                }else{
                    if(this.inviteGoldLab.visible){
                        HttpMgr.instance.shareCallback(this, ()=>{
                            if(UserData.inviteShareCount>= ConfigData.ctrlInfo.inviteShareMaxCount){
                                this.yqwLab.visible = true;
                                this.inviteIconImg.visible = false;
                                this.inviteGoldLab.visible = false;
                            }
                        });
                        EventMgr.instance.emit("openTip","获得"+this.inviteGoldLab.text+"金币");
                    }
                }
            },
            type:0
        };
        UserData.isShare = true;
        PlatformMgr.callAPIMethodByProxy("shareAppMessage",_d);
    }

    addEvent(){
        this.btnNext.on(Laya.Event.CLICK,this,this.nextLevelFunc);
        this.btnHome.on(Laya.Event.CLICK,this,this.goHome);
        this.btnAgain.on(Laya.Event.CLICK,this,this.goFighting);
        // this.btnFight.on(Laya.Event.CLICK,this,this.goShare);
        super.addEvent();
    }

    public removeEvent() {
        this.btnNext.off(Laya.Event.CLICK,this,this.nextLevelFunc);
        this.btnHome.off(Laya.Event.CLICK,this,this.goHome);
        this.btnAgain.off(Laya.Event.CLICK,this,this.goFighting);
        // this.btnFight.off(Laya.Event.CLICK,this,this.goShare);
        super.removeEvent();
    }

    nextLevelFunc(){
        if(this.btnAnchor.bottom != 324) return;
        //下一关
        GameMgr.Instance.GameRestart();
        // EventMgr.instance.emit("openFighting");
        //cscs
        SoundMgr.instance.playSound("button");
        // Laya.Scene.open("AllFlows1.scene",false,function(){
        //     EventMgr.instance.emit("openFighting");
        // });
        Laya.Scene.open("AllFlows.scene",false,()=>{
            Laya.Scene.open("AllFlows1.scene",false,function(){
                EventMgr.instance.emit("openFighting");
            });
        });
        // EventMgr.instance.emit("goHome");
        // EventMgr.instance.emit("openSkinTrial");
    }
    
    onEnable():void{
        super.onEnable();
        // this.img_hint.y = this.imgHintY;
        // Laya.Tween.clearTween(this.img_hint);
        // this.tweenAniDown(this.img_hint, {y:this.img_hint.y+10}, {y:this.img_hint.y}, 500);
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

    onDisable(): void {
        super.onDisable();
        PlatformMgr.callAPIMethodByProxy("destroyBannerAdClassicEnd");
    }

    openView(data:any){
        let isPass = data.isPass;
        super.openView(isPass);
        //需要获取广告
        // this.adList.array = this.adData;
        // this.adList.refresh();
        // this.scorePanel.visible = false;
        this.levePanel.visible = true;
        this.imgFail.visible = !isPass;
        this.imgPass.visible = isPass;
        this.btnNext.visible = isPass;
        this.btnAgain.visible = !isPass;
        // let passNum = isPass ? UserData.level-1 : UserData.level;
        let passNum = isPass ? UserData.getLeveNum()-1 : UserData.getLeveNum();
        this.passNum.value = passNum.toString();
        //适配 是数字和“关”字居中
        let length  = passNum.toString().length - 1;
        this.passNum.x = -52 + 26 * length;

        //cs
        // HttpMgr.instance.Settlement(isPass, data.gold);
        UserData.addMoney(data.gold);
        UserData.saveData();

        // this.ShowBanner();

        // if (ConfigData.ctrlInfo.isWudian&&(ConfigData.wudian_level[3]==1)) {
        //     this.btnAnchor.visible = false;
        //     Laya.timer.once(ConfigData.ctrlInfo.btuAppear[3]+300, this, ()=>{
        //         this.btnAnchor.visible = true;
        //     });	

        //     let btnJumpY = 560;
        //     let randomY = MyUtils.random(btnJumpY, btnJumpY + 30);
        //     this.btnAnchor.y = randomY;
        //     Laya.timer.once(ConfigData.ctrlInfo.btuMove[3], this, () => {
        //         Laya.Tween.to(this.btnAnchor, {y: 346 }, 300, Laya.Ease.backOut);
        //     });
        // } else {
        //     this.btnAnchor.y = 346;
        //     this.btnAnchor.visible = true;
        //     PlatformMgr.callAPIMethodByProxy("showInterstitialAD");
        // }
        if(Global.Data.isCheck)
        {
            this.btnAnchor.bottom = 324;
            let banner:BannerNode = this.owner.getChildByName("banner").getComponent(BannerNode);
            banner.Show();
        }
        else{
            this.wudian();
        }
    }
    wudian()
    {
        this.btnAnchor.bottom = 124;
        Laya.timer.once(2000,this,()=>{
            let banner:BannerNode = this.owner.getChildByName("banner").getComponent(BannerNode);
            banner.Show();
        })
        Laya.timer.once(3000,this,()=>{
            this.btnAnchor.bottom = 324;
        })
    }

    onRender(cell: Laya.Box, index: number): any {
        let img = cell.getChildAt(0) as Laya.Image;
        img.skin = this.adData[index].param;
    }

    onClickItem(e:Laya.Event, index): void {
        if (e.type == Laya.Event.CLICK) {
            if ((e.target) instanceof Laya.Box) {
                let cell:Laya.Box = e.target;
                //跳转到其他小游戏 
                let adInfo = this.adData[index];
                var _d: any = {
                    my_uuid: adInfo.position,
                    to_appid: adInfo.appid,
                    appid : adInfo.appid,
                    toLinks : adInfo.toLinks,
                    notShowAd:true,
                };
                _d.callback = ()=>{
                    WXAPI.ald("结算页广告位跳出成功",{
                        "path": adInfo.toLinks,
                        "appId": adInfo.appid,
                        "position": adInfo.position
                    })
                }
                WXAPI.ald("结算页广告位跳出",{
                    "path": adInfo.toLinks,
                    "appId": adInfo.appid,
                    "position": adInfo.position
                })
                PlatformMgr.callAPIMethodByProxy("navigateToMiniProgram",_d);
                if(this.adDataRandom.length > 0){ //点击后切换
                    let img = cell.getChildAt(0) as Laya.Image;
                    this.adDataRandom.push(adInfo);
                    this.adData[index] = this.adDataRandom.shift();
                    img.skin = this.adData[index].param;
                }
            }
        }
    }
}