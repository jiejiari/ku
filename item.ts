// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GameMgr, { GameStatus } from "../Manager/GameMgr";
import tankBase from "./tankBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class item extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    private itemName:string;

    onLoad () {}

    init(name:string)
    {
        this.itemName = name;
    }
    start () {

    }

    disDetect()
    {
        for(let i = 0; i < GameMgr.Instance.uiGame.node_tank.childrenCount;i++)
        {
            let child = GameMgr.Instance.uiGame.node_tank.children[i];
            let childComp = child.getComponent(tankBase);
            let dis = cc.Vec2.distance(this.node.getPosition(),child.getPosition());
            if(dis < 65)
            {
                //吃到道具
                if(this.itemName == "food")
                {
                    childComp.getFood(0.1);
                }
                else if(this.itemName == "item0")
                {
                    childComp.getAidKit();
                }
                else if(this.itemName == "item1")
                {
                    childComp.addBuff(1);
                }
                else if(this.itemName == "item2")
                {
                    childComp.addBuff(0);
                }
                this.node.destroy();
            }
        }
    }

    update (dt) {
        if(GameMgr.Instance.gameStatus != GameStatus.Play) return;
        this.disDetect();
    }
}
