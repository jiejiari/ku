import MyUtils from "../tools/MyUtils";
import BaseView from "../views/BaseView";
import EventMgr from "./EventMgr";
import ConfigData, { MAINBTNSTYPE, SORTTYPE } from "../models/ConfigData";

export default class ViewMgr {
    public static readonly instance: ViewMgr = new ViewMgr();
    private viewDic: any = {};

    private events = ["goHome","openTip","openResurgence","openFighting","openRank","openGoldenEggView","openGameOver","openSkinShop","openSkinTrial","openRewardView"];

    private constructor() {
    }

    init(){
        for (let index = 0; index < this.events.length; index++) {
            EventMgr.instance.onEvent(this.events[index],this,this[this.events[index]]);
        }
    }
    
    private goHome(res){
        this.openView({
            viewName: "MainView.scene",
            closeAll: true,
        });
    }

    private openRank(res){
        ViewMgr.instance.openView({
            viewName: "Rank.scene",
            closeAll: res.closeAll,
            data:res
        });
    }

    private openFighting(res){
        this.openView({
            viewName: "GameFighting.scene",
            closeAll: true,
            data:res
        });
    }

    //打开复活
    private openResurgence(res){
        this.openView({
            viewName: "Resurgence.scene",
            closeAll: true,
            data:res
        });
    }

    private openGameOver(res){
        this.openView({
            viewName: "GameOver.scene",
            closeAll: true,
            data:res
        });
    }

    //打开砸金蛋
    private openGoldenEggView(res){
        this.openView({
            viewName: "GoldenEggView.scene",
            closeAll: false,
            data:res
        });
    }

    private openTip(res){
        if (Laya.Browser.onMiniGame) {
            let obj = {};
            obj["title"] = res;
            obj["icon"] = "none";
            wx.showToast(obj);
        } else {
            this.openView({
                viewName: "Tip.scene",
                closeAll: false,
                data:res
            });
        }
    }

    //打开商店界面
    private openSkinShop(res){
        // Laya.Scene.open('SkinShop.scene',false)
        this.openView({
            viewName: "SkinShop.scene",
            closeAll: true,
            data:res
        });
    }

    /**
     * 打开奖励界面
     * @param res 
     */
    private openRewardView(res){
        this.openView({
            viewName: "RewardView.scene",
            closeAll: true,
            data:res
        });
    }

    private openSkinTrial(res){
        this.openView({
            viewName: "SkinTrial.scene",
            closeAll: true,
            data:res
        });
    }


    public openView(_d): void {
        let self = this;
        let url = _d.viewName;
        let cls = _d.cls;
        let closeAll = _d.closeAll || false;
        if (closeAll) {
            this.viewDic = {};
        }
        if (MyUtils.isNull(this.viewDic[url])) {
            Laya.Scene.open(url, closeAll, Laya.Handler.create(this, function (owner: any) {
                self.viewDic[url] = owner;
                let coms = owner._components;
                if(coms){
                    for (let index = 0; index < coms.length; index++) {
                        const element = coms[index];
                        if(element.isMyBaseView){
                            element.openView(_d.data);
                            break;
                        }
                    }
                }
            }));
        } else {
            let owner = this.viewDic[url];
            let coms = owner._components;
            if(coms){
                for (let index = 0; index < coms.length; index++) {
                    const element = coms[index];
                    if(element.isMyBaseView){
                        element.openView(_d.data);
                        break;
                    }
                }
            }
        }
    }

    public closeView(viewName: string) {
        if (MyUtils.isNull(this.viewDic[viewName])) {
            return;
        }
        this.viewDic[viewName].destroy();
        this.viewDic[viewName] = null;
    }

    public hideView(viewName: string) {
        if (MyUtils.isNull(this.viewDic[viewName])) {
            return;
        }
        (this.viewDic[viewName] as Laya.View).visible = false;
    }

    public getView(viewName: string){
        let view = this.viewDic[viewName];
        if (!MyUtils.isNull(view)) {
            return view;
        }
        return null;
    }

}