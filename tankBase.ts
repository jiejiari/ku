import Common from "../../module/Common";
import { Config } from "../../script/Config";
import { Enum } from "../../script/Enum";
import GameMgr from "../Manager/GameMgr";
import { NodePoolMgr } from "../Manager/NodePoolMgr";
import bullet from "./bullet";


const {ccclass, property} = cc._decorator;

export enum tankState{
    Stop,
    Move,
    Die,
}

@ccclass
export default class tankBase extends cc.Component {


    //血量
    protected health:number = 10;
    protected max_health:number = 10;
    //护甲
    protected armor:number = 100;
    protected armor_now:number = 100;
    //移动速度
    protected moveSpeed:number = 1;
    //攻击间隔
    protected shootCD:number = 0.3;
    //当前间隔
    protected shootCD_now:number = 0.3;
    //攻击力
    protected att:number = 1;
    //状态
    protected state:tankState;
    //坦克类型
    public tankType:number = 1;
    // LIFE-CYCLE CALLBACKS:
    //buff状态
    protected buff_threeline:number = 10;
    protected buff_speed:number = 10;

    protected main_node:cc.Node;

    protected zidan1:cc.Node;
    protected zidan2:cc.Node;
    protected zidan3:cc.Node;
    protected zidan4:cc.Node;
    protected zidan5:cc.Node;
    protected zidan6:cc.Node;
    protected zidan7:cc.Node;
    protected food:cc.Node;
    protected item0:cc.Node;
    protected item1:cc.Node;
    protected item2:cc.Node;
    protected node_tank:cc.Node;
    
    protected bar_life:cc.Node;
    public sp_shield:cc.Node;
    public sp_chongfeng:cc.Node;
    onLoad () {
        this.main_node = this.node.getChildByName("main_node");
        let top_node = this.node.getChildByName("top_node");
        this.bar_life = top_node.getChildByName("bg_life").getChildByName("bar_life");
        this.sp_shield = top_node.getChildByName("sp_shield");
        this.sp_shield.active = false;
        this.sp_chongfeng = this.main_node.getChildByName("chongfeng");
        this.sp_chongfeng.active = false;
        this.zidan1 = GameMgr.Instance.uiGame.zidan1;
        this.zidan2 = GameMgr.Instance.uiGame.zidan2;
        this.zidan3 = GameMgr.Instance.uiGame.zidan3;
        this.zidan4 = GameMgr.Instance.uiGame.zidan4;
        this.zidan5 = GameMgr.Instance.uiGame.zidan5;
        this.zidan6 = GameMgr.Instance.uiGame.zidan6;
        this.zidan7 = GameMgr.Instance.uiGame.zidan7;
        this.food = GameMgr.Instance.uiGame.food;
        this.item0 = GameMgr.Instance.uiGame.item0;
        this.item1 = GameMgr.Instance.uiGame.item1;
        this.item2 = GameMgr.Instance.uiGame.item2;
        this.node_tank = GameMgr.Instance.uiGame.node_tank;
    }

    start () {

    }
    init()
    {
        this.health = this.max_health;
        this.setLifeBar(1);
        this.resetBuffTime();
    }

    update (dt:number) {
        
    }

    countDown(dt:number)
    {
        if(this.shootCD_now > 0)
        {
            this.shootCD_now -= dt;
        }
        else{
            this.shootCD_now = this.shootCD;
            this.shoot();
        }
    }
    shoot()
    {
        // let one = cc.instantiate(this.bullet);
        // one.parent = GameMgr.Instance.uiGame.node_bullet;
        //需要预加载
        for(let i = 0 ; i < 3;i++)
        {
            if(i == 0 && this.buff_threeline <= 0)continue;
            if(i == 2 && this.buff_threeline <= 0)continue;
            let one = NodePoolMgr.get("zidan" + this.tankType,GameMgr.Instance.uiGame.node_bullet);
            let x = Math.cos((this.main_node.angle+90) * Math.PI / 180) * 100;
            let y = Math.sin((this.main_node.angle+90) * Math.PI / 180) * 100;
            one.setPosition(x + this.node.x,y + this.node.y);
            one.angle = this.main_node.angle + 15 * (i-1);
            let comp = one.getComponent(bullet) || one.addComponent(bullet);
            comp.init(this.node,this.main_node.angle+ 90 + 15 * (i-1),this.att);
        }
        
    }
    move(dt:number)
    {
        //
    }

    openShield()
    {
        this.state = tankState.Stop;
        this.sp_shield.active = true;
    }
    
    shieldFall(dt:number)
    {
        if(this.armor_now > 0)
        {
            this.armor_now -= dt * 40;
        }
        else{
            this.armor_now = 0;
            this.sp_shield.active = false;
        }
    }
    shieldRecharge(dt:number)
    {
        if(this.armor_now < this.armor)
        {
            this.armor_now += dt * 100;
        }
        else{
            this.armor_now = this.armor;
        }
    }

    takeDamage(killer:tankBase,att:number)
    {
        this.health -= att;
        this.setLifeBar(this.health/this.max_health);
        if(this.health < 0)
        {
            //有可能击杀者已经死了,也有可能是自杀
            //还是有bug
            if(killer && killer != this)
            {
                if(killer.enabledInHierarchy)
                killer.getFood(0.15);
                //如果是我杀的且不是自杀
                if(killer.node.name == "tankMe")
                GameMgr.Instance.killed++;
            }
            GameMgr.Instance.rank--;
            this.die();
        }
    }
    //道具
    getFood(percent:number)
    {
        this.health += percent * this.max_health;
        if(this.health > this.max_health)
        this.health = this.max_health;
        this.setLifeBar(this.health/this.max_health);
    }
    getAidKit()
    {
        this.health = this.max_health;
        this.setLifeBar(1);
    }
    addBuff(type:number)
    {
        if(type == 0)
        {
            this.buff_threeline = 10;
        }
        else {
            this.buff_speed = 10;
        }
    }
    buffTimeDown(dt:number)
    {
        if(this.buff_threeline > 0)
        this.buff_threeline -= dt;
        if(this.buff_speed > 0)
        {
            this.buff_speed -= dt;
            this.sp_chongfeng.active = true;
        }
        else{
            this.buff_speed = 0;
            this.sp_chongfeng.active = false;
        }
    }
    resetBuffTime()
    {
        this.buff_speed = 0;
        this.buff_threeline = 0;
    }
    setLifeBar(percent:number)
    {
        this.bar_life.width = 130 * Common.clamp01(percent);
    }

    putTankInRange()
    {
        if(this.node.x > GameMgr.Instance.mapComp.edge_right)
        this.node.x = GameMgr.Instance.mapComp.edge_right;
        if(this.node.x < GameMgr.Instance.mapComp.edge_left)
        this.node.x = GameMgr.Instance.mapComp.edge_left;
        if(this.node.y > GameMgr.Instance.mapComp.edge_up)
        this.node.y = GameMgr.Instance.mapComp.edge_up;
        if(this.node.y < GameMgr.Instance.mapComp.edge_down)
        this.node.y = GameMgr.Instance.mapComp.edge_down;
    }

    die()
    {
        this.state = tankState.Die;
    }

    //index从1开始
    chooseSkin()
    {
        if(this.tankType > 7 || this.tankType < 1) return;
        for(let i = 0;i < 7;i++)
        {
            let child = this.main_node.children[i];
            if(this.tankType == i+1)
            {
                child.active = true;
            }
            else{
                child.active = false;
            }
        }

        this.max_health = Config.skinData[this.tankType-1].hp + 10;
        this.moveSpeed = Config.skinData[this.tankType-1].speed * 10 + 200;
        this.att = Config.skinData[this.tankType-1].fire * 0.2 + 1;
    }
    
}
