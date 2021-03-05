import BaseView from "./BaseView";
import EventMgr from "../mgrCommon/EventMgr";
import SceneMgr from "../mgr3d/SceneMgr";
import ConfigData from "../models/ConfigData";
import UserData from "../models/UserData";
import HttpMgr from "../mgrCommon/HttpMgr";
import PlatformMgr from "../mgrCommon/PlatformMgr";
import { SHARE_VIDEO_TYPE } from "../mgrCommon/StatisticsMgr";
import GameConfig from "../../GameConfig";
import MyUtils from "../tools/MyUtils";
import WXAPI from "../platform/wx/WXAPI";
import GameMgr from "../mgr3d/GameMgr";

export default class SkinShopView extends BaseView {

    private shopList:Laya.List;
    private buyPanel:Laya.Image;
    private shopBg:Laya.Image;
    private btn_videoUnlock:Laya.Button;
    private btn_coinUnlock:Laya.Button;
    private btn_selectBoat:Laya.Button;
    private boatSelectedLabel:Laya.Label;

    private btn_backHome:Laya.Image;
    private fc_coinNum:Laya.FontClip;
    private fc_coinUnitClip:Laya.FontClip;
    private videoTimes:Laya.FontClip;
    private shopCoinNum:Laya.FontClip;
    private myMoneyUnitClip:Laya.FontClip;
    private videoNeedTimes:Laya.FontClip;
    
    private PlayerType:any ;
    private curSelectedIndex:number = 0; //当前选择的索引
    /**
     *  index:1,
        boatImageResouce:"donwu1@2x.png",
        boatIsLock:false,
        boatUnLockCoin:10000,
        boatDescription:"咕咕，一只来自冰川的紫色企鹅。每天快乐的在河里漂流，自认为是冰川的第一漂流高手。",
        boatUnLockVideoTimes:0
     */
    private shopListData:any = [];
    private isLoadAD: boolean = false; //是否正在拉取视频,防止玩家在拉取视频时进行其他操作
    private goShareAdc: boolean = false; //分享或者看视频

    constructor() { super(); }
    
    onEnable(): void {
        super.onEnable();
    }

    onDisable(): void {
        super.onDisable();
    }


    onAwake(): void {
        super.onAwake();

        this.buyPanel = this.owner.getChildByName("buyPanel") as Laya.Image;
        this.shopBg = this.owner.getChildByName("shopBg") as Laya.Image;
        this.btn_videoUnlock = this.buyPanel.getChildByName("btn_videoUnlock") as Laya.Button;
        this.videoTimes = this.btn_videoUnlock.getChildByName("ft_viewTimes") as Laya.FontClip;
        this.videoNeedTimes = this.btn_videoUnlock.getChildByName("ft_unlockTimes") as Laya.FontClip;


        this.boatSelectedLabel = this.owner.getChildByName("selectedLabel") as Laya.Label;

        this.btn_coinUnlock = this.buyPanel.getChildByName("btn_coinUnlock") as Laya.Button;
        this.shopCoinNum = this.btn_coinUnlock.getChildByName("coinUnlockNum") as Laya.FontClip;
        this.myMoneyUnitClip = this.btn_coinUnlock.getChildByName("myMoneyUnitClip") as Laya.FontClip;

        this.btn_selectBoat = this.owner.getChildByName("btn_selectBoat") as Laya.Button;
        this.btn_backHome = this.owner.getChildByName("backHome") as Laya.Image; 
        let coinPanel = this.owner.getChildByName("coinPanel") as Laya.Image; 
        this.fc_coinNum = coinPanel.getChildByName("coinNum") as Laya.FontClip;
        this.fc_coinUnitClip = coinPanel.getChildByName("myMoneyUnitClip") as Laya.FontClip;
        

        MyUtils.autoScreenSize([this.btn_backHome,coinPanel]);
        coinPanel.y += 8;

        this.shopList = this.owner.getChildByName("listAd") as Laya.List;
        this.shopList.array = [];
        this.shopList.renderHandler = new Laya.Handler(this, this.onRender);
        this.shopList.mouseHandler = new Laya.Handler(this, this.onClickItem);
        //this.shopList.vScrollBarSkin = "";

        this.curSelectedIndex = UserData.curSelectViewId-1;

        this.PlayerType = ConfigData.GetConfig("circle");
        this.creatListDatas();
        this.setButtons(this.curSelectedIndex);

        this.buyPanel.y += this.offset.y;
        this.btn_selectBoat.y += this.offset.y;
        this.boatSelectedLabel.y += this.offset.y;

        this.shopList.y += this.offset.y/2.3;
        let listBg = this.owner.getChildByName("listBg") as Laya.Image;
        listBg.y += this.offset.y/2.3;
       
     //   this.btnAnchor = this.owner.getChildByName("btnAnchor") as Laya.Image;
        this.tweenAniDown(this.btn_videoUnlock, {scaleX:1.05, scaleY:1.05}, {scaleX:0.95, scaleY:0.95}, 400);
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

    private creatListDatas(){

        for(let i:number = 0;i<this.PlayerType.length;i++){
            let listOneData:any = {};

            listOneData.Id = this.PlayerType[i].Id;

            listOneData.boatImageResouce = this.PlayerType[i].Icon;
            listOneData.boatIsLock =  UserData.allView[listOneData.Id]==0?false:true;
            listOneData.boatUnLockCoin = this.PlayerType[i].Money;
            listOneData.Video = this.PlayerType[i].Video;
            listOneData.boatUnLockVideoTimes = this.PlayerType[i].Video;
            //listOneData.boatDescription =  this.PlayerType[i].Text;
            listOneData.Res =  this.PlayerType[i].Res;
            this.shopListData.push(listOneData);
        }

        let mod = this.shopListData.length % 3;
        if(mod > 0){
            for(let i = 0; i < 3 - mod; i++){
                this.shopListData.push({});
            }
        }
    }

    onRender(cell: Laya.Box, index: number): any {
        
        let boatImagemg = cell.getChildByName("boatImage") as Laya.Image;
        let beSelected = cell.getChildByName("beSelected") as Laya.Image;
        let boatLock = cell.getChildByName("boatLock") as Laya.Image;
        //let boatBg = cell.getChildByName("boatBg") as Laya.Image;

        if(!this.shopListData[index].Id){
            boatImagemg.visible = false;
            beSelected.visible = false;
            boatLock.visible = false;
            return;
        }

        boatImagemg.skin = "skinShop/"+this.shopListData[index].boatImageResouce+".png";
        boatLock.visible = this.shopListData[index].boatIsLock;
        if(this.shopListData[index].boatIsLock){
            //由 20 个项目（排列成 4 x 5 矩阵）组成的数组，灰图
            var grayscaleMat: Array<number> = [0.3086, 0.6094, 0.0820, 0, 0, 0.3086, 0.6094, 0.0820, 0, 0, 0.3086, 0.6094, 0.0820, 0, 0, 0, 0, 0, 1, 0];

            //创建一个颜色滤镜对象，灰图
            var grayscaleFilter:Laya.ColorFilter = new Laya.ColorFilter(grayscaleMat);
            boatImagemg.filters = [grayscaleFilter];
            //boatBg.skin = "skinShop/Bg_boatlock.png";
        }else{
            boatImagemg.filters = null;
            //boatBg.skin = "skinShop/Bg_boatUnlock.png";
        }

        if(index == this.curSelectedIndex){
            beSelected.visible = true;
        }else{
            beSelected.visible = false;
        }
    }

    onClickItem(e:Laya.Event, index): void {
        if (e.type == Laya.Event.CLICK) {
            if ((e.target) instanceof Laya.Box){
                if(!this.shopListData[index].Id){
                    return;
                }
                this.curSelectedIndex = index;
                this.setButtons(index);
                SceneMgr.Instance.ShowShopSkin( this.shopListData[index].Res);
                this.shopList.refresh();
            }
        }
    }

    private setButtons(index:number){
        console.log("UserData.unlockingBoatView = "+UserData.unlockingView);
        if(UserData.curSelectViewId == this.shopListData[index].Id){
            this.btn_selectBoat.visible = false;
            this.boatSelectedLabel.visible = true;

            SceneMgr.Instance.ShowShopSkin(this.shopListData[index].Res);
        }else{
            this.btn_selectBoat.visible = !this.shopListData[index].boatIsLock;
            this.boatSelectedLabel.visible = false;
        }
        
        let result = MyUtils.scoreConversion(this.shopListData[index].boatUnLockCoin);
        this.shopCoinNum.value = result.value;
        this.myMoneyUnitClip.visible = (result.isK!=null);
        let imgname = ["T", "B", "M", "K"];
        let vl = result.value.length*21;
        if(result.isK){
            this.myMoneyUnitClip.value = imgname[result.isK];
            let tl = vl;
            vl += 2 + 35;
           this.myMoneyUnitClip.x = 179-vl/2+tl+2;
        }
        this.shopCoinNum.x = 179-vl/2;
        
        //this.shopCoinNum.value = this.shopListData[index].boatUnLockCoin+"";
        this.buyPanel.visible = this.shopListData[index].boatIsLock;

        this.videoNeedTimes.value = this.shopListData[index].Video;
        if(UserData.unlockingView[this.shopListData[index].Id]!=null){

            let data:any = JSON.parse(UserData.unlockingView[this.shopListData[index].Id]);
            this.videoTimes.value = data["1"];
        }else{
            this.videoTimes.value = "0";
        }
        
        if( ConfigData.rewardedAdIds.length==0 || this.shopListData[index].Video == 0){
            this.btn_videoUnlock .visible = false;
            this.btn_coinUnlock.x = 345;
        }else{
            this.btn_videoUnlock .visible = true;
            this.btn_coinUnlock.x = 167;
        }

    }

    addEvent() {
      //  this.btnShare.on(Laya.Event.CLICK, this, this.shareClick);
        this.btn_coinUnlock.on(Laya.Event.CLICK, this, this.coinUnlockBtClick);
        this.btn_videoUnlock.on(Laya.Event.CLICK, this, this.videoUnlockBtClick);
        this.btn_selectBoat.on(Laya.Event.CLICK, this, this.selecteBoatkBtClick);
        this.btn_backHome.on(Laya.Event.CLICK, this, this.backToHomeBtClick);
 
        super.addEvent();
    }
    
    public removeEvent() {
      //  this.btnShare.off(Laya.Event.CLICK, this, this.shareClick);
        this.btn_coinUnlock.off(Laya.Event.CLICK, this, this.coinUnlockBtClick);
        this.btn_videoUnlock.off(Laya.Event.CLICK, this, this.videoUnlockBtClick);
        this.btn_selectBoat.off(Laya.Event.CLICK, this, this.selecteBoatkBtClick);
        this.btn_backHome.off(Laya.Event.CLICK, this, this.backToHomeBtClick);
        super.removeEvent();
    }


    private coinUnlockBtClick(){
        if (this._isClick) {
            return;
        }
 
        this._isClick = true;
        Laya.timer.once(500, this, () => {
            this._isClick = null;
        });

        if(UserData.gold> this.shopListData[this.curSelectedIndex].boatUnLockCoin){
            HttpMgr.instance.buyView(this.shopListData[this.curSelectedIndex].Id,(res)=>{this.buyBoatCallBack(res);});
        }else{
            EventMgr.instance.emit("openTip","金币不足！");
        }
    }

    /**
     * 买船回调
     * @param res 
     */
    private buyBoatCallBack(res:any){
        UserData.gold = res.userMoney;
        this.SetCoin();
        this.shopListData.length = 0;  //更新数据，整个界面刷新
        UserData.allView[res.systemViewId] = 0; //表示该船解锁了
        this.creatListDatas();
        this.shopList.refresh();
        this.setButtons(this.curSelectedIndex);
        EventMgr.instance.emit("openTip","成功解锁新皮肤！");
    }


    private SetCoin(){
        let result = MyUtils.scoreConversion(UserData.gold);
        this.fc_coinNum.value = result.value;
        this.fc_coinUnitClip.visible = (result.isK!=null);
        let imgname = ["T", "B", "M", "K"];
        let vl = result.value.length*21;
        if(result.isK){
            this.fc_coinUnitClip.value = imgname[result.isK];
            let tl = vl;
            vl += 2 + 35;
           this.fc_coinUnitClip.x = 118-vl/2+tl+2;
        }
        this.fc_coinNum.x = 118-vl/2;
    }
    /**
     * 视频解锁回调
     * @param res 
     */
    private videoUnlockBack(res:any){
        let self = this;
        let isUnlock = res.isUnlock;
        let unLockBoatViewId = res.systemViewId;
        let type:number = 1;
        let num:number = 0;
        let unlockView:any = res.unlockView;

        if(isUnlock){  //如果解锁了
            UserData.allView[isUnlock] = 0; //表示该船解锁了
           
            this.shopListData.length = 0;  //更新数据，整个界面刷新
            this.creatListDatas();
            this.shopList.refresh();
            this.setButtons(this.curSelectedIndex);
            EventMgr.instance.emit("openTip","成功解锁新皮肤！");
           
        }else{
            let videoTimes:number = 0;
            let sharedTimes:number = 0;

            UserData.unlockingView = JSON.parse(unlockView);  
            console.log("UserData.unlockingBoatView = "+UserData.unlockingView);
            this.setButtons(this.curSelectedIndex);
        }
    }

    private videoUnlockBtClick(){
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
            WXAPI.ald("皮肤商城--视频");
            PlatformMgr.callAPIMethodByProxy("showVideo",{
                posID:206,
                _type:SHARE_VIDEO_TYPE.PROP,
                caller:this, 
                callBackSuc:() => {
                    
                    HttpMgr.instance.unlockView(1,this.shopListData[this.curSelectedIndex].Id,(res)=>{this.videoUnlockBack(res);});

                    this.isLoadAD = false;
                    this.goShareAdc = false;
                    WXAPI.ald("皮肤商城成功--视频");
                },
                callBackFail:() => {
                    EventMgr.instance.emit("openTip", "看完视频才能累计次数");
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
       
            HttpMgr.instance.unlockView(1,this.shopListData[this.curSelectedIndex].Id,(res)=>{this.videoUnlockBack(res);});

        }
    }

    private selecteBoatkBtClick(){
        if (this._isClick) {
            return;
        }

        this._isClick = true;
        Laya.timer.once(500, this, () => {
            this._isClick = null;
        });

        SceneMgr.Instance.UseSkin(this.shopListData[this.curSelectedIndex].Id);
        HttpMgr.instance.changeView(this.shopListData[this.curSelectedIndex].Id);     

        this.Close();
    }

    private backToHomeBtClick(){
        this.Close();
    }

    public Close(){
        EventMgr.instance.emit("goHome");
        this.closeView();
    }

    public openView(data?: any): void {
        super.openView(data);

        this.shopList.array = this.shopListData;
        this.shopList.refresh();

        this.SetCoin();
        PlatformMgr.callAPIMethodByProxy("destoryAllBannerAd");
    }
}