import PlatformMgr from "../mgrCommon/PlatformMgr";
import WXSubDomain from "../platform/wx/WXSubDomain";
import BaseView from "./BaseView";
import ConfigData, { OPERATINGTYPE, SORTTYPE } from "../models/ConfigData";
import EventMgr from "../mgrCommon/EventMgr";
import MathUtil from "../tools/MathUtil";
import { EventDefine } from "../mgrCommon/EventDefine";
import MyLog from "../tools/MyLog";
import UserData from "../models/UserData";
import MyUtils from "../tools/MyUtils";
import GameMgr, { GameStatus } from "../mgr3d/GameMgr";
import SceneMgr from "../mgr3d/SceneMgr";

export default class GameFighting extends BaseView {
    private surpassOther: Laya.WXOpenDataViewer;
    private provocationOther: Laya.WXOpenDataViewer;
    private finger: Laya.Image;
    private dragBeginnerGuide: Laya.Image;
    private touchBeginnerGuide: Laya.Image;
    private guideTop:Laya.Image;
    private fingerStartTime: number;
    //private score: Laya.FontClip;
    private progressNode: Laya.Image; //进度条的父节点
    private progress: Laya.Image; //进度条
    private currLevelLab: Laya.FontClip;
    private nextLevelLab: Laya.FontClip;
    private surpassOtherText: Laya.Label; //超越

    private coinNum: Laya.FontClip;//金币数目
    private myMoneyUnitClip: Laya.FontClip;//金币单位

    private ctrlRoot:Laya.Image;
    private ctrl:Laya.Image;
    // private pushButton:Laya.Button;
    private fnt_rest:Laya.FontClip;
    private lifeBar:Laya.Image;
    private armorBar:Laya.Image;
    private btn_up:Laya.Image;
    private lbl_up:Laya.Label;
    private lbl_max:Laya.Label;
    private songshou:Laya.Label;

    onAwake() {
        super.onAwake();

        this.dragBeginnerGuide = this.owner.getChildByName("dragBeginnerGuide") as Laya.Image;
        this.touchBeginnerGuide = this.owner.getChildByName("touchBeginnerGuide") as Laya.Image;
        this.finger = this.dragBeginnerGuide.getChildByName("finger") as Laya.Image;
        this.guideTop = this.dragBeginnerGuide.getChildByName("guideTop") as Laya.Image;
        this.guideTop.centerY -= this.offset.y / 2.5;

        //this.score = this.owner.getChildByName("scoreNum") as Laya.FontClip;
        this.progressNode = this.owner.getChildByName("progress") as Laya.Image;
        this.progress = this.progressNode.getChildByName("progress") as Laya.Image;
        
        this.progressNode.y += this.offset.y / 4;

        this.nextLevelLab = this.progressNode.getChildByName("nextLevelLab") as Laya.FontClip;
        this.currLevelLab = this.progressNode.getChildByName("currLevelLab") as Laya.FontClip;

        this.fnt_rest = this.owner.getChildByName("lifeNode").getChildByName("lbl_rest").getChildByName("num_rest") as Laya.FontClip;
        this.lifeBar = this.owner.getChildByName("lifeNode").getChildByName("progress") as Laya.Image;
        this.armorBar = this.owner.getChildByName("lifeNode").getChildByName("armer") as Laya.Image;
        this.btn_up = this.owner.getChildByName("lifeNode").getChildByName("upBtn") as Laya.Image;
        this.lbl_max = this.btn_up.getChildByName("max") as Laya.Label;
        this.lbl_up = this.btn_up.getChildByName("coinNum") as Laya.Label;
        this.songshou = this.owner.getChildByName("songshou") as Laya.Label;

        this.surpassOtherText = this.owner.getChildByName("surpassOtherText") as Laya.Label;

        this.surpassOtherText.visible = false;

        //this.score.visible = false;
        this.progressNode.visible = false;

        this.dragBeginnerGuide.visible = false;
        this.touchBeginnerGuide.visible = false;

        let goldBgImg = this.owner.getChildByName("goldBgImg") as Laya.Image;
        // MyUtils.autoScreenSize([goldBgImg]);
        this.coinNum =  goldBgImg.getChildByName("myMoneyClip") as  Laya.FontClip;
        this.myMoneyUnitClip = goldBgImg.getChildByName("myMoneyUnitClip") as  Laya.FontClip;
        this.InitMoney();

        this.ctrlRoot = this.owner.getChildByName("controlRoot") as Laya.Image;
        this.ctrl = this.ctrlRoot.getChildByName("control") as Laya.Image;
        this.ctrlRoot.visible = false;
        // this.pushButton = this.owner.getChildByName("pushButton") as Laya.Button;

        this.updateEmy(SceneMgr.Instance.mapComp.enemy_all);
    }

    private InitMoney(life?:number){
        // let result = MyUtils.scoreConversion(UserData.gold);
        // this.coinNum.value = result.value;
        // this.myMoneyUnitClip.visible = (result.isK!=null);
        // let imgname = ["T", "B", "M", "K"];
        // let vl = result.value.length*21;
        // if(result.isK){
        //     this.myMoneyUnitClip.value = imgname[result.isK];
        //     let tl = vl;
        //     vl += 2 + 35;
        //     this.myMoneyUnitClip.x = 118-vl/2+tl+2;
        // }
        // this.coinNum.x = 118-vl/2;

        this.coinNum.value = UserData.getMoney() + "";
        //
        if(UserData.getCrystal() < 10)
        {
            this.btn_up.visible = true;
            this.lbl_up.text = 400 + 200 * UserData.getCrystal() + "";
        }
        else{
            this.btn_up.visible = false;
        }
        if(life)
        this.updateLife(life);

    }

    private FigerAnim(): void {
        this.finger.x = 90 + 500 * Math.abs((Laya.timer.currTimer - this.fingerStartTime + 500) % 2000 - 1000) / 1000;
    }

    openView(revive?: boolean) {
        super.openView(revive);
        if (ConfigData.beginnerGuide == OPERATINGTYPE.TOUCH) {
            this.touchBeginnerGuide.visible = true;
        } else {
            this.dragBeginnerGuide.visible = true;
            this.fingerStartTime = Laya.timer.currTimer;
            Laya.timer.frameLoop(1, this, this.FigerAnim);
        }
        this.guideTop.visible = !revive;
        if(revive){
            GameMgr.Instance.GameRevive();
            SceneMgr.Instance.playerComp.revive();
        }
        Laya.stage.once(Laya.Event.MOUSE_DOWN,this,this.mouseTouchFun, [revive]);
    }

    mouseTouchFun(revive:boolean) {
        if(revive){
            //TODO:this.updataProgress(0);
        }
        else{
            // this.openProvocationOther(SORTTYPE.LEVEL);
            this.updataProgress(0);
            GameMgr.Instance.GameStart();
        }
        this.updateLevel(UserData.level);
        this.updateLife(1);
        this.updateArmor(0);
        this.dragBeginnerGuide.visible = false;
        this.touchBeginnerGuide.visible = false;
        //cs
        // this.progressNode.visible = true;
    }

    openResurgence() {
        EventMgr.instance.emit("openResurgence");
    }

    openGameOverLevel(pass:boolean) {

        //场景值屏蔽
        if(false)
        {
            this.openWuDianScene(pass);
        }
        else{
            let data:any = {
                type:1,
                passNum:UserData.level,//当前的关卡数
                isGoldeggs: false,
                isPass:pass,//是否通关
                gold:GameMgr.Instance.GameOverScore(),//计算当前路程可获得的金币,获得本关的金币数
                _type:SORTTYPE.LEVEL,//闯关模式
            };
            // EventMgr.instance.emit("openRewardView",data);
            Laya.Scene.open("AllFlows3.scene",null,()=>{
                EventMgr.instance.emit("openRewardView",data);
            });
        }
        
        //改成打开狂点
        //cscs
        // Laya.Scene.open("WuDian.scene");
        // SceneMgr.Instance.mapComp.kuangdian = true;
        // SceneMgr.Instance.mapComp.init();
        // GameMgr.Instance.gameStatus = GameStatus.Execute;
        
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

    public addEvent() {
        super.addEvent();
        Laya.stage.on(Laya.Event.MOUSE_DOWN,this,this.mouseDown);
        Laya.stage.on(Laya.Event.MOUSE_UP,this,this.mouseUp);
        Laya.stage.on(Laya.Event.MOUSE_MOVE,this,this.mouseMove);
        // this.pushButton.on(Laya.Event.CLICK,this,this.clickPushButton);
        
        this.btn_up.on(Laya.Event.CLICK,this,this.clickUp);
        EventMgr.instance.onEvent(EventDefine.SONGSHOU,this,this.showSongshou);
        EventMgr.instance.onEvent(EventDefine.EMY,this,this.updateEmy);
        EventMgr.instance.onEvent(EventDefine.LIFE,this,this.updateLife);
        EventMgr.instance.onEvent(EventDefine.ARMOR,this,this.updateArmor);
        EventMgr.instance.onEvent(EventDefine.PLAYER_DIE,this,this.PlayerDie);
        EventMgr.instance.onEvent(EventDefine.PLAYER_PASS,this,this.PassLevel);
    }

    public removeEvent() {
        super.removeEvent();
        Laya.stage.off(Laya.Event.MOUSE_DOWN,this,this.mouseDown);
        Laya.stage.off(Laya.Event.MOUSE_UP,this,this.mouseUp);
        Laya.stage.off(Laya.Event.MOUSE_MOVE,this,this.mouseMove);
        // this.pushButton.on(Laya.Event.CLICK,this,this.clickPushButton);
        this.btn_up.on(Laya.Event.CLICK,this,this.clickUp);
        EventMgr.instance.onOffEvent(EventDefine.SONGSHOU,this,this.showSongshou);
        EventMgr.instance.onOffEvent(EventDefine.EMY,this,this.updateEmy);
        EventMgr.instance.onOffEvent(EventDefine.LIFE,this,this.updateLife);
        EventMgr.instance.onOffEvent(EventDefine.ARMOR,this,this.updateArmor);
        EventMgr.instance.onOffEvent(EventDefine.PLAYER_DIE,this,this.PlayerDie);
        EventMgr.instance.onOffEvent(EventDefine.PLAYER_PASS,this,this.PassLevel);
    }
    mouseDown(e)
    {
        if(GameMgr.Instance.gameStatus != GameStatus.Execute) return;
        if(e.target.skin) return;
        this.ctrlRoot.pos(Laya.MouseManager.instance.mouseX,Laya.MouseManager.instance.mouseY);
        this.ctrlRoot.visible = true;
        this.originPos = (this.ctrlRoot.parent as Laya.Sprite).localToGlobal(new Laya.Point(this.ctrlRoot.x,this.ctrlRoot.y),true);
    }
    mouseUp()
    {
        this.ctrlRoot.visible = false;
        this.ctrl.pos(147,147);
    }
    private originPos:Laya.Point = new Laya.Point;
    mouseMove()
    {
        if(GameMgr.Instance.gameStatus != GameStatus.Execute) return;
        if(this.ctrlRoot.visible == false) return;
        let offX = Laya.MouseManager.instance.mouseX - this.originPos.x;
        let offY = Laya.MouseManager.instance.mouseY - this.originPos.y;
        let dis = Math.sqrt(offX * offX + offY * offY);
        if(dis < 100)
        {
            this.ctrl.pos(this.ctrlRoot.mouseX,this.ctrlRoot.mouseY);
        }
        else{
            let x = 140 * offX / dis;
            let y = 140 * offY / dis;
            this.ctrl.pos(147 + x,147 + y);
        }

    }
    PlayerDie():void{
        //MyLog.log("PlayerDie")
        //cscs
        // if(GameMgr.Instance.reviveCount < 3 && (ConfigData.ctrlInfo.isVideo || ConfigData.ctrlInfo.isShare)){
        //     this.openResurgence();
        // }
        // else{
        //     this.openGameOverLevel(false);
        // }
        this.openResurgence();
    }

    PassLevel(){
        this.openGameOverLevel(true);
    }

    addScore() {
        //EventMgr.instance.emit("updateScore");
    }

    updataScore() {
        //PlatformMgr.callSubDomainMethodByProxy("upSelfScore",this.score.value);
    }

    updataProgress(num: number) {
        // this.progress.width = 50 + MathUtil.Clamp01(num) * 400;
    }
    updateEmy(num: number)
    {
        this.fnt_rest.value = num + "";
    }
    showSongshou(visible:boolean)
    {
        this.songshou.visible = visible;
    }
    updateArmor(num:number)
    {
        this.armorBar.width = 200 * MathUtil.Clamp01(num);
    }
    updateLife(num:number)
    {
        this.lifeBar.width = 200 * MathUtil.Clamp01(num);
    }
    clickUp()
    {
        if(UserData.getMoney() >= 400 + 200 * UserData.getCrystal())
        {
            UserData.subMoney(400 + 200 * UserData.getCrystal());
            UserData.addCrystal(1);
            EventMgr.instance.emit(EventDefine.ADD_BLOOD,[this.InitMoney,this]);
        }
    }

    updateLevel(num: number) {
        this.currLevelLab.value = num.toString();
        this.nextLevelLab.value = (num + 1).toString();
    }

    //打开挑衅
    openProvocationOther(_type): void {  //正式使用
        this.closeSurpassOther();
        if (!this.provocationOther) {
            this.provocationOther = new Laya.WXOpenDataViewer();
            this.owner.addChild(this.provocationOther);
            this.provocationOther.width = 750;
            this.provocationOther.height = 62;
            this.provocationOther.pos(0, 252+this.offset.y/5);
        }
        PlatformMgr.callSubDomainMethodByProxy("setOpenView",this.provocationOther);
        PlatformMgr.callSubDomainMethodByProxy("openProvocationOther",{ _type: _type });
        Laya.timer.once(3000, this, ()=>{
            PlatformMgr.callSubDomainMethodByProxy("closeProvocationOther");
        });
    }

    closeProvocationOther(): void {
        if (this.provocationOther) {
            this.provocationOther.destroy();
            this.provocationOther = null;
        }
        PlatformMgr.callSubDomainMethodByProxy("closeProvocationOther");
    }

    //打开超越
    openSurpassOther(_type): void {
        _type = SORTTYPE.ENDLESS
        this.closeProvocationOther();
        if (!this.surpassOther) {
            this.surpassOther = new Laya.WXOpenDataViewer();
            this.owner.addChild(this.surpassOther);
            this.surpassOther.width = 60;
            this.surpassOther.height = 60;
            this.surpassOther.pos(570, 304);
        }
        this.surpassOtherText.visible = true;
        PlatformMgr.callSubDomainMethodByProxy("setOpenView",this.surpassOther);
        PlatformMgr.callSubDomainMethodByProxy("openSurpassOther",{
            _type: _type,
            val: -1
        });
    }

    closeSurpassOther(): void {
        this.surpassOtherText.visible = false;
        if (this.surpassOther) {
            this.surpassOther.destroy();
            this.surpassOther = null;
        }
        PlatformMgr.callSubDomainMethodByProxy("closeSurpassOther");
    }

    onDisable(): void {
        this.closeProvocationOther();
        this.closeSurpassOther();
        super.onDisable();
    }


}