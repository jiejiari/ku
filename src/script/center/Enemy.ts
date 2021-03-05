import SceneMgr from "../mgr3d/SceneMgr";
import GameMgr, { GameStatus } from "../mgr3d/GameMgr";
import Bullet from "./Bullet";
import { HandType } from "./Player";
import EventMgr from "../mgrCommon/EventMgr";
import { EventDefine } from "../mgrCommon/EventDefine";
import SoundMgr from "../mgrCommon/SoundMgr";

enum EnemyState{
    idle = 0,
    chase,
    shoot,
    grabAndShoot,
    fly,
    die,
}

export default class Enemy extends Laya.Script3D {
    
    protected obj:Laya.Sprite3D;
    // private rigid:Laya.Rigidbody3D;
    // protected discovered:boolean = false;
    protected moveSpeed:number = 0.02;
    //被抓住
    // protected grab:boolean = false;
    //被击飞
    // protected inFly:boolean = false;
    protected flyDir:Laya.Vector3;
    protected flyVertical:Laya.Vector3;
    protected flySpeed:number = 0.2;
    protected flyTime:number = 0;
    protected hitwall:boolean = false;
    //死亡
    // protected isDead:boolean = false;
    protected shootCD:number = 1000;
    //视距
    protected visualRange:number = 5;
    //状态
    protected state:EnemyState = EnemyState.idle;
    protected line:Laya.PixelLineSprite3D;

    protected anim:Laya.Animator;
    protected animName:string = "idle";

    protected inKnock:boolean = false;
    protected knockDir:Laya.Vector3;
    private knockSpeed:number = 0.15;

    // protected img:Laya.Image;

    constructor() { super(); }
    
    onAwake()
    {
        this.obj = this.owner as Laya.Sprite3D;
        // this.rigid = this.obj.getComponent(Laya.Rigidbody3D) as Laya.Rigidbody3D;
        // this.initRigidBody();
        this.anim = this.obj.getComponent(Laya.Animator) as Laya.Animator;
        // EventMgr.instance.onOnceEvent(EventDefine.PIC,this,this.addPicture);
    }
    init()
    {
        // SceneMgr.Instance.mapComp.createArrow();
        this.obj.transform.localRotationEulerY = 180;
    }
    kuangdianInit()
    {
        this.obj.transform.localPositionY = 180;
        this.obj.transform.localPosition = new Laya.Vector3(0,0,-16);
    }
    // addPicture()
    // {
    //     if(SceneMgr.Instance.mapComp.arrowPrefab == null || this.img) return;
    //     this.img = Laya.Pool.getItemByCreateFun(ModelType.arrow,SceneMgr.Instance.mapComp.arrowPrefab.create,SceneMgr.Instance.mapComp.arrowPrefab) as Laya.Image;
    //     SceneMgr.Instance.mapComp.gamePic.addChild(this.img);
    //     this.img.visible = false;
    // }
    playAnim(name:string,crossFade:boolean)
    {
        if(crossFade)
        {
            this.anim.crossFade(name,0.2);
        }
        else{
            this.anim.play(name);
        }
        this.animName = name;
    }
    initRigidBody()
    {
        // this.rigid.isKinematic = true;
        // this.rigid.gravity = new Laya.Vector3;
        // this.rigid.friction = 5;
        // this.rigid.restitution = 0;
    }
    onEnable(): void {

    }

    onDisable(): void {

    }
    onUpdate()
    {
        if(GameMgr.Instance.gameStatus != GameStatus.Execute)
        {
            // if(this.img)
            // {
            //     this.img.visible = false;
            // }
            return;
        }
        if(this.state == EnemyState.idle)
        {
            this.checkDistance();
        }
        else if(this.state == EnemyState.chase)
        {
            this.lookAtPlayer();
            this.checkDistance();
            this.resetCD();
            // this.showArrow();
        }
        else if(this.state == EnemyState.shoot)
        {
            this.lookAtPlayer();
            this.checkDistance();
            this.discover();
            // this.showArrow();
        }
        else if(this.state == EnemyState.grabAndShoot)
        {
            this.discover();
        }
        else if(this.state == EnemyState.fly)
        {
            // let t = 0;
            // while(t < 10)
            // {
            //     this.fly();
            //     t++;
            // }
            this.fly();
        }
        if(this.inKnock)
        {
            this.knockFly();
        }
        
    }
    showArrow()
    {
        // let newPos = new Laya.Vector4;
        // if(this.obj.destroyed || this.obj == null) return;
        // SceneMgr.Instance.mainCamera.worldToViewportPoint(this.obj.transform.position,newPos);
        // let showPos = new Laya.Vector2(newPos.x,newPos.y);
        // if(newPos.x > 0 && newPos.x < Laya.stage.width && newPos.y > 0 && newPos.y < Laya.stage.height)
        // {
        //     this.img.visible = false;
        // }
        // else{
        //     if(newPos.x <= 0){
        //         showPos.x = 30;
        //     }
        //     else if(newPos.x >= Laya.stage.width)
        //     {
        //         showPos.x = Laya.stage.width - 30;
        //     }
        //     if(newPos.y <= 0)
        //     {
        //         showPos.y = 30;
        //     }
        //     else if(newPos.y >= Laya.stage.height)
        //     {
        //         showPos.y = Laya.stage.height - 30;
        //     }
        //     this.img.pos(showPos.x,showPos.y);
        //     this.img.visible = true;
        // }
    }
    recoverPic()
    {
        // this.img.visible = false;
        // this.img.removeSelf();
        // Laya.Pool.recover(ModelType.arrow,this.img);
    }
    lookAtPlayer()
    {
        let pos = new Laya.Vector3();
        pos = SceneMgr.Instance.model.transform.position;
        this.obj.transform.lookAt(pos,new Laya.Vector3(0,1,0));
        this.obj.transform.localRotationEulerY += 180;
    }
    move()
    {
        let dir = new Laya.Vector3();
        Laya.Vector3.subtract(SceneMgr.Instance.player.transform.position,this.obj.transform.position,dir);
        Laya.Vector3.normalize(dir,dir);
        Laya.Vector3.scale(dir,this.moveSpeed,dir);
        dir.y = 0;
        this.obj.transform.translate(dir,false);
    }
    checkDistance()
    {
        if(SceneMgr.Instance.mapComp.kuangdian) return;
        let myPos = new Laya.Vector3(this.obj.transform.position.x,0.5,this.obj.transform.position.z);
        let dis = Laya.Vector3.distanceSquared(myPos,SceneMgr.Instance.player.transform.position);
        if(dis > 200) return;
        // console.log(dis);
        let data = this.checkRay(100);
        // this.discovered = false;
        if(data == null) return;
        if(data.layer == ObjLayer.player)
        {
            //追击
            if(dis > 20)
            {
                let dis_PxO = Laya.Vector3.distance(myPos,data.point);
                if(dis_PxO > 0.1)
                {
                    this.move();
                }
                //动画
                if(this.animName == "idle")
                {
                    this.playAnim("run",true);
                }
                this.state = EnemyState.chase;
            }
            //射击
            else if(dis <= 20 && dis > 1)
            {
                // this.discovered = true;
                this.state = EnemyState.shoot;
                if(this.animName == "run")
                {
                    this.playAnim("idle",true);
                }
            }
            //近身
            else{
                if(SceneMgr.Instance.playerComp.handState != HandType.None)
                {
                    SceneMgr.Instance.playerComp.beat(this.obj);
                    // this.hit();
                }
                else{
                    // this.grab = true;
                    SceneMgr.Instance.playerComp.grab(this.obj,false);
                    this.changeColliderState(false);
                    this.state = EnemyState.grabAndShoot;
                    // this.img.visible = false;
                }
            }
        }
        else{
            let dis_PxO = Laya.Vector3.distance(myPos,data.point);
            if(dis_PxO > 0.5)
            {
                this.move();
            }
            this.state = EnemyState.chase;
            //动画
            if(this.animName == "idle")
            {
                this.playAnim("run",true);
            }
        }
        
    }
    //被击碎
    // hit()
    // {
    //     //播放击碎特效,死亡
    //     this.disableColllider();
    //     Laya.timer.once(1000,this,()=>{
    //         this.obj.destroy(true);
    //     })
    // }
    //射线检测
    checkRay(length:number):any
    {
        let dir = new Laya.Vector3;
        let myPos = new Laya.Vector3(this.obj.transform.position.x,0.5,this.obj.transform.position.z);
        Laya.Vector3.subtract(SceneMgr.Instance.player.transform.position,myPos,dir);
        Laya.Vector3.normalize(dir,dir);
        let ray = new Laya.Ray(myPos,dir);
        let result = new Laya.HitResult();
        SceneMgr.Instance.mainScene.physicsSimulation.rayCast(ray,result);
        let data = null;
        if(result.succeeded)
        {
            let other = result.collider.owner as Laya.Sprite3D;
            // let sq = Laya.Vector3.distanceSquared(this.obj.transform.position.clone(),other.transform.position.clone());
            // if(other.layer == ObjLayer.player && sq < 20)
            // {
            //     this.discovered = true;
            //     if(this.animName == "run")
            //     {
            //         this.playAnim("idle",true);
            //     }
            // }
            // else{
            //     this.discovered = false;
            // }
                data = {
                point:result.point,
                layer:(result.collider.owner as Laya.Sprite3D).layer,
            }
        }

        // let data = SceneMgr.Instance.mapComp.rayCastDemo(this.obj.transform.position,dir,length,ObjLayer.player,()=>{
        //     this.discovered = true;
        // },this,()=>{
        //     this.discovered = false;
        // });
        return data;
    }
    //发现主角
    discover()
    {
        //射击
        this.shootCD -= 16;
        if(this.shootCD < 0)
        {
            this.shootCD = 1000;
            if(this.state == EnemyState.shoot)
            this.shoot();
            else
            this.shoot(true);
        }
    }
    resetCD()
    {
        this.shootCD = 1000;
    }
    shoot(grab?:boolean)
    {
        let one = Laya.Pool.getItemByCreateFun(ModelType.bullet,()=>{
            return Laya.Sprite3D.instantiate(SceneMgr.Instance.qiangxiao);
        }) as Laya.Sprite3D;
        SceneMgr.Instance.map.addChild(one);
        let pos = this.obj.getChildByName("M16A4").getChildByName("fire") as Laya.Sprite3D;
        one.transform.position = pos.transform.position;
        one.active = true;
        let comp:Bullet = one.getComponent(Bullet) || one.addComponent(Bullet);
        if(grab)
        {
            let dir = new Laya.Vector3;
            this.obj.transform.getForward(dir);
            dir = new Laya.Vector3(-dir.x,dir.y,-dir.z);
            comp.otherInit(dir,this.obj.transform.position.clone(),null,true);
        }
        else{
            comp.init(SceneMgr.Instance.player.transform.position.clone(),this.obj.transform.position.clone());
            SceneMgr.Instance.playerComp.lifeDown();
        }
        SoundMgr.instance.playSound("shoot");


        //枪口
        let kou = pos.getChildAt(0).getChildAt(0) as Laya.MeshSprite3D;
        kou.active = true;
        let time = 0;
        Laya.timer.frameLoop(5,kou,()=>{
            if(time < 3)
            {
                time++;
                kou.meshRenderer.material = SceneMgr.Instance.kouArr[time];
            }
            else{
                Laya.timer.clearAll(kou);
                kou.active = false;
            }
        })
    }
    changeColliderState(active:boolean)
    {
        let coll = this.obj.getComponent(Laya.PhysicsCollider) as Laya.PhysicsCollider;
        coll.enabled = active;
        // let coll = this.obj.getComponent(Laya.Rigidbody3D) as Laya.Rigidbody3D;
        // coll.enabled = active;
    }
    //被击飞
    hit(dir:Laya.Vector3)
    {
        // this.inFly = true;
        this.state = EnemyState.fly;
        this.flyDir = dir;

        Laya.timer.once(10000,this,()=>{
            this.dead();
        })
        // SceneMgr.Instance.mapComp.enemyDown();
        // this.flyVertical = new Laya.Vector3(this.flyDir.z,0,-this.flyDir.x);
        // Laya.Vector3.normalize(this.flyVertical,this.flyVertical);
        // Laya.Vector3.scale(this.flyVertical,0.5,this.flyVertical);
        //添加线
        // let end = new Laya.Vector3;
        // this.line = new Laya.PixelLineSprite3D(100,"line");
        // Laya.Vector3.add(this.obj.transform.position,dir,end);
        // this.line.addLine(this.obj.transform.position,end,Laya.Color.RED,Laya.Color.RED);
        // console.log("方向：",dir);
        // SceneMgr.Instance.mainScene.addChild(this.line);
    }
    fly()
    {
        // if(this.hitwall) return;
            Laya.Vector3.normalize(this.flyDir,this.flyDir);
            Laya.Vector3.scale(this.flyDir,this.flySpeed,this.flyDir);
            this.obj.transform.translate(this.flyDir,false);
            Laya.Vector3.normalize(this.flyDir,this.flyDir);
            let startPos = new Laya.Vector3(this.obj.transform.position.x,this.obj.transform.position.y+0.5,this.obj.transform.position.z);
                let ray = new Laya.Ray(startPos,this.flyDir);
                let result = new Laya.HitResult();
                SceneMgr.Instance.mainScene.physicsSimulation.rayCast(ray,result,0.5);

                // let p = new Laya.Vector3;
                // Laya.Vector3.normalize(this.flyDir,this.flyDir);
                // Laya.Vector3.scale(this.flyDir,2,this.flyDir);
                // Laya.Vector3.add(this.obj.transform.position,this.flyDir,p);
                // this.line.setLine(0,this.obj.transform.position,p,Laya.Color.RED,Laya.Color.RED);
                if(result.succeeded)
                {
                    // this.inFly = false;
                    let other = result.collider.owner as Laya.Sprite3D;
                    if(other.layer == ObjLayer.barrier)
                    {
                        this.dead();
                    }
                    if(other.layer == ObjLayer.enemy)
                    {
                        //被撞到的敌人也要消失
                        this.dead();
                        this.knockDown(this.flyDir,1,0);
                        let comp = other.getComponent(Enemy) as Enemy;
                        comp.dead();
                        comp.knockDown(this.flyDir,-1,0);
                        // SceneMgr.Instance.mapComp.enemyDown();
                    }
                    // break;
                }
            
            this.flyTime += 16;
        
    }
    //撞到人会击飞两个
    knockDown(dir:Laya.Vector3,factor:number,offset:number)
    {
        this.inKnock = true;
        let angle = Math.random() * 90 * factor - offset;
        let ridius = angle * Math.PI / 180 ;
        this.knockDir = new Laya.Vector3(dir.x * Math.cos(ridius) - dir.z * Math.sin(ridius),0,dir.x * Math.sin(ridius) + dir.z * Math.cos(ridius));

        Laya.Tween.to(this.obj.transform,{localPositionY:1},500,Laya.Ease.cubicOut,Laya.Handler.create(this,()=>{
            Laya.Tween.to(this.obj.transform,{localPositionY:0},500,Laya.Ease.cubicIn);
        }));
    }
    knockFly()
    {
        Laya.Vector3.normalize(this.knockDir,this.knockDir);
        Laya.Vector3.scale(this.knockDir,this.knockSpeed,this.knockDir);
        this.obj.transform.translate(this.knockDir,false);
        Laya.Vector3.normalize(this.knockDir,this.knockDir);
        let startPos = new Laya.Vector3(this.obj.transform.position.x,this.obj.transform.position.y+0.5,this.obj.transform.position.z);
            let ray = new Laya.Ray(startPos,this.knockDir);
            let result = new Laya.HitResult();
            SceneMgr.Instance.mainScene.physicsSimulation.rayCast(ray,result,0.2);

            // let p = new Laya.Vector3;
            // Laya.Vector3.normalize(this.flyDir,this.flyDir);
            // Laya.Vector3.scale(this.flyDir,2,this.flyDir);
            // Laya.Vector3.add(this.obj.transform.position,this.flyDir,p);
            // this.line.setLine(0,this.obj.transform.position,p,Laya.Color.RED,Laya.Color.RED);
            if(result.succeeded)
            {
                // this.inFly = false;
                this.knockSpeed = 0;
                this.inKnock = false;
                // break;
            }
            if(this.knockSpeed > 0)
            {
                this.knockSpeed -= 0.001;
            }
    }
    dead()
    {
        SceneMgr.Instance.cameraComp.cameraShake();
        SceneMgr.Instance.mapComp.coinInLevel += 15;
        SceneMgr.Instance.mapComp.enemyDown();
        SoundMgr.instance.playSound("luntai");
        this.changeColliderState(false);
        if(Laya.Browser.onMiniGame)
        {
            console.log("zhendong");
            Global.Platform.vibrateShort();
        }
        this.recoverPic();
        this.state = EnemyState.die;
        // this.isDead = true;
        this.playAnim("fall",true);
        Laya.timer.once(1000,this,()=>{
            SoundMgr.instance.playSound("enemy");
            SceneMgr.Instance.mapComp.createBubble(SceneMgr.Instance.qipao,this.obj.transform.position.clone());
            this.obj.destroy(true);
        })
    }

}