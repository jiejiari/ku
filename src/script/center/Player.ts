import Enemy from "./Enemy";
import GameMgr, { GameStatus } from "../mgr3d/GameMgr";
import SceneMgr from "../mgr3d/SceneMgr";
import EventMgr from "../mgrCommon/EventMgr";
import { EventDefine } from "../mgrCommon/EventDefine";
import Item from "./item";
import UserData from "../models/UserData";
import SoundMgr from "../mgrCommon/SoundMgr";


export enum HandType{
    None = 0,
    Enemy,
    Item,
    Gun,
}
export default class Player extends Laya.Script3D {
    
    private obj:Laya.Sprite3D;
    private model:Laya.Sprite3D;
    private originPos:Laya.Vector3;
    // private model:Laya.Sprite3D;
    private rigid:Laya.Rigidbody3D;
    //临时护甲
    private armor_temporary:number = 0;
    //生命值
    // private max_health:number = 10;
    private max_armor:number = 5;
    private hp:number = 0;
    private time:number = 0;

    private anim:Laya.Animator;
    private animName:string = "idle";

    private step:Laya.Vector3;

    public handState:HandType = HandType.None;

    public toumingArchi:Laya.MeshSprite3D[] = [];
    constructor() { super(); }
    
    onAwake()
    {
        this.obj = this.owner as Laya.Sprite3D;
        this.model = SceneMgr.Instance.model;
        this.originPos = this.obj.transform.position.clone();
        this.step = this.originPos;
        // this.model = this.obj.getChildAt(0) as Laya.Sprite3D;
        this.anim = this.model.getComponent(Laya.Animator);
        this.anim.getControllerLayer().getAnimatorState("run").speed = 2;
        this.rigid = this.obj.getComponent(Laya.Rigidbody3D);
        this.initRigidBody();
    }
    init()
    {
        // this.initRigidBody();
        this.obj.transform.position = this.originPos;
        this.model.transform.position = this.originPos;
        this.model.transform.localPositionY -= 0.5;
        this.model.transform.localRotationEuler = new Laya.Vector3();
        this.armor_temporary = 0;
        this.hp = UserData.getHealth();
        console.log("当前血量：" + this.hp);
        this.activeRender(true);
        this.changeMat(UserData.curUsedItem);
        // this.transprent(true);
        this.playAnim("idle",false);
    }
    playAnim(name:string,crossFade:boolean)
    {
        if(this.animName == name) return;
        if(crossFade)
        {
            this.anim.crossFade(name,0.2);
        }
        else{
            this.anim.play(name);
        }
        this.animName = name;
    }
    onEnable(): void {
        EventMgr.instance.onEvent(EventDefine.ADD_BLOOD,this,this.addHealth);
    }

    onDisable(): void {
        EventMgr.instance.onOffEvent(EventDefine.ADD_BLOOD,this,this.addHealth);
    }
    addHealth(fun:Function,caller:any)
    {
        this.hp++;
        UserData.addHealth();
        if(fun)
        {
            fun.call(caller,[this.hp/UserData.getHealth()]);
        }
        UserData.saveData();
    }
    move(x:number,y:number,angle?:number)
    {
        // 模型和刚体分离，保证移动不出错
        //防止角度归位
        if(SceneMgr.Instance.mapComp.kuangdian == false)
        {
            if(angle)
            SceneMgr.Instance.model.transform.localRotationEuler = new Laya.Vector3(0,angle,0);
            //由于刚体线速度向量是相对于世界坐标系的，不能简单处理
            // this.obj.transform.getForward();
            if(this.handState == HandType.None)
            {
                this.rigid.linearVelocity = new Laya.Vector3(x/7.5,0,y/7.5);
            }
            else{
                this.rigid.linearVelocity = new Laya.Vector3(x/10,0,y/10);
            }
            this.animState();
        }
        
    }
    animState()
    {
        if(this.handState == HandType.Item)
        {
            this.playAnim("liftWalk",false);
        }
        else if(this.handState == HandType.Enemy)
        {
            this.playAnim("grabWalk",false);
        }
        else if(this.handState == HandType.Gun)
        {
            this.playAnim("gun",false);
        }
        else{
            this.playAnim("run",false);
        }
    }
    checkStep()
    {
        if(Laya.Vector3.distanceSquared(this.obj.transform.position,this.step) > 0.5)
        {
            SoundMgr.instance.playSound("walk");
            this.step = this.obj.transform.position.clone();
        }
    }
    onCollisionEnter(coll:Laya.Collision)
    {
        // let other = coll.other.owner as Laya.Sprite3D;
        // console.log(other.layer,"player");
    }
    stop()
    {
        if(SceneMgr.Instance.mapComp.kuangdian) return;
        if(this.animName == "walk" || this.animName == "liftWalk" || this.animName == "grabWalk" || this.animName == "gun" || this.animName == "run")
        {
            if(this.handState == HandType.Item)
            {
                this.playAnim("throw",false);
                Laya.timer.once(200,this,()=>{
                    this.push();
                })
            }
            else if(this.handState == HandType.Enemy)
            {
                this.playAnim("push2",false);
                Laya.timer.once(200,this,()=>{
                    this.push();
                })
            }
            else if(this.handState == HandType.Gun){
                this.playAnim("gunIdle",false);
                // this.playAnim("idle",false);
                // Laya.timer.once(500,this,()=>{
                //     this.push();
                // })
            }
            else{
                this.playAnim("idle",false);
            }
        }
        
        this.rigid.linearVelocity = new Laya.Vector3;
        this.rigid.angularVelocity = new Laya.Vector3;
        // if(this.animName == "walk")
        // {
        //     this.playAnim("idle",false);
        // }
    }
    onUpdate()
    {
        if(GameMgr.Instance.gameStatus != GameStatus.Execute) return;
        // this.obj.transform.rotate(new Laya.Vector3(0,0.1,0));
        let pos = new Laya.Vector3;
        Laya.Vector3.lerp(SceneMgr.Instance.model.transform.position,new Laya.Vector3(this.obj.transform.position.x,this.obj.transform.position.y-0.5,this.obj.transform.position.z),0.5,pos);
        SceneMgr.Instance.model.transform.position = pos;
        if(this.hp > 0)
        {
            this.checkStep();
            // this.transprent();
            // this.animState();
        }
        if(SceneMgr.Instance.mapComp.isPress == false)
        {
            this.stop();
        }
        // this.destination();
    }
    initRigidBody()
    {
        this.rigid.isKinematic = false;
        this.rigid.angularFactor = new Laya.Vector3(0,0,0);
        this.rigid.linearFactor = new Laya.Vector3(1,0,1);
        // this.rigid.linearVelocity = new Laya.Vector3;
        // this.rigid.angularVelocity = new Laya.Vector3;
        this.rigid.sleepLinearVelocity = 0.01;
        this.rigid.friction = 5;
        this.rigid.restitution = 0;
        this.rigid.rollingFriction = 0;
    }
    grab(obj:Laya.Sprite3D,isGun:boolean,length?:number,customAnim?:boolean)
    {
        SceneMgr.Instance.model.addChild(obj);
        // this.anim.linkSprite3DToAvatarNode()
        SoundMgr.instance.playSound("pick");
        SceneMgr.Instance.cameraComp.smoothCameraSize(false);
        if(customAnim)
        {
            this.playAnim("liftWalk",false);
        }
        if(obj.name == "enemy")
        {
            obj.transform.localPosition = new Laya.Vector3(0,0,0.3);
            obj.transform.localRotationEuler = new Laya.Vector3(0,0,0);
            this.armor_temporary = this.max_armor;
            EventMgr.instance.emit(EventDefine.ARMOR,this.armor_temporary/this.max_armor);
            this.handState = HandType.Enemy;
        }
        else if(obj.name == "dunpai")
        {
            obj.transform.localPosition = new Laya.Vector3(0,0.5,0.5);
            obj.transform.localRotationEuler = new Laya.Vector3(0,0,0);
            this.armor_temporary = this.max_armor;
            EventMgr.instance.emit(EventDefine.ARMOR,this.armor_temporary/this.max_armor);
            this.handState = HandType.Enemy;
        }
        else{
            if(isGun)
            {
                obj.transform.localPosition = new Laya.Vector3(0,0.5,length);
                obj.transform.localRotationEuler = new Laya.Vector3(-90,90,0);
                this.handState = HandType.Gun;
            }
            else{
                obj.transform.localPosition = new Laya.Vector3(0,1,0);
                this.handState = HandType.Item;
            }
        }
        //引导
        if(UserData.getLeveNum()==1)
        {
            EventMgr.instance.emit(EventDefine.SONGSHOU,true);
        }
    }
    beat(enemy:Laya.Sprite3D)
    {
        //播放打击动作
    }
    lifeDown()
    {
        if(this.armor_temporary > 0)
        {
            this.armor_temporary--;
            if(this.armor_temporary <= 0)
            {
                //销毁盾牌
                let enemy = SceneMgr.Instance.model.getChildAt(this.model.numChildren-1) as Laya.Sprite3D;
                enemy.removeSelf();
                enemy.destroy(true);
                SceneMgr.Instance.mapComp.enemyDown();
                this.handState = HandType.None;
                this.playAnim("walk",false);
            }
            EventMgr.instance.emit(EventDefine.ARMOR,this.armor_temporary/this.max_armor);
        }
        else{
            this.hp--;
            SoundMgr.instance.playSound("hurt");
        }
        if(this.hp <= 0)
        {
            this.die();
        }
        EventMgr.instance.emit(EventDefine.LIFE,this.hp/UserData.getHealth());
    }
    revive()
    {
        this.hp = UserData.getHealth();
        this.playAnim("idle",false);
    }
    //死亡
    die()
    {
        console.log("游戏结束");
        // this.playAnim("fall");
        this.rigid.linearVelocity = new Laya.Vector3;
        this.destroyHandItem();
        this.playAnim("fall",false);
        GameMgr.Instance.Dead();
    }
    destroyHandItem()
    {
        if(this.handState == HandType.Item)
        {
            let item = this.model.getChildAt(this.model.numChildren-1) as Laya.Sprite3D;
            this.handState = HandType.None;
            item.removeSelf();
            item.destroy(true);
        }
    }
    push()
    {
        //播放推击动作
        //伤害区域,用射线检测来做
        let dir = new Laya.Vector3;
        //不知道为什么获取的是向后方向
        SceneMgr.Instance.model.transform.getForward(dir);
        dir = new Laya.Vector3(-dir.x,dir.y,-dir.z);
        
        if(this.handState != HandType.None)
        {
            let obj:Laya.Sprite3D = null;
            let len = SceneMgr.Instance.model.numChildren;
            obj = SceneMgr.Instance.model.getChildAt(len-1) as Laya.Sprite3D;
            let pos = obj.transform.position.clone();
            SceneMgr.Instance.map.addChild(obj);
            obj.transform.position = pos;
            
            let comp = null;
            // if(this.handState == HandType.Enemy)
            // {
            //     comp = obj.getComponent(Enemy) as Enemy;
            // }
            // else{
            //     comp = obj.getComponent(Item) as Item;
            // }
            comp = obj.getComponent(Enemy) || obj.getComponent(Item);
            //??
            comp.hit(dir);
            this.handState = HandType.None;
            this.armor_temporary = 0;
            EventMgr.instance.emit(EventDefine.ARMOR,this.armor_temporary/this.max_armor);
            SceneMgr.Instance.cameraComp.smoothCameraSize(true);
        }
        else{
            let ray = new Laya.Ray(this.obj.transform.position,dir);
            let result = new Laya.HitResult();
            SceneMgr.Instance.mainScene.physicsSimulation.rayCast(ray,result,1);
            if(result.succeeded)
            {
                let other = result.collider.owner;
                if(other.name.indexOf("enemy") >= 0)
                {
                    let comp = other.getComponent(Enemy) as Enemy;
                    comp.hit(dir);
                }
            }
        }
        //引导
        if(UserData.getLeveNum()==1)
        {
            EventMgr.instance.emit(EventDefine.SONGSHOU,false);
        }
        
    }
    changeMat(index:number)
    {
        if(index <= 0) index = 0;
        let mesh3D = SceneMgr.Instance.model.getChildByName("Box002") as Laya.SkinnedMeshSprite3D;
        mesh3D.skinnedMeshRenderer.material = SceneMgr.Instance.xingxingArr[index];
    }
    activeRender(active:boolean)
    {
        let mesh3D = SceneMgr.Instance.model.getChildByName("Box002") as Laya.SkinnedMeshSprite3D;
        mesh3D.skinnedMeshRenderer.enable = active;
    }
    // destination()
    // {
    //     if(SceneMgr.Instance.mapComp.enemy_all <= 0)
    //     {
    //         let dis = Laya.Vector3.distanceSquared(this.obj.transform.position,SceneMgr.Instance.escapeObj.transform.position);
    //         if(dis < 1)
    //         {
    //             console.log("游戏胜利");
    //             GameMgr.Instance.GamePass();
    //         }
    //     }
    // }
    onTriggerEnter(other:Laya.PhysicsComponent){
        let layer = (other.owner as Laya.Sprite3D).layer;
        if(layer == ObjLayer.enemy)
        {
            
        }
        if(other.owner.name == "zhongdianxian")
        {
            console.log("游戏胜利");
            GameMgr.Instance.GamePass();
            this.stop();
        }
    }

    transprent(isReady?:boolean)
    {
        if(isReady)
        {
            for(let i = this.toumingArchi.length - 1; i >= 0;i--)
            {
                if(this.toumingArchi[i].destroyed == false)
                {
                    this.toumingArchi[i].meshRenderer.material = SceneMgr.Instance.toumingArr[0];
                    this.toumingArchi.splice(i,1);
                }
            }
            return;
        }
        let cameraPos = SceneMgr.Instance.mainCamera.transform.position;
        let dir = new Laya.Vector3;
        Laya.Vector3.subtract(this.obj.transform.position,cameraPos,dir);
        let ray = new Laya.Ray(cameraPos,dir);
        let result = new Laya.HitResult();
        //cscs
        // SceneMgr.Instance.mainCamera.normalizedViewportPointToRay(new Laya.Vector2(0.5,0.5),ray);
        SceneMgr.Instance.mainScene.physicsSimulation.rayCast(ray,result,10);
        if(result.succeeded)
        {
            let other = result.collider.owner as Laya.MeshSprite3D;
            if(other.layer == ObjLayer.barrier)
            {
                //改材质
                // console.log(other.name,(other.meshRenderer.material as Laya.BlinnPhongMaterial).renderMode);
                if((other.meshRenderer.material as Laya.BlinnPhongMaterial).renderMode == undefined)
                {
                    other.meshRenderer.material = SceneMgr.Instance.toumingArr[1];
                    this.toumingArchi.push(other);
                }
            }
            else{
                for(let i = this.toumingArchi.length - 1; i >= 0;i--)
                {
                    this.toumingArchi[i].meshRenderer.material = SceneMgr.Instance.toumingArr[0];
                    this.toumingArchi.splice(i,1);
                }
            }
        }
    }
}