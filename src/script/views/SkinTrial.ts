import BaseView from "./BaseView";
import ConfigData from "../models/ConfigData";
import MyUtils from "../tools/MyUtils";
import PlatformMgr from "../mgrCommon/PlatformMgr";
import EventMgr from "../mgrCommon/EventMgr";
import { SHARE_VIDEO_TYPE } from "../mgrCommon/StatisticsMgr";
import SceneMgr from "../mgr3d/SceneMgr";
import UserData from "../models/UserData";
import MathUtil from "../tools/MathUtil";
import WXAPI from "../platform/wx/WXAPI";


export default class SkinTrial extends BaseView {
    
    constructor() { super(); }
    
    private btnSkin0:Laya.Image;
    private btnSkin1:Laya.Image;
    private btnSkin2:Laya.Image;
    private btnSkin3:Laya.Image;
    private btnJump:Laya.Image;
    private btnRandom:Laya.Image;
    private jumptoStartPosY:number;
    private isLoadAD: boolean = false; //是否正在拉取视频,防止玩家在拉取视频时进行其他操作
    private goShareAdc: boolean = false; //分享或者看视频
    private anchor:Laya.Image;

    private trySkinBoat:any = [];


    onAwake(): void {
        super.onAwake();
        this.anchor  = this.owner.getChildByName("anchor") as Laya.Image;
        this.anchor.y += this.offset.y / 2;

        this.btnSkin0 = this.anchor.getChildByName("0") as Laya.Image;
        this.btnSkin1 = this.anchor.getChildByName("1") as Laya.Image;
        this.btnSkin2 = this.anchor.getChildByName("2") as Laya.Image;
        this.btnSkin3 = this.anchor.getChildByName("3") as Laya.Image;

        this.btnJump = this.owner.getChildByName("btnJump") as Laya.Image;
        this.btnRandom = this.anchor.getChildByName("btnRandom") as Laya.Image;

        Laya.Tween.clearTween(this.btnRandom);
        this.tweenAniDown(this.btnRandom, {scaleX:1.05, scaleY:1.05}, {scaleX:0.95, scaleY:0.95}, 400);
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

    private initVideoSkin():boolean{
        let notUnlocked:any = []; //未解锁的皮肤
        let PlayerType = ConfigData.GetConfig("circle");

        for(let i:number = 0;i<PlayerType.length;i++){
            let unLockData:any = {};
            unLockData.Id = PlayerType[i].Id;
            unLockData.boatIsLock =  UserData.allView[unLockData.Id]==0?false:true;

            if(!unLockData.boatIsLock){
                continue;
            }

            unLockData.boatImageResouce = PlayerType[i].Icon;
            unLockData.Res = PlayerType[i].Res;
            notUnlocked.push(unLockData);
        }

        if(notUnlocked.length>=4){
            this.btnSkin0.visible = true;
            this.btnSkin1.visible = true;
            this.btnSkin2.visible = true;
            this.btnSkin3.visible = true;

            this.btnSkin0.pos(-176,-354);
            this.btnSkin1.pos(28,-354);
            this.btnSkin2.pos(-176,-146);
            this.btnSkin3.pos(28,-146);

            this.trySkinBoat = MyUtils.randomSipArray(notUnlocked,4);  //获得试用皮肤数组
            for(let i:number = 0;i<this.trySkinBoat.length;i++){    //初始化图片
                   let skinRes = "skinShop/"+this.trySkinBoat[i].boatImageResouce+".png";
                   let btnSkin = this.anchor.getChildByName(i+"").getChildByName("skinImage") as Laya.Image;
                   btnSkin.skin = skinRes;
            }
        }else if(notUnlocked.length>=2){
            this.btnSkin0.visible = true;
            this.btnSkin1.visible = true;
            this.btnSkin2.visible = false;
            this.btnSkin3.visible = false;

            this.btnSkin0.pos(-176,-274.5);
            this.btnSkin1.pos(25.5,-275.5);

            this.trySkinBoat = MyUtils.randomSipArray(notUnlocked,2);

            for(let i:number = 0;i<this.trySkinBoat.length;i++){    //初始化图片
                let skinRes = "skinShop/"+this.trySkinBoat[i].boatImageResouce+".png";
                let btnSkin = this.anchor.getChildByName(i+"").getChildByName("skinImage") as Laya.Image;
                btnSkin.skin = skinRes;
         }

        }else{
            return false;
        }

        return true;


    }

    public static getdate() {
		var now = new Date();
		var y = now.getFullYear();
		var m = now.getMonth();
		var d = now.getDate();
		return y + "" + (m < 10 ? "0" + m : m) + "" + (d < 10 ? "0" + d : d);
	}


    public Hidden(){
        Laya.timer.clearAll(this);
        PlatformMgr.callAPIMethodByProxy("destoryAllBannerAd");
        this.closeView();
    }

    openView(data?: any){
        super.openView(data);
        if(this.initVideoSkin()){

            if (ConfigData.ctrlInfo.isWudian&&(ConfigData.wudian_level[0]==1)) {
                this.btnJump.alpha = 0;

                Laya.timer.once(ConfigData.ctrlInfo.btuAppear[0], this, ()=>{
                    Laya.Tween.to( this.btnJump,{alpha:1}, 300);
                });	
    
                let btnJumpY = 1260+this.offset.y /2;
                console.log("SkinTrial this.offset.y = "+ConfigData.ctrlInfo.btuMove[0]);
                let randomY = MyUtils.random(btnJumpY, btnJumpY + 30);
                let centerX = 375;
                let randomX = MyUtils.random(centerX - 30, centerX + 30);
                this.btnJump.pos(randomX, randomY);
    
    
                Laya.timer.once(ConfigData.ctrlInfo.btuMove[0], this, () => {
                    Laya.Tween.to(this.btnJump, {y: 1020+this.offset.y / 2}, 300, Laya.Ease.backOut);
                });
            } else {
                let  btnJumpY = 1020 + this.offset.y/2;
                this.btnJump.y  = btnJumpY;
            }
        }else{
            this.Hidden();
            EventMgr.instance.emit("openFighting");
        } 
    }


    public addEvent() {
        this.btnSkin0.on(Laya.Event.CLICK,this,this.trySkinClick,[0]);
        this.btnSkin1.on(Laya.Event.CLICK,this,this.trySkinClick,[1]);
        this.btnSkin2.on(Laya.Event.CLICK,this,this.trySkinClick,[2]);
        this.btnSkin3.on(Laya.Event.CLICK,this,this.trySkinClick,[3]);
        this.btnJump.on(Laya.Event.CLICK,this,this.clickJumpButton);
        this.btnRandom.on(Laya.Event.CLICK,this,this.clickRandomButton);
        //this.btnSelect.on(Laya.Event.CLICK,this,this.selectClick);
        super.addEvent();
    }
    
    public removeEvent() {
        this.btnSkin0.off(Laya.Event.CLICK,this,this.trySkinClick);
        this.btnSkin1.off(Laya.Event.CLICK,this,this.trySkinClick);
        this.btnSkin2.off(Laya.Event.CLICK,this,this.trySkinClick);
        this.btnSkin3.off(Laya.Event.CLICK,this,this.trySkinClick);
        this.btnJump.off(Laya.Event.CLICK,this,this.clickJumpButton);
        this.btnRandom.off(Laya.Event.CLICK,this,this.clickRandomButton);
        //this.btnSelect.off(Laya.Event.CLICK,this,this.selectClick);
        super.removeEvent();
    }


    private clickJumpButton(){
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

        this.Hidden();
        EventMgr.instance.emit("openFighting");
    }


    private clickRandomButton(){
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

        var num = MathUtil.Range(0,this.trySkinBoat.length-1);
        this.getVideoSkin(num);
    }


    
    trySkinClick(args){
        console.log("试用皮肤:",args);

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

        this.getVideoSkin(args);
        

    }

    getVideoSkin(args){
        if(args>this.trySkinBoat.length-1){
            args = this.trySkinBoat.length-1;
        }

        if (PlatformMgr.ptAPI) {
            this.isLoadAD = true;
            this.goShareAdc = true;
            WXAPI.ald("试用皮肤--视频");
            PlatformMgr.callAPIMethodByProxy("showVideo",{
                posID:203,
                _type:SHARE_VIDEO_TYPE.TRY_SKIN,
                caller:this, 
                callBackSuc:() => {
 
                    this.Hidden();
                    SceneMgr.Instance.TrySkin(this.trySkinBoat[args].Id);
                    UserData.curMultiple = UserData.curMultiple+0.3;
                    EventMgr.instance.emit("openFighting");
                    WXAPI.ald("试用皮肤成功--视频");
                },
                callBackFail:() => {
                    EventMgr.instance.emit("openTip", "看完视频才能获得奖励");
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

            this.Hidden();
            SceneMgr.Instance.TrySkin(this.trySkinBoat[args].Id);
            UserData.curMultiple = UserData.curMultiple+0.3;
            EventMgr.instance.emit("openFighting");

        }
    }
}