import BaseView from "../../views/BaseView";
import EventMgr from "../../mgrCommon/EventMgr";
import UserData from "../../models/UserData";
import { SORTTYPE } from "../../models/ConfigData";
import GameMgr, { GameStatus } from "../../mgr3d/GameMgr";
import SceneMgr from "../../mgr3d/SceneMgr";

export default class Fuhuo extends BaseView{

    private btnAnchor: Laya.Image;
    // private btnShare: Laya.Image;
    private btnVideo: Laya.Image;
    private btnJump: Laya.Label;

    constructor() {
        super();
        
    }
    onAwake()
    {
        super.onAwake();
        this.btnAnchor = this.owner.getChildByName("btnAnchor") as Laya.Image;
        // this.btnShare = this.btnAnchor.getChildByName("shareBtn") as Laya.Image;
        this.btnVideo = this.btnAnchor.getChildByName("videoBtn") as Laya.Image;
        this.btnJump = this.btnAnchor.getChildByName("skipBtn") as Laya.Label;
    }

    addEvent() {
        // this.btnShare.on(Laya.Event.CLICK, this, this.shareClick);
        this.btnVideo.on(Laya.Event.CLICK, this, this.videoClick);
        this.btnJump.on(Laya.Event.CLICK, this, this.jumpClick);
        super.addEvent();
    }
    
    public removeEvent() {
        // this.btnShare.off(Laya.Event.CLICK, this, this.shareClick);
        this.btnVideo.off(Laya.Event.CLICK, this, this.videoClick);
        this.btnJump.off(Laya.Event.CLICK, this, this.jumpClick);
        super.removeEvent();
    }
    openView(data)
    {

    }
    videoClick()
    {
        //广告
        this.goFighting();
    }
    jumpClick()
    {
        //跳过
        //cs
        // this.goFighting();
        this.openOver();
    }
    goFighting()
    {
        EventMgr.instance.emit("openFighting",true);
    }
    openOver() {
        if(false)
        {
            this.openWuDianScene(false);
        }
        else{
            let data:any = {
                type:1,
                passNum:UserData.getLeveNum(),//当前的关卡数
                isGoldeggs: false,
                isPass:false,//是否通关
                gold:GameMgr.Instance.GameOverScore(),//计算当前路程可获得的金币,获得本关的金币数
                _type:SORTTYPE.LEVEL,//闯关模式
            };
            //cscs
            // EventMgr.instance.emit("openRewardView",data);
            Laya.Scene.open("AllFlows3.scene",null,()=>{
                EventMgr.instance.emit("openRewardView",data);
            });
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
            Laya.Scene.open("AllFlows3.scene",null,()=>{
                EventMgr.instance.emit("openRewardView",data);
            });
        });
        SceneMgr.Instance.mapComp.init(true);
        GameMgr.Instance.gameStatus = GameStatus.Execute;
    }


}