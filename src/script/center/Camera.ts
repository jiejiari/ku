import SceneMgr from "../mgr3d/SceneMgr";
import GameMgr, { GameStatus } from "../mgr3d/GameMgr";

export default class Camera extends Laya.Script {
    private camera:Laya.Camera;
    private obj:Laya.Sprite3D;
    private originalPos:Laya.Vector3;
    private offset:Laya.Vector3 = new Laya.Vector3;
    private updateOffset:boolean = false;
    private shakeVec:Laya.Vector3 = new Laya.Vector3;
    
    constructor() { super(); }
    
    onAwake()
    {
        //0,3.7,-9.69
        //0.23,1.2,6
        this.camera = this.owner as Laya.Camera;
        this.camera.enableHDR = false
        this.obj = this.owner as Laya.Sprite3D;
        this.originalPos = this.obj.transform.position.clone();
        Laya.Vector3.subtract(this.originalPos,SceneMgr.Instance.model.transform.position.clone(),this.offset);
    }
    init()
    {
        this.obj.transform.position = new Laya.Vector3(0,4,-26.1);
        this.obj.transform.rotationEuler = new Laya.Vector3(-42,180,0);
    }
    onEnable(): void {
    }

    onDisable(): void {
    }
    onUpdate()
    {
        // let bP = new Laya.Vector4;
        // let playerPos = SceneMgr.Instance.player.transform.position;
        // this.camera.worldToNormalizedViewportPoint(playerPos,bP);
        // if(bP.x < 0.2 || bP.x > 0.7 || bP.y < 0.2 || bP.y > 0.8)
        // {
        //     if(this.updateOffset == false)
        //     {
        //         Laya.Vector3.subtract(this.obj.transform.position,playerPos,this.offset);
        //         this.updateOffset = true;
        //     }
        //     let aP = new Laya.Vector3;
        //     Laya.Vector3.add(this.offset,SceneMgr.Instance.player.transform.position,aP);
        //     Laya.Vector3.lerp(this.obj.transform.position,aP,0.15,aP);
        //     this.obj.transform.position = aP;
        // }
        // else{
        //     this.updateOffset = false;
        // }

        //
        if(GameMgr.Instance.gameStatus != GameStatus.Execute) return;
        let pos = (SceneMgr.Instance.model as Laya.Sprite3D).transform.position;
        let look = new Laya.Vector3(pos.x,pos.y+2,pos.z);
        // this.obj.transform.lookAt(look,new Laya.Vector3(0,1,0),false);
        let aP = new Laya.Vector3;
        Laya.Vector3.add(this.offset,pos,aP);
        Laya.Vector3.add(aP,this.shakeVec,aP);
        this.obj.transform.position = aP;
        // Laya.Vector3.lerp(this.obj.transform.position,aP,0.5,aP);
    }
    smoothCameraSize(close:boolean)
    {
        Laya.Tween.clearAll(this.camera);
        if(close)
        {
            if(this.camera.fieldOfView != 60)
            Laya.Tween.to(this.camera,{fieldOfView:60},1000,Laya.Ease.cubicInOut);
        }
        else{
            if(this.camera.fieldOfView != 70)
            Laya.Tween.to(this.camera,{fieldOfView:70},1000,Laya.Ease.cubicInOut);
        }
    }
    cameraShake()
    {
        let time = 200;
        Laya.timer.clearAll(this);
        this.shakeVec = new Laya.Vector3;
        Laya.timer.frameLoop(2,this,()=>{
            time -= 16;
            if(time > 0)
            {
                this.shakeVec = new Laya.Vector3(0.5*(Math.random()-0.5),0.5*(Math.random()-0.5),0.5*(Math.random()-0.5));
            }
            else{
                Laya.timer.clearAll(this);
                this.shakeVec = new Laya.Vector3;
            }
        })
    }
    passAnim()
    {
        Laya.Tween.clearAll(this);
        Laya.Tween.to(this.obj.transform,{localPositionX:0.23,localPositionY:1.2,localPositionZ:8*(SceneMgr.Instance.mapComp.usedLevel),localRotationEulerX:-25},1000,Laya.Ease.cubicOut);
    }
}