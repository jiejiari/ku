
import BannerNode from "../../module/ui/BannerNode";
import buttonMove from "../../script/buttonMove";
import { Enum } from "../../script/Enum";
import GameMgr from "../Manager/GameMgr";
import { NodePoolMgr } from "../Manager/NodePoolMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class game extends cc.Component {


    @property(cc.Prefab)
    eTan1:cc.Prefab = null;
    @property(cc.Prefab)
    eTan2:cc.Prefab = null;
    @property(cc.Prefab)
    tankAi:cc.Prefab = null;
    @property(cc.Prefab)
    tankMe:cc.Prefab = null;
    @property(cc.Node)
    banner:cc.Node = null;
    // LIFE-CYCLE CALLBACKS:
    public angle_control:number = 0;
    public mag_control:number = 0;
    public ctrl:cc.Node;
    public node_follow:cc.Node;
    public node_tank:cc.Node;
    public node_bullet:cc.Node;
    public node_effect:cc.Node;
    public node_food:cc.Node;
    public buttonComp:buttonMove;
    public zidan1:cc.Node;
    public zidan2:cc.Node;
    public zidan3:cc.Node;
    public zidan4:cc.Node;
    public zidan5:cc.Node;
    public zidan6:cc.Node;
    public zidan7:cc.Node;
    public food:cc.Node;
    public item0:cc.Node;
    public item1:cc.Node;
    public item2:cc.Node;
    //墙体
    public wall_up:cc.Node;
    public wall_down:cc.Node;
    public wall_left:cc.Node;
    public wall_right:cc.Node;
    //警告
    public sp_suoquan:cc.Node;
    //缩圈计时器
    public resizeTime:number = 0;
    public mapResizeArr:number[][] = [[2420,3980],[1820,2980],[1280,1980],[680,980]];

    public lbl_kill:cc.Label;

    onLoad () {
        GameMgr.Instance.uiGame = this;
        let node_control = this.node.getChildByName("node_front").getChildByName("node_control");
        this.ctrl = node_control.getChildByName("ctrl");
        this.buttonComp = node_control.getComponent(buttonMove);
        this.node_follow = this.node.getChildByName("follow_node");
        this.node_tank = this.node_follow.getChildByName("node_tank");
        this.node_bullet = this.node_follow.getChildByName("node_bullet");
        this.node_effect = this.node_follow.getChildByName("node_effect");
        this.node_food = this.node_follow.getChildByName("node_food");

        let widget = this.node_follow.getChildByName("bg_node").getChildByName("node_widget");
        this.wall_up = widget.getChildByName("road_up");
        this.wall_down = widget.getChildByName("road_down");
        this.wall_left = widget.getChildByName("road_left");
        this.wall_right = widget.getChildByName("road_right");
        let items = this.node.getChildByName("node_front").getChildByName("items");
        this.zidan1 = items.getChildByName("zidan1");
        this.zidan2 = items.getChildByName("zidan2");
        this.zidan3 = items.getChildByName("zidan3");
        this.zidan4 = items.getChildByName("zidan4");
        this.zidan5 = items.getChildByName("zidan5");
        this.zidan6 = items.getChildByName("zidan6");
        this.zidan7 = items.getChildByName("zidan7");
        this.food = items.getChildByName("food");
        this.item0 = items.getChildByName("item0");
        this.item1 = items.getChildByName("item1");
        this.item2 = items.getChildByName("item2");

        this.sp_suoquan = this.node.getChildByName("node_front").getChildByName("sp_suoquan");
        this.lbl_kill = this.node.getChildByName("node_front").getChildByName("lbl_kill").getComponent(cc.Label);
    }

    start () {
        NodePoolMgr.preload(Enum.ItemType.Zidan1,this.zidan1);
        NodePoolMgr.preload(Enum.ItemType.Zidan2,this.zidan2);
        NodePoolMgr.preload(Enum.ItemType.Zidan3,this.zidan3);
        NodePoolMgr.preload(Enum.ItemType.Zidan4,this.zidan4);
        NodePoolMgr.preload(Enum.ItemType.Zidan5,this.zidan5);
        NodePoolMgr.preload(Enum.ItemType.Zidan6,this.zidan6);
        NodePoolMgr.preload(Enum.ItemType.Zidan7,this.zidan7);
        NodePoolMgr.preload(Enum.ItemType.ETan1,this.eTan1);
        NodePoolMgr.preload(Enum.ItemType.ETan2,this.eTan2);
    }

    init()
    {
        this.unscheduleAllCallbacks();
        this.resizeTime = 0;
        this.resizeMapImmediately();
        this.schedule(this.showWarning,20,2);
        // cc.director.getScheduler().schedule(this.showWarning,this,20,2,0,false);
    }


    update (dt) {
        this.calcAngle();
        this.lbl_kill.string = "击杀数：" + GameMgr.Instance.killed;
    }

    calcAngle()
    {
        let ridian = Math.atan2(this.ctrl.y,this.ctrl.x);
        let angle = ridian *180 / Math.PI;
        this.angle_control = angle;
        this.mag_control = this.ctrl.getPosition().mag();
    }

    showWarning()
    {
        if(this.resizeTime > 3) return;
        this.sp_suoquan.runAction(cc.repeat(cc.sequence(cc.fadeIn(0.5),cc.fadeOut(0.5)),2));
        Global.Audio.playSound("jinggao");
        this.scheduleOnce(this.resizeMap,5);
    }

    //地图缩小
    //初始参数：80，3980，2420，80
    resizeMap()
    {
        if(this.resizeTime > 3) return;
        this.resizeTime++;
        let width = this.mapResizeArr[this.resizeTime][0];
        let height = this.mapResizeArr[this.resizeTime][1];
        cc.tween(this.wall_up).to(1,{y:height/2,width:width}).start();
        cc.tween(this.wall_down).to(1,{y:-height/2,width:width}).start();
        cc.tween(this.wall_left).to(1,{x:-width/2,height:height}).start();
        cc.tween(this.wall_right).to(1,{x:width/2,height:height}).start();
    }

    resizeMapImmediately()
    {
        this.wall_up.y = 1950;
        this.wall_up.width = 2420;
        this.wall_down.y = -1950;
        this.wall_down.width = 2420;
        this.wall_left.x = -1250;
        this.wall_left.height = 3980;
        this.wall_right.x = 1250;
        this.wall_right.height = 3980;
        GameMgr.Instance.mapComp.realTimeResize();
    }

    //外部调用
    pauseTimer()
    {
        this.unscheduleAllCallbacks();
    }
    resumeTimer()
    {
        let time = 2-this.resizeTime;
        console.log("shengyu",time);
        if(time < 0)return;
        this.schedule(this.showWarning,20,time);
    }

    onClickHowToPlay()
    {
        GameMgr.Instance.gamePause();
        Global.UIMgr.pushWindow("HowToPlay/howToPlay");
    }

    onClickFire()
    {
        Global.Event.emit('fire');
        //随机弹banner
        if(Global.Data.isCheck) return;
        if(Math.random() < 0.1)
        {
            this.banner.getComponent(BannerNode).Show();
            this.scheduleOnce(()=>{
                this.banner.getComponent(BannerNode).Hide();
            },2);
        }
    }
    
}
