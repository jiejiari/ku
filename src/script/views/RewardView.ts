import BaseView from "./BaseView";
import { cionAni } from "./cionAni";
import MyUtils from "../tools/MyUtils";
import UserData from "../models/UserData";
import PlatformMgr from "../mgrCommon/PlatformMgr";
import { SHARE_VIDEO_TYPE } from "../mgrCommon/StatisticsMgr";
import EventMgr from "../mgrCommon/EventMgr";
import HttpMgr from "../mgrCommon/HttpMgr";
import AdListLoop from "./AdListLoop";
import ConfigData from "../models/ConfigData";
import WXAPI from "../platform/wx/WXAPI";

export enum RewardViewType{  //游戏碰撞类型
    Offline = 0,
    Settle //结算
}

export default class RewardView extends BaseView {
    private getBtn:Laya.Image;
    private tickBgImg:Laya.Image;
    private goldLab:Laya.Label;
    private tickImg:Laya.Image;
    
    private myMoneyClip:Laya.FontClip;
    private myMoneyUnitClip:Laya.FontClip;
    private lightImg:Laya.Image;
    private node:Laya.Image;
    private goldBgImg:Laya.Image;
    private goleIconImg:Laya.Image;
    private goldLabImg:Laya.Image;
    private treasureChestImg:Laya.Image;

    private currentType:RewardViewType ;
    
    private gold = 100; // text
    private goldState = 0; //0   1减   2加
    private startGoldTime = 0;

    private isGoldeggs:boolean;
    private isGamepass:number;

    private myData:any;

    private adPlane:AdListLoop;

    private posID:number;

    constructor() { 
        super();
    }

    onAwake(): void {
        super.onAwake();
        this.goldBgImg = this.owner.getChildByName("goldBgImg") as Laya.Image;
        this.myMoneyUnitClip = this.goldBgImg.getChildByName("myMoneyUnitClip") as Laya.FontClip;
        this.myMoneyClip = this.goldBgImg.getChildByName("myMoneyClip") as Laya.FontClip;
        this.goleIconImg = this.goldBgImg.getChildByName("goleIconImg") as Laya.Image;

        this.node =  this.owner.getChildByName("node") as Laya.Image;
        this.lightImg = this.node.getChildByName("lightImg") as Laya.Image;
        this.goldLabImg =  this.node.getChildByName("goldLabImg") as Laya.Image;
        this.goldLab = this.goldLabImg.getChildByName("goldLab") as Laya.Label;

        this.tickBgImg = this.node.getChildByName("tickBgImg") as Laya.Image;
        this.tickImg =  this.tickBgImg.getChildByName("tickImg") as Laya.Image;
        let bottom = this.owner.getChildByName("bottom") as Laya.Image;
        this.getBtn = bottom.getChildByName("getBtn") as Laya.Image;

        this.adPlane = this.owner.getChildByName("ButtonADPanel").getComponent(AdListLoop);
        this.treasureChestImg = this.node.getChildByName("treasureChestImg") as Laya.Image;
      
        bottom.centerY += this.offset.y / 3;

        MyUtils.autoScreenSize([this.goldBgImg]);

        Laya.timer.loop(60, this, this.onUpdate2);

    }

    addEvent() {
        this.getBtn.on(Laya.Event.CLICK, this, this.onClickGet);
        this.tickBgImg.on(Laya.Event.CLICK, this, this.onClickTick);
        super.addEvent();
    }
    
    public removeEvent() {
        this.getBtn.off(Laya.Event.CLICK, this, this.onClickGet);
        this.tickBgImg.off(Laya.Event.CLICK, this, this.onClickTick);
        super.removeEvent();
    }

    onEnable(): void {
        // this.tickImg.visible = (LogicManager.userData.adCount<8);
        this.addEvent();
        this.goldLab.text = (this.gold*5).toString(); // (LogicManager.userData.adCount<8) ? (this.gold*5).toString() : this.gold.toString();

        // 140/4=35   231/11=21   118
        // let result = MyUtils.scoreConversion(UserData.gold);
        // this.myMoneyClip.value = result.value;
        // this.myMoneyUnitClip.visible = (result.isK!=null);
        // let imgname = ["T", "B", "M", "K"];
        // let vl = result.value.length*21;
        // if(result.isK){
        //     this.myMoneyUnitClip.value = imgname[result.isK];
        //     let tl = vl;
        //     vl += 2 + 35;
        //     this.myMoneyUnitClip.x = 118-vl/2+tl+2;
        // }
        // this.myMoneyClip.x = 118-vl/2;
        this.myMoneyClip.value = UserData.getMoney() + "";
    }

    showADPanel(){
        (this.owner.getChildByName("ButtonADPanel") as Laya.View).visible = true;
        Laya.timer.frameOnce(2,this,()=>{
            this.adPlane.init({
                _cellWidth: 130,
                _cellHeight:156,
                _spaceX:23
            });
            this.adPlane.start(ConfigData.getAdData(3),3,"获取多倍金币页");
        });
    }

    hideADPanel(){
        (this.owner.getChildByName("ButtonADPanel") as Laya.View).visible = false;
    }

    openView(data?: any){
        super.openView(data);
        this.myData = data;
        if(data){
            this.currentType = data.type;
            this.gold = data.gold;
        }
        this.goldLab.text = (this.gold*1).toString(); 

        if(RewardViewType.Offline==this.currentType){
            if(PlatformMgr.callAPIMethodByProxy("showBannerAdSettle")){
                this.hideADPanel();
            }else{
                // this.showADPanel();
            }
            this.posID = 202;
        }else if(RewardViewType.Settle==this.currentType){
            if(PlatformMgr.callAPIMethodByProxy("showBannerAdOnLineCoinReward")){
                this.hideADPanel();
            }else{
                // this.showADPanel();
            }
            this.posID = 205;
        }
    }

    private isVedio: boolean = false;
    
onClickGet(){
    if (this.isVedio) return;
    this.OVERhuoquAIn();
     return;

    if(this.tickImg.visible){     
        if (PlatformMgr.ptAPI) {
            if(RewardViewType.Offline==this.currentType){
                WXAPI.ald("获取多倍离线金币--视频");
            }else if(RewardViewType.Settle==this.currentType){
                WXAPI.ald("获取多倍结算金币--视频");
            }
            this.isVedio = true;
            let myType = SHARE_VIDEO_TYPE.NORMAL;
            if(RewardViewType.Offline==this.currentType){
                myType = SHARE_VIDEO_TYPE.OFFLINE;
            }else if(RewardViewType.Settle==this.currentType){
                myType = SHARE_VIDEO_TYPE.SETTLE;
            }
            PlatformMgr.callAPIMethodByProxy("showVideo",{
                posID:this.posID,
                _type:myType,
                caller:this, 
                callBackSuc:() => {
                    if(RewardViewType.Offline==this.currentType){
                        HttpMgr.instance.getOfflineAward(5, this, ()=>{
                            this.myData.gold = this.myData.gold *5;
                            this.OVERhuoquAIn();
                        });
                        WXAPI.ald("获取多倍离线金币成功--视频");
                    }else if(RewardViewType.Settle==this.currentType){
                        this.myData.gold = this.myData.gold *5;
                        this.OVERhuoquAIn();
                        WXAPI.ald("获取多倍结算金币成功--视频");
                    }
                },
                callBackFail:() => {
                    EventMgr.instance.emit("openTip", "看完视频才能领取奖励");
                    this.isVedio = false;
                },
                callBackErro:() => {
                    this.isVedio = false;
                    EventMgr.instance.emit("openTip", "今日视频次数已用完");
                }
            });
        } else {
            if(RewardViewType.Offline==this.currentType){
                HttpMgr.instance.getOfflineAward(5, this, ()=>{
                    this.myData.gold = this.myData.gold *5;
                    this.OVERhuoquAIn();
                });
            }else if(RewardViewType.Settle==this.currentType){
                this.myData.gold = this.myData.gold *5;
                this.OVERhuoquAIn();
            }
        }

    } else{
        if(RewardViewType.Offline==this.currentType){
            HttpMgr.instance.getOfflineAward(1, this, ()=>{
                this.OVERhuoquAIn();
            });
        }else if(RewardViewType.Settle==this.currentType){
            this.OVERhuoquAIn();
        }
    }

}

    public SetGold(g){
        this.gold = g;
    }

    onClickTick(){

        let vb = this.tickImg.visible;
        this.goldState = vb ? 1:2;
        this.goldLab.text = vb ? (this.gold*5).toString() : this.gold.toString();
        this.startGoldTime = Laya.timer.currTimer;
        this.tickImg.visible = !vb;
    }

    onUpdate2(){
        this.lightImg.rotation += 1;
        if(this.lightImg.rotation>360){
            this.lightImg.rotation -=360;
        }

        if(this.goldState){
            let g = parseInt(this.goldLab.text);
            if(this.goldState == 1){
                g -= 300;
                if(g<=this.gold || (this.startGoldTime+2000)<Laya.timer.currTimer){
                    g = this.gold;
                    this.goldState = 0;
                }
            }else if(this.goldState ==2){
                g += 300;
                if(g>=(this.gold*5) || (this.startGoldTime+2000)<Laya.timer.currTimer){
                    g = (this.gold*5);
                    this.goldState = 0;
                }
            }
            this.goldLab.text = g.toString();
        }
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
                    this.closeView();
                    PlatformMgr.callAPIMethodByProxy("destoryAllBannerAd");
                    if(RewardViewType.Settle==this.currentType){                                        
                        EventMgr.instance.emit("openGameOver",this.myData);
                        EventMgr.instance.emit("openTip", "领取金币"+this.myData.gold.toString());
                    }else if(RewardViewType.Offline==this.currentType){
                        EventMgr.instance.emit("goHome");
                        EventMgr.instance.emit("openTip", "领取金币"+this.myData.gold.toString());
                    }
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
        let originalPos = {x:this.node.x+this.treasureChestImg.x, y:this.node.y+this.treasureChestImg.y};
        let targetPos = {x:this.goldBgImg.x+this.goleIconImg.x, y:this.goldBgImg.y+this.goleIconImg.y};
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
}