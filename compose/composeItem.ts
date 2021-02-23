import UserData from "../../module/UserData";
import { Enum, GameConfig } from "../Game/Enum";

const {ccclass,property} = cc._decorator;

@ccclass
export default class composeItem extends cc.Component{

    @property(cc.Prefab)
    coinItem:cc.Prefab = null;

    private gridIndex:number = 0;
    private itemContent:cc.Node = null;
    private lbl_level:cc.Label = null;
    private icon:cc.Node = null;
    private level:number = 0;
    onLoad(){
        this.itemContent = this.node.parent;
        this.lbl_level = this.node.getChildByName("lbl_level").getComponent(cc.Label);
        this.icon = this.node.getChildByName("icon");
        this.icon.width = this.icon.height = 60;
    }
    init(index:number,lv:number,sp:cc.SpriteFrame)
    {
        this.gridIndex = index;
        this.level = lv;
        this.lbl_level.string = this.level.toString();
        this.icon.getComponent(cc.Sprite).spriteFrame = sp;
        this.node.on(cc.Node.EventType.TOUCH_START,this.itemTouchStart,this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE,this.itemTouchMove,this);
        this.node.on(cc.Node.EventType.TOUCH_END,this.itemTouchEnd,this);
    }
    start(){
        this.schedule(this.addMoneyByTimeCircle,3);
    }
    itemTouchStart(e:cc.Event.EventTouch)
    {
        for(let i = 0;i < this.itemContent.childrenCount;i++)
        {
            let child = this.itemContent.children[i];
            if(child == this.node) continue;
            let level = child.getComponent(composeItem).level;
            if(level == this.level)
            {
                let icon = child.getChildByName("blueFade");
                icon.runAction(cc.repeatForever(cc.sequence(cc.fadeIn(0.5),cc.fadeOut(0.5))));
            }
        }
    }
    itemTouchMove(e:cc.Event.EventTouch)
    {
        let pos = this.itemContent.convertToNodeSpaceAR(e.getLocation());
        let item:cc.Node = e.target;
        item.setPosition(pos);
        item.zIndex = 1;
    }
    
    itemTouchEnd(e:cc.Event.EventTouch)
    {
        for(let i = 0;i < this.itemContent.childrenCount;i++)
        {
            let child = this.itemContent.children[i];
            if(child == this.node) continue;
            child.getChildByName("blueFade").opacity = 0;
            child.getChildByName("blueFade").cleanup();
        }

        let item:cc.Node = e.target;
        let touchPos = this.itemContent.convertToNodeSpaceAR(e.getLocation());
        item.zIndex = 0;
        //也可以考虑rect
        for(let i = 0;i < 9;i++)
        {
            if(touchPos.x < GameConfig.composeItemPosData[i][0] + 50 && touchPos.x >= GameConfig.composeItemPosData[i][0] - 50)
            {
                if(touchPos.y < GameConfig.composeItemPosData[i][1] + 50 && touchPos.y >= GameConfig.composeItemPosData[i][1] - 50)
                {
                    let selfLv = item.getChildByName("lbl_level").getComponent(cc.Label).string;
                    //触点落在格子，判断格子内是否有物品
                    if(UserData.getComposeItemLevelData()[i] && i != this.gridIndex)
                    {
                        //判断自身和格子中物品的等级关系
                        let mac = this.getChildIndexByPos(cc.v2(GameConfig.composeItemPosData[i][0],GameConfig.composeItemPosData[i][1]));
                        let otherLv = this.itemContent.children[mac].getChildByName("lbl_level").getComponent(cc.Label).string;
                        if(otherLv == selfLv)
                        {
                            //合成
                            let newLv = parseInt(otherLv) + 1;
                            this.itemContent.children[mac].getChildByName("lbl_level").getComponent(cc.Label).string = newLv.toString();
                            let sp = this.itemContent.parent.getChildByName("partNode").children[newLv-1].getComponent(cc.Sprite).spriteFrame;
                            this.itemContent.children[mac].getChildByName("icon").getComponent(cc.Sprite).spriteFrame = sp;
                            this.itemContent.children[mac].getComponent(composeItem).level = newLv;
                            this.itemContent.children[mac].runAction(cc.sequence(cc.scaleTo(0.1,1.2),cc.scaleTo(0.1,1)));
                            item.destroy();
                            //保存等级数据
                            UserData.saveData();
                            //打开合成界面,判断是否是最高等级
                            if(UserData.getComposeItemLevelData().every(num=>num < newLv))
                            {
                                let rawSp = item.getChildByName("icon").getComponent(cc.Sprite).spriteFrame;
                                Global.UIMgr.pushWindow("Lobby/composeView","composeView",{raw:rawSp,new:sp,lv:newLv});
                            }
                            UserData.setComposeItemLevelData(this.gridIndex,0);
                            UserData.setComposeItemLevelData(i,newLv);
                            Global.Audio.playSound("compose");
                        }
                        else{
                            item.setPosition(cc.v2(GameConfig.composeItemPosData[this.gridIndex][0],GameConfig.composeItemPosData[this.gridIndex][1]));
                        }
                    }
                    //格子内没有物品
                    else{
                        let toPos = cc.v2(GameConfig.composeItemPosData[i][0],GameConfig.composeItemPosData[i][1]);
                        item.runAction(cc.moveTo(0.1,toPos));
                        UserData.setComposeItemLevelData(this.gridIndex,0);
                        UserData.setComposeItemLevelData(i,parseInt(selfLv));
                        this.gridIndex = i;
                    }
                    return;
                }
            }
        }
        if(touchPos.x > 145 - 97.5 && touchPos.x < 145 + 97.5 && touchPos.y < -280 + 31 && touchPos.y > -280 - 31)
        {
            //出售
            item.destroy();
            UserData.setComposeItemLevelData(this.gridIndex,0);
            UserData.addMoney(66 * Math.pow(this.level,2));
            UserData.saveData();
            Global.Event.emit(Enum.EventType.Money);
            Global.Event.emit(Enum.EventType.CoinAnim,"Lobby/img/coin",{inp:cc.v2(520,-280),top:cc.v2(210,310)});
            return;
        }
        item.setPosition(cc.v2(GameConfig.composeItemPosData[this.gridIndex][0],GameConfig.composeItemPosData[this.gridIndex][1]));
    }
    getChildIndexByPos(pos:cc.Vec2)
    {
        for(let i = 0; i < this.itemContent.childrenCount;i++)
        {
            let child = this.itemContent.children[i];
            if(Math.round(child.x) == pos.x && Math.round(child.y) == pos.y)
            {
                return i;
            }
        }
        return null;
    }

    addMoneyByTimeCircle()
    {
        let money = 15 * Math.pow(this.level,2);
        UserData.addMoney(money);
        UserData.saveData();
        let item = cc.instantiate(this.coinItem);
        item.parent = this.node;
        item.setPosition(cc.v2(0,50));
        item.active = true;
        item.getChildByName("num").getComponent(cc.Label).string = "+" + money;
        item.runAction(cc.sequence(cc.spawn(cc.moveBy(0.5,cc.v2(0,50)),cc.fadeOut(0.5)),cc.destroySelf()));
        this.icon.runAction(cc.sequence(cc.scaleTo(0.2,1.2),cc.scaleTo(0.2,1)));
        Global.Event.emit(Enum.EventType.Money);
    }
}