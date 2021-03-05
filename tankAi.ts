

import Common from "../../module/Common";
import GameMgr, { GameStatus } from "../Manager/GameMgr";
import tankBase, { tankState } from "./tankBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class tankAi extends tankBase {

    // LIFE-CYCLE CALLBACKS:

    //朝向
    private toAngle:number;
    //目标
    private target:cc.Node = null;
    //放弃跟随的目标
    private giveUp:cc.Node = null;
    //准备移动
    private readyToMove:boolean = false;

    onLoad () {
        super.onLoad();
        // let sp = this.node.getComponent(cc.Sprite)
        // cc.loader.loadRes('Game/img/tanks/tank1',cc.SpriteFrame,function(err,res){
        //     sp.spriteFrame = res;
        // })
    }

    start () {

    }
    init()
    {
        this.tankType = Math.ceil(Math.random()*7);
        this.chooseSkin();
        super.init();
        this.state = tankState.Move;
        //cs
        // this.lookAtOneTank();
        this.getRandomAngle();
        this.schedule(this.behaviorTree,Math.random()*2+2);
    }

    behaviorTree()
    {
        if(this.sp_shield.active) return;
        this.state = tankState.Move;
        let random = Math.random();
        if(random < 0)
        {
            if(this.target && GameMgr.Instance.uiGame.node_tank.childrenCount > 2)
            this.giveUp = this.target;
            this.lookAtOneTank();
        }
        else{
            this.getRandomAngle();
        }
    }

    update (dt:number) {
        if(GameMgr.Instance.gameStatus != GameStatus.Play) return;
        if(this.state == tankState.Stop)
        {
            this.shieldFall(dt);
            this.buffTimeDown(dt);
            this.putTankInRange();
        }
        else if(this.state == tankState.Move)
        {
            this.shieldRecharge(dt);
            this.followTarget();
            this.move(dt);
            this.countDown(dt);
            this.fixAngle();
            this.buffTimeDown(dt);
            this.putTankInRange();
            // this.move(dt);
            // this.countDown(dt);
        }
        else if(this.state == tankState.Die)
        {

        }
    }
    move(dt:number)
    {
        //向前移动
        let movex = Math.cos((this.main_node.angle+90) * Math.PI / 180) * (this.moveSpeed + (this.buff_speed > 0 ? 50 : 0)) * dt + this.node.x;
        let movey = Math.sin((this.main_node.angle+90) * Math.PI / 180) * (this.moveSpeed + (this.buff_speed > 0 ? 50 : 0)) * dt + this.node.y;
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
    lookAtOneTank()
    {
        //找最近的tank
        let minDis = 1000000;
        let near:cc.Node = null;
        for(let i = 0;i < this.node_tank.childrenCount;i++)
        {
            let child = this.node_tank.children[i];
            if(this.node == child || this.giveUp == child) continue;
            let dis = cc.Vec2.distance(this.node.getPosition(),child.getPosition());
            if(dis < minDis)
            {
                minDis = dis;
                near = child;
            }
        }
        this.target = near;
        
    }
    //需要匀速转向
    followTarget()
    {
        if(!this.target || !this.target.isValid) return;
        // this.toward = cc.v2(near.x-this.node.x,near.y-this.node.y).signAngle(cc.v2(1,0));
        let toward = Common.getAngle(this.target.getPosition(),this.node.getPosition());
        //判断上一帧的朝向，如果相差很大就重新寻找target
        let toAngle = toward * 180 / Math.PI + 90;
        let delta = Math.abs(this.main_node.angle - toAngle);
        if(delta > 180) delta = 360 - delta;
        if(delta < 2)
        {
            //继续跟随
            this.toAngle = toAngle;
        }
        else if(delta > 170){
            this.giveUp = this.target;
            //重新寻找目标
            this.lookAtOneTank();
        }
        else{
            //
            this.toAngle = toAngle;
        }
    }
    fixAngle()
    {
        let lerpAngle = Common.lerp(this.main_node.angle,this.toAngle,0.05);
        this.main_node.angle = lerpAngle;
    }
    takeDamage(killer:tankBase,att:number)
    {
        super.takeDamage(killer,att);
        let random = Math.random();
        if(random < 0.2)
        {
            //开启护盾
            this.openShield();
        }
    }
    shieldFall(dt)
    {
        super.shieldFall(dt);
        if(this.armor_now == 0 && this.readyToMove == false)
        {
            this.readyToMove = true;
            //开启计时器
            this.scheduleOnce(()=>{
                this.behaviorTree();
                this.readyToMove = false;
            },Math.random()*0.5);
        }
    }

    getRandomAngle()
    {
        this.target = null;
        this.toAngle = Math.random() * 360;
    }

    die()
    {
        super.die();
        this.node.destroy();
    }

    chooseSkin()
    {
        super.chooseSkin();
        this.max_health += Math.floor(Math.random()*5);
        this.moveSpeed += 10 * Math.floor(Math.random()*5);
        this.att += 0.2 * Math.floor(Math.random()*5);
    }
    
}
