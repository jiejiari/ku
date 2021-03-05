
import Common from "../../module/Common";
import UserData from "../../script/UserData";
import GameMgr, { GameStatus } from "../Manager/GameMgr";
import tankBase, { tankState } from "./tankBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class tankMe extends tankBase {

    // LIFE-CYCLE CALLBACKS:

    private bar_armor:cc.Node;

    onLoad () {
        GameMgr.Instance.playerComp = this;
        super.onLoad();
        this.bar_armor = GameMgr.Instance.uiGame.node.getChildByName("node_front").getChildByName("node_progress").getChildByName("life");
        Global.Event.on("fire",this.shoot,this);
    }

    start () {

    }
    onDestroy()
    {
        Global.Event.removeAllListeners(this);
    }
    init()
    {
        this.tankType = UserData.curUsedItem + 1;
        this.chooseSkin();
        this.mapFollow();
        super.init();
    }

    update (dt:number) {
        if(GameMgr.Instance.gameStatus != GameStatus.Play) return;
        this.checkState();
        if(this.state == tankState.Stop)
        {
            this.shieldFall(dt);
            this.buffTimeDown(dt);
            this.putTankInRange();
            this.checkPass();
        }
        else if(this.state == tankState.Move)
        {
            this.shieldRecharge(dt);
            this.move(dt);
            this.mapFollow();
            // this.countDown(dt);
            this.buffTimeDown(dt);
            this.putTankInRange();
            this.checkPass();
        }
        else if(this.state == tankState.Die)
        {

        }
    }
    checkState()
    {
        if(GameMgr.Instance.uiGame.mag_control == 0)
        {
            this.state = tankState.Stop;
        }
        else{
            this.state = tankState.Move;
        }
    }

    move(dt:number)
    {
        this.main_node.angle = GameMgr.Instance.uiGame.angle_control - 90;
        //向前移动
        let movex = Math.cos(GameMgr.Instance.uiGame.angle_control * Math.PI / 180) * (this.moveSpeed + (this.buff_speed > 0 ? 50 : 0)) * dt + this.node.x;
        let movey = Math.sin(GameMgr.Instance.uiGame.angle_control * Math.PI / 180) * (this.moveSpeed + (this.buff_speed > 0 ? 50 : 0)) * dt + this.node.y;
        if(movex > GameMgr.Instance.mapComp.edge_right)
        movex = GameMgr.Instance.mapComp.edge_right;
        if(movex < GameMgr.Instance.mapComp.edge_left)
        movex = GameMgr.Instance.mapComp.edge_left;
        if(movey > GameMgr.Instance.mapComp.edge_up)
        movey = GameMgr.Instance.mapComp.edge_up;
        if(movey < GameMgr.Instance.mapComp.edge_down)
        movey = GameMgr.Instance.mapComp.edge_down;
        this.node.setPosition(movex,movey);
    }

    shoot()
    {
        console.log("fire");
        super.shoot();
        Global.Audio.playSound("fire");
    }

    shieldFall(dt:number)
    {
        super.shieldFall(dt);
        if(this.armor_now == 0)
        {
            this.sp_shield.active = false;
            return;
        }
        else{
            this.sp_shield.active = true;
        }
        this.setArmorBar(this.armor_now/this.armor);
    }
    shieldRecharge(dt:number)
    {
        super.shieldRecharge(dt);
        this.sp_shield.active = false;
        if(this.armor_now == this.armor) return;
        this.setArmorBar(this.armor_now/this.armor);
    }

    setArmorBar(percent:number)
    {
        this.bar_armor.width = Common.clamp01(percent) * 133;
    }
    
    mapFollow()
    {
        GameMgr.Instance.uiGame.node_follow.x = -this.node.x;
        GameMgr.Instance.uiGame.node_follow.y = -this.node.y;
    }

    die()
    {
        super.die();
        GameMgr.Instance.gameOver();
        // this.node.destroy();
        Global.UIMgr.pushWindow("Flows/AllFlows","AllFlows",()=>{
            Global.UIMgr.pushWindow("Flows/AllFlows2","AllFlows2",()=>{
                Global.UIMgr.pushWindow("Relive/relive");
            })
        });
        // Global.UIMgr.pushWindow("Relive/relive");
    }

    relive()
    {
        this.health = this.max_health;
        this.setLifeBar(1);
    }

    checkPass()
    {
        if(this.node_tank.childrenCount <= 1)
        {
            //游戏结束
            GameMgr.Instance.gameOver();
            Global.UIMgr.pushWindow("Flows/AllFlows","AllFlows",()=>{
                Global.UIMgr.pushWindow("Flows/AllFlows2","AllFlows2",()=>{
                    Global.UIMgr.pushWindow("Over/over");
                })
            });
            // Global.UIMgr.pushWindow("Over/over");
        }
    }

    chooseSkin()
    {
        super.chooseSkin();
        this.max_health += UserData.getUpgradeData()[UserData.curUsedItem].lifelv;
        this.moveSpeed += 10*UserData.getUpgradeData()[UserData.curUsedItem].speedlv;
        this.att += 0.2*UserData.getUpgradeData()[UserData.curUsedItem].firelv;
    }
    
}
