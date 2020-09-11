import SceneMgr from "../mgr3d/SceneMgr";
import EventMgr from "../mgrCommon/EventMgr";
import { EventDefine } from "../mgrCommon/EventDefine";
import Enemy from "./Enemy";

export default class Bullet extends Laya.Script{

    private obj:Laya.Sprite3D;
    private playerPos:Laya.Vector3 = new Laya.Vector3;
    private myStartPos:Laya.Vector3 = new Laya.Vector3;
    private hurt:boolean = false;
    private speed:number = 0.4;
    private dir:Laya.Vector3 = new Laya.Vector3;
    private lookPlayer:boolean = false;

    private zidan:boolean = false;

    constructor(){super();}

    onAwake()
    {
        this.obj = this.owner as Laya.Sprite3D;
        // let coll = this.obj.getComponent(Laya.PhysicsCollider) as Laya.PhysicsCollider;
        // coll.isTrigger = true;
    }
    recoverByPool()
    {
        this.hurt = false;
        this.lookPlayer = false;
        this.obj.transform.localRotationEuler = new Laya.Vector3;
    }
    //暂时改成激光
    init(playerPos:Laya.Vector3,myPos:Laya.Vector3)
    {
        this.playerPos = playerPos;
        this.myStartPos = myPos;
        this.myStartPos.y = 0.5;
        this.obj.transform.lookAt(this.playerPos,new Laya.Vector3(0,1,0));
        this.obj.transform.localRotationEulerY += 90;
        this.lookPlayer = true;

        Laya.timer.once(400,this,()=>{
            this.recoverSelf();
        })
    }
    otherInit(dir:Laya.Vector3,myPos:Laya.Vector3,angle?:number,zidan?:boolean)
    {
        this.dir = dir;
        // console.log("dir",dir);
        this.myStartPos = myPos;
        this.myStartPos.y = 0.5;
        this.obj.transform.lookAt(this.myStartPos,new Laya.Vector3(0,1,0));
        if(!angle) angle = 78;
        if(zidan) this.zidan = true;
        this.obj.transform.localRotationEulerY -= angle;

        Laya.timer.once(300,this,()=>{
            this.recoverSelf();
        })
    }
    countDown(dir:Laya.Vector3)
    {
        this.dir = dir;
        this.zidan = true;
        Laya.timer.once(300,this,()=>{
            this.obj.removeSelf();
            this.recoverByPool();
            Laya.Pool.recover(ModelType.bullet,this.obj);
        })
    }
    onUpdate()
    {
        
        let dis = new Laya.Vector3;
        if(this.lookPlayer)
        Laya.Vector3.subtract(this.playerPos,this.myStartPos,dis);
        else
        dis = this.dir;
        Laya.Vector3.normalize(dis,dis);
        Laya.Vector3.scale(dis,this.speed,dis);
        this.obj.transform.translate(dis,false);
        if(this.zidan)
        {
            this.checkHit(dis);
        }
        // if(this.obj.destroyed == false)
        // this.checkDis();
        
    }
    checkDis()
    {
        if(Laya.Vector3.distanceSquared(this.obj.transform.position,SceneMgr.Instance.player.transform.position) < 1)
        {
            let comp = SceneMgr.Instance.playerComp;
            comp.lifeDown();
            this.recoverSelf();
        }
    }
    checkHit(dir:Laya.Vector3)
    {
        if(this.hurt) return;
        Laya.Vector3.normalize(dir,dir);
        let ray = new Laya.Ray(this.obj.transform.position,dir);
        let result = new Laya.HitResult();
        SceneMgr.Instance.mainScene.physicsSimulation.rayCast(ray,result,1);
        if(result.succeeded)
        {
            let other = result.collider.owner as Laya.Sprite3D;
            if(other.layer == ObjLayer.barrier)
            {
                // this.recoverSelf();
            }
            else if(other.layer == ObjLayer.enemy)
            {
                let comp = other.getComponent(Enemy) as Enemy;
                comp.dead();
            }
            this.hurt = true;
            SceneMgr.Instance.mapComp.createBubble(SceneMgr.Instance.baozi,result.point);
        }
        // if(this.hurt) return;
        // let data = SceneMgr.Instance.mapComp.rayCastDemo(this.obj.transform.position,dir,1,ObjLayer.barrier,()=>{
        //     // console.log("ok");
        //     this.hurt = true;
        // },this);
        // if(data)
        // SceneMgr.Instance.mapComp.createBubble(SceneMgr.Instance.baozi,data.point);
        
    }
    recoverSelf()
    {
        this.obj.removeSelf();
        this.recoverByPool();
        Laya.Pool.recover(ModelType.qiaoxiao,this.obj);
    }
}