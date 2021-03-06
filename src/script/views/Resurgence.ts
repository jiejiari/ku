import PlatformMgr from "../mgrCommon/PlatformMgr";
import ConfigData, { SORTTYPE } from "../models/ConfigData";
import BaseView from "./BaseView";
import EventMgr from "../mgrCommon/EventMgr";
import MyUtils from "../tools/MyUtils";
import { SHARE_VIDEO_TYPE } from "../mgrCommon/StatisticsMgr";
import SoundMgr from "../mgrCommon/SoundMgr";
import WXAPI from "../platform/wx/WXAPI";
import UserData from "../models/UserData";
import { EventDefine } from "../mgrCommon/EventDefine";
import GameMgr, { GameStatus } from "../mgr3d/GameMgr";
import SceneMgr from "../mgr3d/SceneMgr";

export default class Resurgence extends BaseView {
    private goingSurpassOther:Laya.WXOpenDataViewer;
    private btnAnchor: Laya.Image;
    private btnShare: Laya.Image;
    private btnVideo: Laya.Image;
    private btnJump: Laya.Label;
    private reviveCount: Laya.Label;
    private progressMask: Laya.Image;
    private endAngle: number = -90;

    private isLoadAD: boolean = false; //是否正在拉取视频,防止玩家在拉取视频时进行其他操作
    private goShareAdc: boolean = false; //分享或者看视频


    private progressBg:Laya.Image;

    private resurgenceTime:number = 7000;

    constructor() { 
        super(); 
    }

    onAwake(): void {
        super.onAwake();
        this.endAngle = -90;
        this.btnAnchor = this.owner.getChildByName("btnAnchor") as Laya.Image;
        this.btnShare = this.btnAnchor.getChildByName("shareBtn") as Laya.Image;
        this.btnVideo = this.btnAnchor.getChildByName("videoBtn") as Laya.Image;
        this.btnJump = this.btnAnchor.getChildByName("skipBtn") as Laya.Label;
        this.progressBg = this.owner.getChildByName("progressBg") as Laya.Image;
        this.progressMask = (this.progressBg.getChildByName("progressBg") as Laya.Image).mask as Laya.Image;
        this.progressMask.graphics.clear();
        this.progressMask.graphics.drawPie(149, 149, 149, -90, this.endAngle, "#ff0000");

        this.reviveCount = this.progressBg.getChildByName("reviveCount") as Laya.Label;
     
        this.isLoadAD = false;

        this.btnAnchor.centerY += this.offset.y / 3;
        this.progressBg.y += this.offset.y / 3;
    }

    addEvent() {
        this.btnShare.on(Laya.Event.CLICK, this, this.shareClick);
        this.btnVideo.on(Laya.Event.CLICK, this, this.videoClick);
        this.btnJump.on(Laya.Event.CLICK, this, this.jumpClick);
        super.addEvent();
    }
    
    public removeEvent() {
        this.btnShare.off(Laya.Event.CLICK, this, this.shareClick);
        this.btnVideo.off(Laya.Event.CLICK, this, this.videoClick);
        this.btnJump.off(Laya.Event.CLICK, this, this.jumpClick);
        super.removeEvent();
    }


    countDown(): void {
        if (this.goShareAdc) {
            return;
        }
        let pre = this.resurgenceTime;
        let cur = pre - 1000;
        //this.soundTime +=1000;
        if (cur < 100) {
            this.reviveCount.text =  (Math.ceil(cur/1000)).toString();
            this.resurgenceTime = cur;
            this.progressMask.graphics.clear();
            this.progressMask.graphics.drawPie(147, 147, 147, -90, 270, "#ff0000");
           // this.soundTime = 0;
            this.openOver();
        } else {
            this.reviveCount.text =  (Math.ceil(cur/1000)).toString();
            this.resurgenceTime = cur;
            this.endAngle += 51.4;
            this.progressMask.graphics.drawPie(147, 147, 147, -90, this.endAngle, "#ff0000");
            //SoundMgr.instance.playSound("djs");
        }
    }

    private sptVideoAni(){
        Laya.Tween.clearTween(this.btnVideo);
        this.tweenAniDown(this.btnVideo, {scaleX:1.05, scaleY:1.05}, {scaleX:0.95, scaleY:0.95}, 400);
    }

    public openView(): void {
        super.openView();
      
        Laya.timer.clearAll(this);
        this.reviveCount.text = "7";
        this.resurgenceTime = 7000;
        // 无限时间
        Laya.timer.loop(1000, this, this.countDown);

        this.btnShare.visible = false;
        this.btnVideo.visible = false;

        Laya.Tween.clearTween(this.progressBg);
        this.tweenAniDown(this.progressBg, {scaleX:1.1, scaleY:1.1}, {scaleX:0.9, scaleY:0.9}, 500);

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

    openGoingSurpassOther(_type): void {
        if (PlatformMgr.subDomain) {
            if(!this.goingSurpassOther){
                this.goingSurpassOther = new Laya.WXOpenDataViewer();
                this.owner.addChild(this.goingSurpassOther);
            }
            this.goingSurpassOther.pos(0,142);
            this.goingSurpassOther.width = 750;
            this.goingSurpassOther.height = 92;
            PlatformMgr.subDomain.setOpenView(this.goingSurpassOther);
            PlatformMgr.subDomain.openGoingSurpassOther(_type);
        }
    }

    closeGoingSurpassOther(): void {
        if (PlatformMgr.subDomain) {
            PlatformMgr.subDomain.closeGoingSurpassOther();
            if(this.goingSurpassOther){
                this.goingSurpassOther.destroy();
                this.goingSurpassOther = null;
            }
        }
    }

    onEnable():void{
        super.onEnable();
    }

    onDisable(): void {
        super.onDisable();
        PlatformMgr.callAPIMethodByProxy("destroyBannerAdOther");
        this.closeGoingSurpassOther();
    }


    videoClick() {
        if (this._isClick) {
            return;
        }
        this._isClick = true;
        Laya.timer.once(500, this, () => {
            this._isClick = null;
        });
        if (PlatformMgr.ptAPI) {
            this.isLoadAD = true;
            this.goShareAdc = true;
            WXAPI.ald("立即复活--视频")
            PlatformMgr.callAPIMethodByProxy("showVideo",{
                posID:204,
                _type:SHARE_VIDEO_TYPE.RESURGENCE,
                caller:this, 
                callBackSuc:() => {
                    //玩家复活
                    this.openFighting();
                    this.isLoadAD = false;
                    this.goShareAdc = false;
                    WXAPI.ald("立即复活成功--视频")
                },
                callBackFail:() => {
                    EventMgr.instance.emit("openTip", "看完视频才能复活");
                    this.isLoadAD = false;
                    this.goShareAdc = false;
                },
                callBackErro:() => {
                    EventMgr.instance.emit("openTip", "今日视频次数已用完");
                    this.isLoadAD = false;
                    this.goShareAdc = false;
                }
            });
        } else {
            //直接复活
            this.openFighting();
         
        }

    }

    shareClick() {
        if (this._isClick) {
            return;
        }
        if (this.isLoadAD) {
            return;
        }
        this.goShareAdc = true;
        this._isClick = true;
        Laya.timer.once(500, this, () => {
            this._isClick = null;
        });
        WXAPI.ald("分享复活")
        if (PlatformMgr.ptAPI) {
            PlatformMgr.callAPIMethodByProxy("shareAppMessage",{
                caller: this,
                callback: (res) => {
                    this.goShareAdc = false;
                    if (res.success) {
                        //复活
                        this.openFighting();
                    } else {
                        EventMgr.instance.emit("openTip", "需要成功分享才能复活");

                    }
                },
                args: {},
                type:1
            })
        } else {
            //直接复活
            this.openFighting();
        }
    }

    jumpClick() {
        if (this._isClick) {
            return;
        }
        if (this.isLoadAD) {
            return;
        }
        this._isClick = true;
        Laya.timer.once(500, this, () => {
            this._isClick = null;
        });
        this.closeView();
        //打开结算界面
        this.openOver();
    }

    //复活成功
    openFighting():void{
        EventMgr.instance.emit("openFighting", true);
    }

    //打开结算界面
    openOver() {
        if(Global.Data)
        {
            this.openWuDianScene(false);
        }
        else{
            let data:any = {
                type:1,
                passNum:UserData.level,//当前的关卡数
                isGoldeggs: false,
                isPass:false,//是否通关
                gold:GameMgr.Instance.GameOverScore(),//计算当前路程可获得的金币,获得本关的金币数
                _type:SORTTYPE.LEVEL,//闯关模式
            };
            // EventMgr.instance.emit("openRewardView",data);
            Laya.Scene.open("AllFlows.scene");
        }
        
    }
    openWuDianScene(pass:boolean)
    {
        this.closeView();
        Laya.Scene.open("WuDian.scene",null,()=>{
            let data:any = {
                type:1,
                passNum:UserData.getLeveNum(),//当前的关卡数
                isGoldeggs: false,
                isPass:pass,//是否通关
                gold:GameMgr.Instance.GameOverScore(),//计算当前路程可获得的金币,获得本关的金币数
                _type:SORTTYPE.LEVEL,//闯关模式
            };
            //cscs
            Laya.Scene.open("AllFlows.scene");
        });
        SceneMgr.Instance.mapComp.init(true);
        GameMgr.Instance.gameStatus = GameStatus.Execute;
    }

}