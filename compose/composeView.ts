import { Enum } from "../Game/Enum";

const {ccclass,property} = cc._decorator;

@ccclass
export default class composeView extends cc.Component{

    @property(cc.Node)
    raw:cc.Node = null;
    @property(cc.Node)
    raw1:cc.Node = null;
    @property(cc.Node)
    new:cc.Node = null;
    @property(cc.Node)
    circle:cc.Node = null;
    @property(cc.Node)
    zhuandong:cc.Node = null;

    private newLv:number = 0;
    onLoad(){
        this.new.active = false;
    }

    setOptions(data:any)
    {
        this.raw.getComponent(cc.Sprite).spriteFrame = data.raw;
        this.raw1.getComponent(cc.Sprite).spriteFrame = data.raw;
        this.new.getComponent(cc.Sprite).spriteFrame = data.new;
        this.newLv = data.lv;
        Global.Audio.playSound("thunder");
        this.raw.runAction(cc.sequence(cc.delayTime(0.5),cc.moveTo(0.5,cc.v2(0,50)).easing(cc.easeCubicActionIn()),cc.destroySelf()));
        this.raw1.runAction(cc.sequence(cc.delayTime(0.5),cc.moveTo(0.5,cc.v2(0,50)).easing(cc.easeCubicActionIn()),cc.destroySelf()));
        this.scheduleOnce(()=>{
            this.new.active = true;
            this.circle.active = true;
            this.zhuandong.active = true;
            this.zhuandong.runAction(cc.repeatForever(cc.rotateBy(2,360)));
        },1);
    }

    update(dt:number){

    }

    onClickGet()
    {
        Global.Event.emit(Enum.EventType.MaxLv,this.newLv,this.new.getComponent(cc.Sprite).spriteFrame);
        this.node.destroy();
    }
}