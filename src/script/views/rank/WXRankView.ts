import BaseView from "../BaseView";
import PlatformMgr from "../../mgrCommon/PlatformMgr";
import MyUtils from "../../tools/MyUtils";
import WXSubDomain from "../../platform/wx/WXSubDomain";
import HttpMgr from "../../mgrCommon/HttpMgr";
import RankItem from "./RankItem";
import UserData from "../../models/UserData";
import MyLog from "../../tools/MyLog";
import EventMgr from "../../mgrCommon/EventMgr";
import { EventDefine } from "../../mgrCommon/EventDefine";

export default class RankView extends BaseView {
    private friendBtn:Laya.Image;
    private worldBtn:Laya.Image;

    private selectFriendRank: Laya.Image;
    private normalFriendRank: Laya.Image;

    private selectWorldRank: Laya.Image;
    private normalWorldRank: Laya.Image;
    private selectLine:Laya.Image;
    
    private worldRank:Laya.Image;
    private worldData:Array<any>;
    private wxOpenDataView: Laya.WXOpenDataViewer;
    
    private worldRankList: Laya.List;

    private selfRankSprite;
    private selfRankITem:RankItem;
    private selfRankData;
    
    onAwake(): void {
        super.onAwake();
        this.closeBtn = this.owner.getChildByName("btnClose") as Laya.Image;
        let node = this.owner.getChildByName("content") as Laya.Image;
        this.friendBtn = node.getChildByName("friendBtn") as Laya.Image;
        this.worldBtn = node.getChildByName("worldBtn") as Laya.Image;
        this.normalFriendRank = node.getChildByName("normalFriendRank") as Laya.Image;
        this.normalWorldRank = node.getChildByName("normalWorldRank") as Laya.Image;
        this.selectFriendRank = this.normalFriendRank.getChildByName("selectFriendRank") as Laya.Image;
        this.selectWorldRank = this.normalWorldRank.getChildByName("selectWorldRank") as Laya.Image;
        this.selectLine = node.getChildByName("select") as Laya.Image;

        node.y = node.y + this.offset.y/2;

        this.worldRankList = node.getChildByName("worldRankList") as Laya.List;
        this.worldRankList.array = [];
        this.worldRankList.renderHandler = new Laya.Handler(this, this.onRender);
        this.worldRankList.vScrollBarSkin = "";

        this.selfRankSprite = node.getChildByName("selfRankItem")
        this.selfRankITem = this.selfRankSprite.getComponent(RankItem)

        MyUtils.autoScreenSize([this.closeBtn]);
        this.selfRankSprite.visible = false;
    }

    setMyRankInfo(){
        this.selfRankITem.updateItem(this.selfRankData);
    }

    onRender(cell: Laya.Box, index: number): any {
        let item:RankItem = cell.getComponent(RankItem);
        item.updateItem(cell.dataSource);
    }

    public addEvent() {
        super.addEvent();
        this.closeBtn.on(Laya.Event.CLICK, this, this.closeView);
        this.worldBtn.on(Laya.Event.CLICK, this, this.worldRankClick);
        this.friendBtn.on(Laya.Event.CLICK, this, this.friendRankClick);
    }

    private getWorldData(){
        HttpMgr.instance.getWorldRank({
            success:(res)=>{
                //MyLog.log("getWorldData:"+JSON.stringify(res))
                this.worldData = res.rank;
                this.selfRankData = {
                    index : res.myIndex,
                    nickname:UserData.nickName,
                    headImage:UserData.avatarUrl,
                    score:UserData.level ? UserData.level - 1 : 0
                }
                if(res.myIndex && res.index > 0 && res.myIndex <= this.worldData.length){
                    this.selfRankData = this.worldData[res.myIndex-1];
                }
                this.setWorldRankDta();
            }
        })
    }

    private setWorldRankDta(){
        this.setMyRankInfo();
        this.worldRankList.array = this.worldData;
        this.worldRankList.refresh();
    }

    worldRankClick(): any {
        this.selectFriendRank.visible = false;
        this.selectWorldRank.visible = true;
        this.worldRankList.visible = true;
        this.selfRankSprite.visible = true;
        this.selectLine.x = 75;
        this.closeFriendRank();
        if(this.worldData){
            this.setWorldRankDta();
        }else{
            this.getWorldData();
        }
    }

    friendRankClick(): any {
        this.selectFriendRank.visible = true;
        this.selectWorldRank.visible = false;
        this.worldRankList.visible = false;
        this.selfRankSprite.visible = false;
        this.selectLine.x = -145;
        //打开子域排行榜 TODO
        if(PlatformMgr.subDomain){
            if(!this.wxOpenDataView){
                this.wxOpenDataView = new Laya.WXOpenDataViewer();
                this.owner.addChild(this.wxOpenDataView);
            }
            this.wxOpenDataView.width = 561;
            this.wxOpenDataView.height = 828;
            this.wxOpenDataView.pos(95,279);
            this.wxOpenDataView.y = this.wxOpenDataView.y  + this.offset.y/2;
            PlatformMgr.callSubDomainMethodByProxy("setOpenView",this.wxOpenDataView);
            PlatformMgr.callSubDomainMethodByProxy("openFriendRank",{_type:this._data._type});
        }
    }

    closeFriendRank(){
        if(PlatformMgr.subDomain){
            if(this.wxOpenDataView){
                this.wxOpenDataView.destroy();
                this.wxOpenDataView = null;
            }
            PlatformMgr.callSubDomainMethodByProxy("closeFriendRank");
        }
    }

    public removeEvent() {
        this.closeBtn.off(Laya.Event.CLICK, this, this.closeView);
        this.worldBtn.off(Laya.Event.CLICK, this, this.worldRankClick);
        this.friendBtn.off(Laya.Event.CLICK, this, this.friendRankClick);
        super.removeEvent();
    }

    public openView(_data?:any){
        super.openView(_data);
        if(PlatformMgr.subDomain)
            this.friendRankClick();
        else
            this.worldRankClick();
    }

    public closeView(){
        this.worldData = null;
        if(PlatformMgr.subDomain){
            this.closeFriendRank();
        }
        super.closeView();
    }

    onEnable():void{
        super.onEnable();
        PlatformMgr.callAPIMethodByProxy("destoryAllBannerAd");
    }

    onDisable(): void {
        super.onDisable();
        EventMgr.instance.emit(EventDefine.BANNER_SHOW);
    }
}