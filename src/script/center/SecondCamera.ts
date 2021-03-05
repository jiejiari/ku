import SceneMgr from "../mgr3d/SceneMgr";

export default class SecondCamera extends Laya.Script {
    private camera:Laya.Camera;
    private obj:Laya.Sprite3D;
    private originalPos:Laya.Vector3;
    private offset:Laya.Vector3 = new Laya.Vector3;
    private updateOffset:boolean = false;
    private shakeVec:Laya.Vector3 = new Laya.Vector3;
    
    constructor() { super(); }
    
    onAwake()
    {
        this.camera = this.owner as Laya.Camera;
        this.obj = this.owner as Laya.Sprite3D;
        this.originalPos = this.obj.transform.localPosition.clone();
        Laya.Vector3.subtract(this.originalPos,SceneMgr.Instance.player.transform.position.clone(),this.offset);
    }
    onEnable(): void {
    }

    onDisable(): void {
    }
    onLateUpdate()
    {

        //cscs
        let pos = (SceneMgr.Instance.model as Laya.Sprite3D).transform.position;
        pos = new Laya.Vector3(pos.x,pos.y+2,pos.z);
        this.obj.transform.lookAt(pos,new Laya.Vector3(0,1,0),false);
        // let aP = new Laya.Vector3;
        // Laya.Vector3.add(this.offset,pos,aP);
        // Laya.Vector3.add(aP,this.shakeVec,aP);
        // this.obj.transform.position = aP;
        // Laya.Vector3.lerp(this.obj.transform.position,aP,0.5,aP);

        let pos1 = new Laya.Vector3;
        Laya.Vector3.add(this.originalPos,this.shakeVec,pos1);
        this.obj.transform.localPosition = pos1;
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
            if(this.camera.fieldOfView != 65)
            Laya.Tween.to(this.camera,{fieldOfView:65},1000,Laya.Ease.cubicInOut);
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
}