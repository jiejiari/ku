import Player from "../center/Player";
import GameMgr, { GameStatus } from "./GameMgr";
import SceneMgr from "./SceneMgr";
import Enemy from "../center/Enemy";
import EventMgr from "../mgrCommon/EventMgr";
import { EventDefine } from "../mgrCommon/EventDefine";
import Item, { ItemState } from "../center/item";
import UserData from "../models/UserData";
import SoundMgr from "../mgrCommon/SoundMgr";
import MathUtil from "../tools/MathUtil";

export default class MapManager extends Laya.Script {

    private obj:Laya.Sprite3D;
    public isPress:boolean = false;
    private originalPos:Laya.Vector2 = new Laya.Vector2;
    private maxSpeed:number = 20;
    public usedLevel:number = 1;
    private maxLevel:number = 20;
    public coinInLevel:number = 0;

    //是否移动
    public isMove:boolean = false;
    //场上所有敌人数量
    public enemy_all:number = 0;
    public moveX:number;
    public moveY:number;
    
    //图片父物体
    public gamePic:Laya.Image;
    //箭头实例
    public arrowPrefab:Laya.Prefab;
    public arraowJson:string = "prefab/img_position.json";

    public kuangdian:boolean = false;
    constructor() { super(); }
    
    onAwake()
    {
        this.obj = this.owner as Laya.Sprite3D;
        this.gamePic = new Laya.Image();
        Laya.stage.addChild(this.gamePic);
        Laya.loader.load(this.arraowJson,Laya.Handler.create(this,this.getArrow),null,Laya.Loader.PREFAB);
    }
    //启动
    init(kuangdian:boolean)
    {
		SoundMgr.instance.playBGM();
        SceneMgr.Instance.playerComp.init();
        SceneMgr.Instance.cameraComp.init();
        SceneMgr.Instance.princessComp.playAnim("help",false);
        this.obj.destroyChildren();
        this.gamePic.destroyChildren();

        this.kuangdian = kuangdian;
        if(this.kuangdian)
        {
            // SceneMgr.Instance.tank.active = true;
            let two = Laya.Sprite3D.instantiate(SceneMgr.Instance.tank,SceneMgr.Instance.mainScene);
            two.active = true;
            let c:Item = two.getComponent(Item) || two.addComponent(Item);
            c.kuangdianInit();
            SceneMgr.Instance.playerComp.grab(two,false,null,true);
            c.state = ItemState.inHand;
            // SceneMgr.Instance.emy.active = true;
            let one = Laya.Sprite3D.instantiate(SceneMgr.Instance.emy,SceneMgr.Instance.mainScene);
            one.active = true;
            let d:Enemy = one.getComponent(Enemy) || one.addComponent(Enemy);
            d.kuangdianInit();
            return;
        }
        else{
            this.coinInLevel = 0;
            SceneMgr.Instance.tank.active = false;
        }
        this.usedLevel = UserData.getLeveNum();
        if(UserData.getLeveNum() > this.maxLevel)
        {
            this.usedLevel = Math.ceil(Math.random()*this.maxLevel);
            console.log("随机关卡："+this.usedLevel);
        }
        //cscscs
        // this.usedLevel = 6;
        console.log("激活关卡："+this.usedLevel);
        this.activeLevel();
        // let lvMap = SceneMgr.Instance.mainScene.getChildByName("level").getChildByName("level"+this.usedLevel) as Laya.Sprite3D;
        // let node = lvMap.getChildByName("enemypos") as Laya.Sprite3D;
        this.createEmy();
        // node = lvMap.getChildByName("itempos") as Laya.Sprite3D;
        this.createItem();
        // node = lvMap.getChildByName("treepos") as Laya.Sprite3D;
        // this.createTree(node);
        this.activeDestination(false);
        // GameMgr.Instance.gameStatus = GameStatus.Execute;
    }
    onEnable(): void {
        
    }

    onDisable(): void {

    }
    getArrow(res:Laya.Prefab)
    {
        this.arrowPrefab = res;
    }
    
    createArrow()
    {
        if(this.arrowPrefab == null) return;
        let one = Laya.Pool.getItemByCreateFun(ModelType.arrow,this.arrowPrefab.create,this.arrowPrefab) as Laya.Image;
        this.gamePic.addChild(one);
        // one.visible = false;
        return one;
    }
    
    onUpdate()
    {
        if(GameMgr.Instance.gameStatus != GameStatus.Execute) return;
        // this.mouseMove();
    }
    onStageMouseDown(e:Laya.Event)
    {
        if(GameMgr.Instance.gameStatus != GameStatus.Execute) return;
        if(e.target.texture) return;
        this.isPress = true;
        this.originalPos.x = e.stageX;
        this.originalPos.y = e.stageY;
    }
    mouseMove()
    {
        if(this.isPress)
        {
            let offX = Laya.MouseManager.instance.mouseX - this.originalPos.x;
            let offY = Laya.MouseManager.instance.mouseY - this.originalPos.y;
            //求移动方向
            let square = offX * offX + offY * offY;
            //取反修改为常规直角坐标系
            let ridian = Math.atan2(-offY,-offX);
            //如果角度为负则加上360
            let angle = ridian > 0 ? ridian * 180 / Math.PI : (ridian + 2 * Math.PI) * 180 / Math.PI;
            // console.log(angle,"angle");
            // let ridian1 = Math.atan2(-offY,offX);
            // let angle1 = ridian1 > 0 ? ridian1 * 180 / Math.PI : (ridian1 + 2 * Math.PI) * 180 / Math.PI;
            if(square > this.maxSpeed)
            {
                square = this.maxSpeed;
            }
            this.moveX = square * Math.cos(angle * Math.PI / 180);
            this.moveY = square * Math.sin(angle * Math.PI / 180);
            SceneMgr.Instance.playerComp.move(this.moveX,this.moveY,-angle + 90);
            this.isMove = true;
        }
    }
    onStageMouseMove(e:Laya.Event)
    {
        if(GameMgr.Instance.gameStatus != GameStatus.Execute) return;
        if((e.target as Laya.Button).skin) return;
        this.mouseMove();
    }
    onStageMouseUp()
    {
        if(GameMgr.Instance.gameStatus != GameStatus.Execute) return;
        this.isPress = false;
        this.moveX = 0;
        this.moveY = 0;
        SceneMgr.Instance.playerComp.stop();
    }
    rayCastDemo(pos:Laya.Vector3,dir:Laya.Vector3,distance:number,ditectLayer:ObjLayer,success:Function,caller:any,fail?:Function):any
    {
        let hitData = null;
        Laya.Vector3.normalize(dir,dir);
        let ray = new Laya.Ray(pos,dir);
        let result = new Laya.HitResult();
        SceneMgr.Instance.mainScene.physicsSimulation.rayCast(ray,result,distance);
        if(result.succeeded)
        {
            let other = result.collider.owner as Laya.Sprite3D;
            // if(other.layer == ObjLayer.player && ditectLayer == ObjLayer.player)
            // {
            //     if(result.hitFraction < 20)
            //     {
            //         success.call(caller);
            //     }
            //     else{
            //         if(fail)
            //         fail.call(caller);
            //     }
            // }
            if(other.layer == ditectLayer)
            {
                success.call(caller);
            }
            else{
                if(fail)
                fail.call(caller);
            }
            hitData = {
                point:result.point,
                distance:result.hitFraction,
                layer:other.layer,
            }
        }
        return hitData;
    }
    activeLevel()
    {
        // let levelNode = SceneMgr.Instance.mainScene.getChildByName("level");
        // for(let i = 0 ;i < levelNode.numChildren;i++)
        // {
        //     let child = levelNode.getChildAt(i) as Laya.Sprite3D;
        //     if(this.usedLevel == i + 1)
        //     {
        //         child.active = true;
        //     }
        //     else{
        //         child.active = false;
        //     }
        // }
        //改成直线前进的关卡,暂时设定每截8米,初始路面四截
        let allPart = this.usedLevel + 1;
        for(let i = 0; i < allPart; i++)
        {
            let one = Laya.Sprite3D.instantiate(SceneMgr.Instance.roadPart,this.obj);
            one.transform.position = new Laya.Vector3(0,0,8*i);
            one.active = true;
        }
        SceneMgr.Instance.zhongdianNode.transform.position = new Laya.Vector3(0,0,8 * allPart);
        SceneMgr.Instance.chaodi.transform.localPositionZ = -8 + 4 * allPart;
        SceneMgr.Instance.chaodi.transform.localScaleY = 40 + 8 * allPart;

    }
    createEmy()
    {
        //改成区域内随机生成
        //改成分前中后三段生成，生成的敌人为3的倍数
        for(let i = 0; i < this.usedLevel * 3;i++)
        {
            let one = SceneMgr.Instance.getSingleObj(SceneMgr.Instance.enemyColl);
            SceneMgr.Instance.map.addChild(one);
            // let pre = node.getChildAt(i) as Laya.Sprite3D;
            // pre.active = false;
            // one.transform.position = pre.transform.position.clone();
            //(-8~8*this.usedlevel)
            let p:Laya.Vector3 = null;
            let part = 8*(this.usedLevel+2)/3;
            if(i < this.usedLevel)
            {
                p = new Laya.Vector3(this.random(-2,2),0,this.random(-16,-16+part));
            }
            else if(i < this.usedLevel * 2)
            {
                p = new Laya.Vector3(this.random(-2,2),0,this.random(-16+part,-16+2*part));
            }
            else{
                p = new Laya.Vector3(this.random(-2,2),0,this.random(-16+2*part,-16+3*part));
            }
            one.transform.position = p;
            one.active = true;
            let comp = one.addComponent(Enemy) as Enemy;
            comp.init();
        }
        this.enemy_all = this.usedLevel * 3;
        
    }
    createTree(node:Laya.Sprite3D)
    {
        for(let i = 0;i < node.numChildren;i++)
        {
            let data = SceneMgr.Instance.getSingleTree();
            let obj = data.obj as Laya.Sprite3D;
            SceneMgr.Instance.map.addChild(obj);
            let pre = node.getChildAt(i) as Laya.Sprite3D;
            pre.active = false;
            obj.transform.position = pre.transform.position.clone();
            obj.transform.localPositionY += data.yPos;
            obj.active = true;
        }
        
    }
    createItem()
    {
        for(let i = 0;i < this.usedLevel + 2;i++)
        {
            let one = SceneMgr.Instance.getItem(SceneMgr.Instance.itemColl);
            SceneMgr.Instance.map.addChild(one);
            // let pre = node.getChildAt(i) as Laya.Sprite3D;
            // pre.active = false;
            // one.transform.position = pre.transform.position.clone();
            one.transform.position = new Laya.Vector3(this.random(-2,2),0,this.random(-16,8*(this.usedLevel-2)));
            one.active = true;
            let comp = one.addComponent(Item) as Item;
            comp.init();
        }
        

    }

    enemyDown()
    {
        if(this.enemy_all <= 0)
        {
            console.log("计算错误");
            return;
        }
        this.enemy_all--;
        EventMgr.instance.emit(EventDefine.EMY,this.enemy_all);
        if(this.enemy_all <= 0)
        {
            this.activeDestination(true);
        }
    }
    activeDestination(active:boolean)
    {
        SceneMgr.Instance.escapeObj.active = active;
        // SceneMgr.Instance.mainScene.getChildByName("map").getChildByName("dangban (7)").active = !active;
        // let weiqiang = SceneMgr.Instance.mainScene.getChildByName("map").getChildByName("weiqiang (2)") as Laya.Sprite3D;
        // weiqiang.getChildByName("weilan (4)").active = !active;
        // weiqiang.getChildByName("weilan (5)").active = !active;
        let weiqiang = SceneMgr.Instance.zhongdianNode.getChildByName("weiqiang") as Laya.Sprite3D;
        weiqiang.active = !active;
        SceneMgr.Instance.guang.active = active;
        if(active)
        {
            let matNode = SceneMgr.Instance.mainScene.getChildByName("guangMaterials") as Laya.MeshSprite3D;
            let matArrLen = matNode.meshRenderer.materials.length;
            let matArr = [];
            for(let i = 0; i < matArrLen;i++)
            {
                let mat = matNode.meshRenderer.materials[i];
                matArr.push(mat);
            }
            let frame = 0;
            Laya.timer.frameLoop(5,this,()=>{
                (SceneMgr.Instance.guang as Laya.MeshSprite3D).meshRenderer.material = matArr[frame%12];
                frame++;
            });

        }
        else{
            Laya.timer.clearAll(this);
        }
        //激活箭头

    }

    createBubble(obj:Laya.Sprite3D,pos:Laya.Vector3)
    {
        let st = null;
        if(obj == SceneMgr.Instance.qipao)
        {
            st = ModelType.bubble;
        }
        else{
            st = ModelType.littleBubble;
        }
        let one = Laya.Pool.getItemByCreateFun(st,()=>{
            return Laya.Sprite3D.instantiate(obj);
        }) as Laya.Sprite3D;
        SceneMgr.Instance.map.addChild(one);
        one.transform.position = pos;
        one.active = true;
        Laya.timer.once(1000,this,()=>{
            one.removeSelf();
            Laya.Pool.recover(st,one);
        })
    }
    random(min:number,max:number)
    {
        return Math.random()*(max-min) + min;
    }
}