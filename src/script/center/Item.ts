import SceneMgr from "../mgr3d/SceneMgr";
import Enemy from "./Enemy";
import GameMgr, { GameStatus } from "../mgr3d/GameMgr";
import { HandType } from "./Player";
import SoundMgr from "../mgrCommon/SoundMgr";
import Bullet from "./Bullet";


export enum ItemState{
    Idle,
    inHand,
    Fly,
}

export default class Item extends Laya.Script3D{
    
    private obj:Laya.Sprite3D;
    private isGun:boolean = false;
    private flyDir:Laya.Vector3;
    private flySpeed:number = 0.2;
    public state:ItemState = ItemState.Idle;
    private shootCD:number = 500;

    private rigid:Laya.Rigidbody3D;

    private gunLength:number = 0.5;
    
    //弹夹
    private clip:number = 20;
    constructor() {
        super();
        
    }
    onAwake()
    {
        this.obj = this.owner as Laya.Sprite3D;
    }
    init()
    {
        //霰弹
        if(this.obj.name.indexOf("01")>=0)
        {
            this.gunLength = 0.2;
        }
        if(this.obj.name.indexOf("0")>=0)
        {
            this.isGun = true;
        }
        if(this.obj.name == "muxiang" || this.obj.name.indexOf("dunpai") >= 0)
        {
            this.obj.transform.localPositionY += 0.5;
        }
        if(this.obj.name.indexOf("pl") >= 0)
        {
            this.obj.transform.localRotationEuler = new Laya.Vector3(0,90,0);
            this.obj.layer = ObjLayer.barrier;

            this.rigid = this.obj.getComponent(Laya.Rigidbody3D) as Laya.Rigidbody3D;
            // this.rigid.isKinematic = false;
            this.rigid.isTrigger = false;
        }
    }
    kuangdianInit()
    {
        this.obj.transform.localRotationEuler = new Laya.Vector3(0,90,0);
        this.obj.transform.localPosition = new Laya.Vector3(0,0,-22.64);
        this.obj.layer = ObjLayer.barrier;

        this.rigid = this.obj.getComponent(Laya.Rigidbody3D) as Laya.Rigidbody3D;
        // this.rigid.isKinematic = false;
        this.rigid.isTrigger = false;
    }
    onUpdate()
    {
        if(GameMgr.Instance.gameStatus != GameStatus.Execute) return;
        else if(this.state == ItemState.Idle){
            this.checkDis();
            this.gravity();
            if(this.isGun)
            {
                this.rotate();
            }
        }
        else if(this.state == ItemState.inHand){
            if(this.isGun)
            {
                this.inhand();
            }
        }
        else{
            this.fly();
            this.gravity();
        }
    }
    checkDis()
    {
        let dis = Laya.Vector3.distanceSquared(this.obj.transform.position,SceneMgr.Instance.player.transform.position);
        if(dis < 0.5 && this.obj.layer == ObjLayer.item)
        {
            if(SceneMgr.Instance.playerComp.handState == HandType.None)
            {
                SceneMgr.Instance.playerComp.grab(this.obj,this.isGun,this.gunLength);
                this.state = ItemState.inHand;
            }
        }
    }
    onTriggerEnter(coll:Laya.PhysicsComponent)
    {
        let other = coll.owner as Laya.Sprite3D;
        
        // console.log(other.layer);
        // if(other.layer == ObjLayer.player)
        // {
        //     if(this.obj.layer == ObjLayer.item || this.state == ItemState.Fly) return;
        //     if(SceneMgr.Instance.playerComp.handState == HandType.None)
        //     {
        //         SceneMgr.Instance.playerComp.grab(this.obj,this.isGun,this.gunLength);
        //         this.state = ItemState.inHand;
        //     }
        // }
        if(other.layer == ObjLayer.enemy)
        {
            if(this.state == ItemState.Fly)
            {
                if(!this.rigid)
                this.stop();
                let comp = other.getComponent(Enemy) as Enemy;
                comp.dead();
                comp.knockDown(this.flyDir,1,45);
            }
        }
        // else if(other.layer == ObjLayer.barrier)
        // {
        //     this.stop();
        // }
    }
    onCollisionEnter(coll:Laya.Collision)
    {
        let other = coll.other.owner as Laya.Sprite3D;
        if(other.layer == ObjLayer.player)
        {
            if(this.obj.layer == ObjLayer.item || this.state == ItemState.Fly) return;
            if(SceneMgr.Instance.playerComp.handState == HandType.None)
            {
                SceneMgr.Instance.playerComp.grab(this.obj,this.isGun,this.gunLength);
                this.state = ItemState.inHand;
            }
        }
    }
    rotate()
    {
        this.obj.transform.rotate(new Laya.Vector3(0,0.05,0),false);
    }
    hit(dir:Laya.Vector3)
    {
        this.state = ItemState.Fly;
        this.flyDir = dir;
        if(this.rigid)
        {
            this.rigid.isTrigger = true;
        }
    }
    fly()
    {
        // if(this.hitWall) return;
        if(this.rigid)
        {
            if(this.flySpeed > 0)
            {
                this.flySpeed -= 0.003;
            }
            else{
                this.stop();
            }
        }
            Laya.Vector3.normalize(this.flyDir,this.flyDir);
            Laya.Vector3.scale(this.flyDir,this.flySpeed,this.flyDir);
            this.obj.transform.translate(this.flyDir,false);
            Laya.Vector3.normalize(this.flyDir,this.flyDir);
                let ray = new Laya.Ray(this.obj.transform.position,this.flyDir);
                let result = new Laya.HitResult();
                SceneMgr.Instance.mainScene.physicsSimulation.rayCast(ray,result,0.5);

                // let p = new Laya.Vector3;
                // Laya.Vector3.normalize(this.flyDir,this.flyDir);
                // Laya.Vector3.scale(this.flyDir,2,this.flyDir);
                // Laya.Vector3.add(this.obj.transform.position,this.flyDir,p);
                // this.line.setLine(0,this.obj.transform.position,p,Laya.Color.RED,Laya.Color.RED);
                if(result.succeeded)
                {
                    let other = result.collider.owner as Laya.Sprite3D;
                    if(other.layer == ObjLayer.barrier)
                    {
                        this.stop();
                    }
                    if(other.layer == ObjLayer.enemy)
                    {
                        //被撞到的敌人也要消失
                        if(!this.rigid)
                        {
                            this.stop();
                            let comp = other.getComponent(Enemy) as Enemy;
                            comp.dead();
                            comp.knockDown(this.flyDir,1,45);
                        }
                    }
                    // break;
                }
        
    }
    inhand()
    {
        this.shootCD -= 16;
        if(this.shootCD < 0 && this.clip > 0)
        {
            this.shootCD = 500;
            this.clip--;
            this.shoot();
            if(this.clip <= 0)
            {
                this.obj.removeSelf();
                this.obj.destroy(true);
                SceneMgr.Instance.playerComp.handState = HandType.None;
            }
        }
    }
    shoot()
    {
        //生成枪效,考虑朝向
        //生成子弹,考虑射线
        let one = Laya.Pool.getItemByCreateFun(ModelType.qiaoxiao,()=>{
            return Laya.Sprite3D.instantiate(SceneMgr.Instance.qiangxiao);
        }) as Laya.Sprite3D;
        let two = Laya.Pool.getItemByCreateFun(ModelType.bullet,()=>{
            return Laya.Sprite3D.instantiate(SceneMgr.Instance.bullet);
        }) as Laya.Sprite3D;
        SceneMgr.Instance.map.addChild(one);
        SceneMgr.Instance.map.addChild(two);
        let pos = SceneMgr.Instance.model.getChildByName("firepos") as Laya.Sprite3D;
        one.transform.position = pos.transform.position.clone();
        one.active = true;
        two.transform.position = SceneMgr.Instance.model.transform.position.clone();
        two.active = true;
        let comp:Bullet = one.getComponent(Bullet) || one.addComponent(Bullet);
        let twpComp:Bullet = two.getComponent(Bullet) || two.addComponent(Bullet);

        let dir = new Laya.Vector3;
        this.obj.transform.getRight(dir);
        dir = new Laya.Vector3(-dir.x,dir.y,-dir.z);
        comp.otherInit(dir,SceneMgr.Instance.model.transform.position.clone(),88);
        twpComp.countDown(dir);
        SoundMgr.instance.playSound("shoot");


        //枪口
        let kou = this.obj.getChildAt(0).getChildAt(0) as Laya.MeshSprite3D;
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
    
    stop()
    {
        this.state = ItemState.Idle;
        this.flySpeed = 0.2;
        if(this.rigid)
        {
            this.rigid.isTrigger = false;
        }
        if(this.obj.name.indexOf("luntai") >= 0)
        {
            SoundMgr.instance.playSound("luntai");
        }
        else{
            SoundMgr.instance.playSound("muxiang");
        }
    }
    gravity()
    {
        if(this.obj.name == "muxiang" || this.obj.name == "dunpai")
        {
            if(Math.abs(this.obj.transform.localPositionY) > 0.25)
            {
                this.obj.transform.localPositionY -= 0.05;
            }
        }
        else{
            if(Math.abs(this.obj.transform.localPositionY) > 0.1)
            {
                this.obj.transform.localPositionY -= 0.05;
            }
        }
        
    }
}