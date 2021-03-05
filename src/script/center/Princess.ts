import SceneMgr from "../mgr3d/SceneMgr";

export default class Princess extends Laya.Script{
   

    private obj:Laya.Sprite3D;
    private anim:Laya.Animator;
    private animName:string = "help";
    private arrow:boolean = false;
    constructor() {
        super();
        
    }

    onAwake()
    {
        this.obj = this.owner as Laya.Sprite3D;
        this.anim = this.obj.getComponent(Laya.Animator) as Laya.Animator;
    }
    
    playAnim(name:string,crossFade:boolean)
    {
        if(name == this.animName) return;
        if(crossFade)
        {
            this.anim.crossFade(name,0.2);
        }
        else{
            this.anim.play(name);
        }
        this.animName = name;
    }
    onUpdate()
    {

    }
    changeArrowState(active:boolean)
    {
        this.arrow = active;
    }
    activeArrow()
    {
        let img = new Laya.Image();
        let newPos = new Laya.Vector4;
        SceneMgr.Instance.mainCamera.worldToViewportPoint(SceneMgr.Instance.princess.transform.position,newPos);
        if(newPos.y > 0)
        {
            img.visible = false;
        }
        else{
            img.pos(newPos.x,20);
            img.visible = true;
        }
    }
}