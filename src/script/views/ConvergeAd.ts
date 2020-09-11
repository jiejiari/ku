import BaseView from "./BaseView";
import TipView from "./TipView";
import MyUtils from "../tools/MyUtils";
import PlatformMgr from "../mgrCommon/PlatformMgr";
import ConfigData, { MAINBTNSTYPE } from "../models/ConfigData";
import ViewMgr from "../mgrCommon/ViewMgr";
import EventMgr from "../mgrCommon/EventMgr";
import WXAPI from "../platform/wx/WXAPI";
import { EventDefine } from "../mgrCommon/EventDefine";

export default class ConvergeAd extends BaseView {
    private appid = "";//需要调转的APPID
    private adList: Laya.List;

    onAwake(){
        super.onAwake();
        MyUtils.autoScreenSize([this.homeBtn]);

        this.adList = this.owner.getChildByName("list") as Laya.List;
        this.adList.vScrollBarSkin = '';
        this.adList.selectEnable = true;
        this.adList.y = 20;
        this.adList.renderHandler = new Laya.Handler(this, this.onRender);
        this.adList.mouseHandler = new Laya.Handler(this, this.onClickItem);
        if(Laya.stage.height > 1334){
            this.adList.y = 20 + (Laya.stage.height - 1334) / 2
        }
        PlatformMgr.callAPIMethodByProxy("destoryAllBannerAd");
        this.okBtn.visible = !ViewMgr.instance.getView("GameFighting.scene");
    }
    
    public addEvent() {
        super.addEvent();
        this.okBtn.on(Laya.Event.CLICK, this, this.okClick);
        this.homeBtn.on(Laya.Event.CLICK, this, this.onClickHome);
    }

    public removeEvent() {
        super.removeEvent();
        this.okBtn.off(Laya.Event.CLICK, this, this.okClick);
        this.homeBtn.off(Laya.Event.CLICK, this, this.onClickHome);
    }

    public openView(data?: any) {
        super.openView(data);
        this.homeBtn.visible = false;
        let allll = [];
        if (this.adList.array == null) {
            allll = ConfigData.getAdData(5);
            this.adList.array = allll;
        }
        this.adList.refresh();//刷新数据源
        this.adList.scrollTo(0); //第一个显示的 位置
        Laya.timer.once(1000, this, () => {
            if (this && this.homeBtn) {
                this.homeBtn.visible = true;
            }
        })
    }

    public onClickHome() {
        this.closeView();
        EventMgr.instance.emit(EventDefine.BANNER_SHOW);
        if(ViewMgr.instance.getView("GameOver.scene"))
            EventMgr.instance.emit("goHome");
    }

    public okClick() {
        this.closeView();
        EventMgr.instance.emit(EventDefine.BANNER_SHOW);
        if(!ViewMgr.instance.getView("GameFighting.scene"))
            EventMgr.instance.emit("openSkinTrial");
    }

    /**
    * 单个 box 点击事件
    */
    private onClickItem(e: Laya.Event, index: number): void {
        if (e.type == Laya.Event.CLICK) {
            if ((e.target) instanceof Laya.Box) {
                let adInfo = this.adList.array[index];
                var _d: any = {
                    my_uuid: adInfo.position,
                    to_appid: adInfo.appid,
                    appid : adInfo.appid,
                    toLinks : adInfo.toLinks,
                };
                _d.callback = ()=>{
                    WXAPI.ald("聚合页广告位跳出成功",{
                        "path": adInfo.toLinks,
                        "appId": adInfo.appid,
                        "position": adInfo.position
                    })
                }
                WXAPI.ald("聚合页广告位跳出",{
                    "path": adInfo.toLinks,
                    "appId": adInfo.appid,
                    "position": adInfo.position
                })
                PlatformMgr.callAPIMethodByProxy("navigateToMiniProgram", _d);
            }
        }
    }
    private onRender(cell: Laya.Box, index: number): void {
        if (index > this.adList.array.length && this.adList.array.length == 0) return;
        if (this.adList.array[index] != null) {
            var img = cell.getChildByName("img") as Laya.Image;
            img.skin = this.adList.array[index].param;
        }
    }
}