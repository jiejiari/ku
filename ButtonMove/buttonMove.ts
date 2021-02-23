import GameMgr, { GameStatus } from "../Game/GameMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class buttonMove extends cc.Component {


    @property(cc.Node)
    root:cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    private ctrl:cc.Node = null;
    private maxLength:number = 100;
    public isPress:boolean = false;
    //应用固定的摇杆
    private useFixed:boolean = true;
    private prePos:cc.Vec2 = null;
    onLoad () {

        this.ctrl = this.node.getChildByName("ctrl");
        this.root.on(cc.Node.EventType.TOUCH_START,this.mouseDown,this);
        this.root.on(cc.Node.EventType.TOUCH_MOVE,this.mouseMove,this);
        this.root.on(cc.Node.EventType.TOUCH_END,this.mouseUp,this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN,this.onKeyDown,this);
    }

    onEnable(){

    }

    start () {
    }

    update (dt) {

    }

    mouseDown(e:cc.Event.EventTouch)
    {
        // if(GameMgr.Instance.gameStatus != GameStatus.Play) return;
        this.isPress = true;
        let nodePos = this.node.parent.convertToNodeSpaceAR(e.getLocation());
        if(this.useFixed)
        {
            this.prePos = nodePos;
        }
        else{
            this.node.opacity = 255;
            this.node.setPosition(nodePos);
        }
    }
    mouseUp(e:cc.Event.EventTouch)
    {
        this.isPress = false;
        this.ctrl.setPosition(cc.v2());
        if(!this.useFixed)
        this.node.opacity = 0;
    }
    mouseMove(e:cc.Event.EventTouch)
    {
        // if(GameMgr.Instance.gameStatus != GameStatus.Play) return;
        if(this.isPress == false) return;
        // 数学坐标系
        let screenPos = e.getLocation();
        let nodePos = this.node.convertToNodeSpaceAR(screenPos);
        let length = nodePos.mag();
        if(this.useFixed)
        {
            nodePos = this.node.parent.convertToNodeSpaceAR(screenPos);
            //什么叫一举两得啊？（战术后仰）
            length = nodePos.subtract(this.prePos).mag();
        }
        if(length > this.maxLength)
        {
            let x = nodePos.x * this.maxLength / length;
            let y = nodePos.y * this.maxLength / length;
            this.ctrl.setPosition(x,y);
        }
        else{
            this.ctrl.setPosition(nodePos);
        }
    }
    onKeyDown(e:cc.Event.EventKeyboard)
    {
        if(e.keyCode == cc.macro.KEY.a)
        {
            GameMgr.Instance.uiGame.createBoss(cc.v2(300,0));
        }
        else if(e.keyCode == cc.macro.KEY.s)
        {
            // GameMgr.Instance.uiGame.cameraShake(100);
            GameMgr.Instance.player.boAnim();
        }
        else if(e.keyCode == cc.macro.KEY.f)
        {
            GameMgr.Instance.player.fade();
        }
        else if(e.keyCode == cc.macro.KEY.x)
        {
            GameMgr.Instance.uiGame.createPlane();
            // GameMgr.Instance.startAnim();
        }
        else if(e.keyCode == cc.macro.KEY.d)
        {
            if(cc.director.isPaused())
            cc.director.resume();
            else
            cc.director.pause();
        }
        else if(e.keyCode == cc.macro.KEY.c)
        {
            GameMgr.Instance.uiGame.createMan();
        }
    }
}
