import Common from "../../module/Common";
import { Enum } from "../../script/Enum";
import game from "../Game/game";
import item from "../Game/item";
import tankAi from "../Game/tankAi";
import tankBase from "../Game/tankBase";
import tankMe from "../Game/tankMe";
import GameMgr, { GameStatus } from "./GameMgr";
import { NodePoolMgr } from "./NodePoolMgr";


const {ccclass, property} = cc._decorator;

@ccclass
export default class MapManager extends cc.Component {

    // @property(cc.Prefab)
    // tankMe:cc.Prefab = null;
    // @property(cc.Prefab)
    // tankAi:cc.Prefab = null;

    //边界
    public edge_up:number = 1850;
    public edge_down:number = -1850;
    public edge_left:number = -1150;
    public edge_right:number = 1150;

    //敌人总数
    public tankAll:number = 20;


    onLoad () {
        GameMgr.Instance.mapComp = this;
    }
    
    start () {

    }

    init(level:number)
    {
        GameMgr.Instance.uiGame.node_bullet.destroyAllChildren();
        GameMgr.Instance.uiGame.node_effect.destroyAllChildren();
        GameMgr.Instance.uiGame.node_food.destroyAllChildren();
        GameMgr.Instance.uiGame.node_tank.destroyAllChildren();
        this.createPlayer();
        this.createAi(this.tankAll);
        this.createMap();
    }

    createPlayer()
    {
        let player = cc.instantiate(GameMgr.Instance.uiGame.tankMe);
        player.parent = GameMgr.Instance.uiGame.node_tank;
        player.setPosition(cc.v2());
        let comp = player.getComponent(tankMe);
        comp.init();
    }

    createAi(num:number)
    {
        for(let i = 0; i < num;i++)
        {
            let Ai = cc.instantiate(GameMgr.Instance.uiGame.tankAi);
            Ai.parent = GameMgr.Instance.uiGame.node_tank;
            Ai.setPosition(cc.v2(Common.getRandom(this.edge_left,this.edge_right),Common.getRandom(this.edge_down,this.edge_up)));
            // Ai.setPosition(-500,500);
            let comp = Ai.getComponent(tankAi);
            comp.init();
        }
    }

    createMap()
    {
        //食物
        for(let i = 0; i < 50;i++)
        {
            let food = cc.instantiate(GameMgr.Instance.uiGame.food);
            food.parent = GameMgr.Instance.uiGame.node_food;
            food.setPosition(Common.getRandomV2ByArea(this.edge_up,this.edge_down,this.edge_left,this.edge_right));
            food.color = cc.color(Math.random()*255,Math.random()*255,Math.random()*255);
            let comp = food.addComponent(item);
            comp.init("food");
        }
        //道具
        for(let i = 0; i < 10;i++)
        {
            let random = Math.random();
            let daojv:cc.Node = null;
            if(random < 0.3)
            {
                daojv = cc.instantiate(GameMgr.Instance.uiGame.item0);
            }
            else if(random < 0.6)
            {
                daojv = cc.instantiate(GameMgr.Instance.uiGame.item1);
            }
            else {
                daojv = cc.instantiate(GameMgr.Instance.uiGame.item2);
            }
            daojv.parent = GameMgr.Instance.uiGame.node_food;
            daojv.setPosition(Common.getRandomV2ByArea(this.edge_up,this.edge_down,this.edge_left,this.edge_right));
            let itemComp = daojv.addComponent(item);
            itemComp.init(daojv.name);

        }
    }

    update(dt:number)
    {
        if(GameMgr.Instance.gameStatus != GameStatus.Play) return;
        this.realTimeResize();
    }

    realTimeResize()
    {
        this.edge_up = GameMgr.Instance.uiGame.wall_up.y - 100;
        this.edge_down = -this.edge_up;
        this.edge_right = GameMgr.Instance.uiGame.wall_right.x - 100;
        this.edge_left = -this.edge_right;
    }
}
