import Enemy from "./Enemy";
import SceneMgr from "../mgr3d/SceneMgr";

export default class Thug extends Enemy{
    /**
     *
     */
    constructor() {
        super();
        
    }

    onAwake()
    {
        super.onAwake();
    }
    init()
    {
        super.init();
        this.shootCD = 500;
    }
    onUpdate()
    {
        super.onUpdate();
    }
    checkDistance()
    {
        let dis = Laya.Vector3.distanceSquared(this.obj.transform.position,SceneMgr.Instance.player.transform.position);
        //追击
        let data = this.checkRay(100);
        if(dis > 2)
        {
            let dis_PxO = Laya.Vector3.distance(this.obj.transform.position,data.point);
            if(dis_PxO > 0.1)
            {
                let dir = new Laya.Vector3();
                Laya.Vector3.subtract(SceneMgr.Instance.player.transform.position,this.obj.transform.position,dir);
                Laya.Vector3.normalize(dir,dir);
                Laya.Vector3.scale(dir,this.moveSpeed,dir);
                this.obj.transform.translate(dir,false);
            }
        }
        else{
            // if(SceneMgr.Instance.playerComp.enemyInHand)
            {
                SceneMgr.Instance.playerComp.beat(this.obj);
                // this.hit();
            }
            // else
            {
                SceneMgr.Instance.playerComp.grab(this.obj);
                this.changeColliderState(false);
            }
        }
    }
    shoot()
    {
        //播放打击动作

    }
}