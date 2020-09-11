import { ui } from "../../../ui/layaMaxUI";
import UserData from "../../models/UserData";
import AdsMgrDating from "../ad/AdsMgrDating";
import EventMgr from "../../mgrCommon/EventMgr";
import GameMgr from "../../mgr3d/GameMgr";
import { SORTTYPE } from "../../models/ConfigData";

export default class AllFlow2 extends ui.AllFlows1UI{
    private clickCount : number = 0;
    private closeCb : Function = null;
    onAwake(){
        this.width = Laya.stage.width
        this.height = Laya.stage.height
        this.bgImg.height = Laya.stage.height
        this.btnClose.clickHandler = new Laya.Handler(this,this.onClickClose)
        this.btnClosejia.on(Laya.Event.CLICK,this,this.onClickClose)
        // this.btnBack.clickHandler = new Laya.Handler(this,this.onClickBack)
        // this.btnClose.visible = false
        // this.frameOnce(480,this,function(){
        //     this.btnClose.visible = true;
        // })
        // if(Global.Data.isCheck == false){
        //     AdsMgr.showBanerAd("adunit-f86356d51b9b9422")
        // }
    }
    onOpened(closecb : any){
        this.closeCb = closecb;
    }
    onDestroy(){
        this.closeCb && this.closeCb();
    }
    onClickBack(){
        // if(Global.Data.isCheck){
        //     this.close()
        //     return;
        // }
        // this.clickCount++;
        // console.log('this.clickCount:',this.clickCount)
        // if(this.clickCount == 1){
            // this.getChildByName('banner').getComponent(BannerNode).Show();
            // this.frameOnce(10,this,()=>{
            //     this.btnClose.visible = true;
                // this.btnBack.visible = false;
            // })
        // }
    }
    onClickClose(){
        // if(Global.Data.isCheck == false){
        //     AdsMgr.hideBannerAd();
        // }
        if(UserData.isClickMore)
        {
            // AdsMgrDating.showBanerAd();
            UserData.isClickMore = false;
        }
        //cscs
        // Laya.Scene.open("scenes/GetWanju.scene");
        let data:any = {
            type:1,
            passNum:UserData.level,//当前的关卡数
            isGoldeggs: false,
            isPass:false,//是否通关
            gold:GameMgr.Instance.GameOverScore(),//计算当前路程可获得的金币,获得本关的金币数
            _type:SORTTYPE.LEVEL,//闯关模式
        };
        // EventMgr.instance.emit("openRewardView",data);
        this.close()
    }
}