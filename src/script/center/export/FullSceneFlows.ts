import { ui } from "../../../ui/layaMaxUI";
import BannerNode from "../ad/BannerNode";
import EventMgr from "../../mgrCommon/EventMgr";
import UserData from "../../models/UserData";
import GameMgr from "../../mgr3d/GameMgr";
import { SORTTYPE } from "../../models/ConfigData";

export default class FullSceneFlows extends ui.AllFlows3UI{
    private clickCount : number = 0;
    private closeCb : Function = null;
    onAwake(){
        this.width = Laya.stage.width
        this.height = Laya.stage.height
        this.bgImg.height = Laya.stage.height
        this.btnClose.clickHandler = new Laya.Handler(this,this.onClickClose)
        this.btnClosejia.clickHandler = new Laya.Handler(this,this.onClickBack)
        this.btnClose.visible = false
        this.frameOnce(480,this,function(){
            this.btnClose.visible = true;
        })
    }
    onOpened(closecb : any){
        this.closeCb = closecb;
    }
    onClosed(){
        this.closeCb && this.closeCb();
    }
    onClickBack(){
        if(Global.Data.isCheck){
            this.close()
            return;
        }
        this.clickCount++;
        console.log('this.clickCount:',this.clickCount)
        if(this.clickCount == 3){
            this.getChildByName('banner').getComponent(BannerNode).Show();
            this.frameOnce(10,this,()=>{
                this.btnClose.visible = true;
                this.btnClosejia.visible = false;
            })
        }
    }
    onClickClose(){
        this.close()
    }
}