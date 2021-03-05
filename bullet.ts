import { Enum } from "../../script/Enum";
import GameMgr, { GameStatus } from "../Manager/GameMgr";
import { NodePoolMgr } from "../Manager/NodePoolMgr";
import tankBase from "./tankBase";


const {ccclass, property} = cc._decorator;

@ccclass
export default class bullet extends cc.Component {

    private moveSpeed:number = 1000;
    private damage:number = 1;
    private canHitSelf:boolean = false;
    private moveAngle:number;
    //飞行时间
    private flyTime:number = 0.5;
    private flyTime_now:number = 0;
    private owner:cc.Node;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {}

    init(name:cc.Node,angle:number,att:number)
    {
        this.owner = name;
        this.damage = att;
        this.moveAngle = angle;
    }
    recoverByPool()
    {
        this.flyTime_now = 0;
    }
    start () {

    }

    update (dt:number) {
        if(GameMgr.Instance.gameStatus != GameStatus.Play) return;
        let movex = Math.cos(this.moveAngle * Math.PI / 180) * this.moveSpeed * dt;
        let movey = Math.sin(this.moveAngle * Math.PI / 180) * this.moveSpeed * dt;
        this.node.setPosition(movex + this.node.x,movey + this.node.y);
        
        if(this.flyTime_now < this.flyTime)
        {
            this.flyTime_now += dt;
        }
        else{
            this.removeSelf();
        }
        this.bulletDetect();

    }
    removeSelf()
    {
        if(this.owner.isValid)
        {
            let comp = this.owner.getComponent(tankBase);
            NodePoolMgr.put("zidan" + comp.tankType,this.node);
            this.recoverByPool();
        }
        else{
            this.node.destroy();
        }
    }
    
    bulletDetect()
    {
        // 子弹可以攻击友方
        // if(this.canHitSelf)
        // {

        // }
        // if(this.owner == "tankMe")
        // {
        //     //攻击敌方
        // }
        // else{
        //     //攻击我方
        // }
        for(let i = 0;i < GameMgr.Instance.uiGame.node_tank.childrenCount;i++)
        {
            let child = GameMgr.Instance.uiGame.node_tank.children[i];
            // if(this.owner == child) continue;
            if(cc.Vec2.distance(this.node.getPosition(),child.getPosition()) < 65)
            {
                //击中
                let comp = child.getComponent(tankBase);
                if(comp.sp_shield.active)
                {
                    //反弹子弹
                    if(this.flyTime_now < 0.05)
                    {
                        this.removeSelf();
                    }
                    let eff:cc.Node = NodePoolMgr.get(Enum.ItemType.ETan1,GameMgr.Instance.uiGame.node_effect);
                    eff.setPosition(this.node.getPosition());
                    let clip = eff.getComponent(cc.Animation).getClips()[0].name;
                    eff.getComponent(cc.Animation).play(clip,0);
                    eff.getComponent(cc.Animation).scheduleOnce(()=>{
                        NodePoolMgr.put(Enum.ItemType.ETan1,eff);
                    },0.5);
                    this.flyTime_now = 0;
                    this.moveAngle += 180;
                    if(this.owner.name == "tankMe")
                    {
                        Global.Audio.playSound("fantan");
                    }
                }
                else{
                    let eff = NodePoolMgr.get(Enum.ItemType.ETan2,GameMgr.Instance.uiGame.node_effect);
                    eff.setPosition(this.node.getPosition());
                    let clip = eff.getComponent(cc.Animation).getClips()[0].name;
                    eff.getComponent(cc.Animation).play(clip,0);
                    eff.getComponent(cc.Animation).scheduleOnce(()=>{
                        NodePoolMgr.put(Enum.ItemType.ETan2,eff);
                    },0.5);

                    comp.takeDamage(this.owner.isValid ? this.owner.getComponent(tankBase) : null,this.damage);
                    this.removeSelf();
                }
            }
        }
    }
}
