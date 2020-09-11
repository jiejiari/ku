import { ui } from "../../../ui/layaMaxUI";
import UIProgress from "./UIProgress";
import BannerNode from "../ad/BannerNode";
import SceneMgr from "../../mgr3d/SceneMgr";
import SoundMgr from "../../mgrCommon/SoundMgr";
import UserData from "../../models/UserData";
import { SORTTYPE } from "../../models/ConfigData";
import GameMgr from "../../mgr3d/GameMgr";
import EventMgr from "../../mgrCommon/EventMgr";


export default class WuDian extends ui.WuDianUI{

    private _currentProgress : number = 0;
    private isClicking : boolean = true;
    private lastPoint : number = 0;
    private vindex : number = -1;
    private closeCb : Function = null;
    static canShow(){
        return Global.Data.isClick && Global.Data.canClick;
        // return true;
    }

    onOpened(cb){
        this.closeCb = cb;
    }


    onAwake(){
        this.width = Laya.stage.width;
        this.height = Laya.stage.height;
        // this.progress = this.progressUI.getComponent(UIProgress);

        // this.getChildByName('views').getChildByName('')

        (this.reward as Laya.Sprite).visible = false;
        this.btnClick.clickHandler = new Laya.Handler(this,this.onClickR);
        this.btnClose.clickHandler = new Laya.Handler(this,this.onClickGet);
        this.lastPoint = Math.random()*30 + 40;
        let self = this;
        Global.Event.on(GlobalEvent.API_ON_SHOW,()=>{
            console.log('已切出去，刷新广告')
            self.showReward();
        },this)
        // this.progress.progress = 0;
        this.setProgress(0);

        // var index=1;
        // if(GameDefine.curLevel <= GameDefine.maxLevel)
        // {
        //     index = GameDefine.curLevel
        // }
        // else
        // {
        //     if(GameDefine.curLevel % GameDefine.maxLevel ==0)
        //     {
        //         index = GameDefine.maxLevel;
        //     }
        //     else
        //     {
        //         index = GameDefine.curLevel % GameDefine.maxLevel;
        //     }
        // }
        // if(index % 2 ==0)
        // {
        //     this.gift.skin = "subpackage/qiang"+index+".png";
        //     // this.gift.x = 154;
        //     // this.gift.y = 82;
        //     this.tankeName.visible = false;
        // }else
        // {
        //     this.gift.skin = "subpackage/tank"+index+".png";
        //     this.gift.centerX = -180;
        //     // this.gift.y = 59;
        //     this.tankeName.visible = true;
        //     this.tankeName.text = GameDefine.tankeName[(index+1)/2-1];
        // }
        this.frameLoop(1,this,this.update);
        // this.hammer.rotation = -90;
        // this.vindex = index;
        
        // this.handRun();
        this.timerOnce(1,this,this.handRun);
    }
    handRun(){
        let dy = this.shou.y
        let self = this;
        Laya.Tween.to(this.shou,{y:dy-30},400,null,new Laya.Handler(this,function(){
            Laya.Tween.to(self.shou,{y:dy},400,null,new Laya.Handler(self,self.handRun))
        }))
    }

    onClickGet(){
        // GameDefine.curSeclet = this.vindex;
        // Laya.LocalStorage.setItem("curSeclet1",GameDefine.curSeclet+"");
        // GameDefine.jiesuoArr.push(this.vindex);
        // var str = GameDefine.jiesuoArr.join(",");
        // Laya.LocalStorage.setItem("jiesuoArr1",str);
        
        this.close();
    }

    showReward(){
        this.btnClick.visible = false;
        this.isClicking = false;
        SceneMgr.Instance.playerComp.push();
        SceneMgr.Instance.playerComp.playAnim("throw",false);

        Laya.timer.once(3000,this,()=>{
            this.close();
            // let data:any = {
            //     type:1,
            //     passNum:UserData.getLeveNum(),//当前的关卡数
            //     isGoldeggs: false,
            //     isPass:false,//是否通关
            //     gold:GameMgr.Instance.GameOverScore(),//计算当前路程可获得的金币,获得本关的金币数
            //     _type:SORTTYPE.LEVEL,//闯关模式
            // };
            // //cscs
            // EventMgr.instance.emit("openRewardView",data);
        })
        
        // let dan1 = this.egg.getChildByName('dan1');
        // let dan2 = this.egg.getChildByName('dan2');
        // Laya.Tween.to(dan1,{rotation:-60},500,Laya.Ease.backInOut);
        // Laya.Tween.to(dan2,{rotation:60},500,Laya.Ease.backInOut,new Laya.Handler(null,()=>{
        //     this.reward.visible = true;
        //     this.title.text = '恭喜阁下获得:';
        //     (this.getChildByName('view') as Laya.Sprite).visible = false;
        // }));

    }

    danDoudong(){
        // Laya.Tween.to(this.egg,{rotation:5},20,null,new Laya.Handler(null,()=>{
        //     Laya.Tween.to(this.egg,{rotation:-5},40,null,new Laya.Handler(null,()=>{
        //         Laya.Tween.to(this.egg,{rotation:0},20)
        //     }))
        // }))
    }

    onClickR(){
        SoundMgr.instance.playSound("button");
        // Laya.Tween.clearAll(this.hammer);
        // Laya.Tween.to(this.hammer,{rotation:-20},60,null,new Laya.Handler(this,()=>{
        //     this.danDoudong();
        //     Laya.Tween.to(this.hammer,{},10,null,new Laya.Handler(this,()=>{
        //         this.hammer.rotation = -90;
        //     }))
        // }))
        let v = this._currentProgress
        this._currentProgress += 12
        // this.progress.progress = this._currentProgress / 100
        this.setProgress(this._currentProgress/100);
        if(v < this.lastPoint && this._currentProgress > this.lastPoint){
            this.banner.getComponent(BannerNode).Show()
            this.timerOnce(2000,this,()=>{
                if(this.isClicking){
                    this.banner.getComponent(BannerNode).Hide()
                }
            })
        }
        if(this._currentProgress >= 100){
            this.showReward();
        }
    }

    onDestroy(){
        Global.Event.off(this)
        this.closeCb && this.closeCb();
    }

    update(){
        if(this.isClicking && this._currentProgress > 0){
            this._currentProgress -= 0.4;
            // this.progress.progress = this._currentProgress / 100
            this.setProgress(this._currentProgress/100);
        } else if(!this.isClicking){
            // this.guan1.rotation += 1
            // this.guan2.rotation -= 0.7
        }
    }
    setProgress(num:number)
    {
        this.bar.width = 600 * num;
    }
}