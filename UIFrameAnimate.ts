const {ccclass, property,inspector,executeInEditMode,playOnFocus} = cc._decorator;
import menu = cc._decorator.menu;

@ccclass
// @inspector("packages://cc-spriteframes/UIFrameAnimate.js")
@menu("公共组件/FrameAnimate")
@executeInEditMode
@playOnFocus
export default class UIFrameAnimate extends cc.Component {
    @property
    public get preview(){return this._preview;}
    public set preview(v){this._preview=v; CC_EDITOR && this.__editor_update()}
    @property
    _preview : boolean = false;

    @property(cc.Sprite)
    sprite : cc.Sprite = null;

    @property([cc.SpriteFrame])
    Frames : cc.SpriteFrame[] = [];

    @property
    public autoPlay : boolean = true;
    @property
    public delayTime : number = 0.15;
    @property
    public repeat : number = -1;
    @property
    public autoRemove : boolean = false;

    @property
    public followGame : boolean = true; //如果Game存在，则会判断Game.isRuning

    public static gameRuning : boolean = true;

    public isRun : boolean = false;
    public runtime : number = -1;
    public index : number = -1;

    private timeScale : number = 1;

    private endCB : Function = null;
    private stepCB : Function = null;
    private loadname : string = null;
    private loadBegin : number = null;
    private loadEnd : number = null;

    onLoad () {
        this.runtime = 0;
        this.isRun = false;
        this.index = -1;
        this.loadstart();
    }

    loadstart (){
        if(this.autoPlay){
            if(this.Frames.length > 0){
                this.startAnimate(this.repeat);
            }
        }
    }

    private __editor_update(){
        this._preview && this.startAnimate(this.repeat);
    }

    loadFrames(atlas:cc.SpriteAtlas,name:string,begin:number,end:number){
        this.loadname = name;
        this.loadBegin = begin;
        this.loadEnd = end;
        this.Frames.splice(0,this.Frames.length);
        for(var i=begin; i<end; i++){
            this.Frames.push(atlas.getSpriteFrame(name+i))
        }
    }

    loadFramesSplit(atlas:cc.SpriteAtlas,name:string,list:string){
        this.loadname = name;

        var arr = list.split(',');
        if(list.length <= 1){
            console.warn('没有可播放的精灵帧')
            return
        }
        this.loadBegin = parseInt(arr[0]);
        this.loadEnd = parseInt(arr[arr.length-1]);
        this.Frames.splice(0,this.Frames.length);
        for(var i=0; i<arr.length; i++){
            this.Frames.push(atlas.getSpriteFrame(name+arr[i]))
        }
    }

    addFrame(sf:cc.SpriteFrame){
        this.Frames.push(sf)
    }

    startAnimate(repeat:number=-1,cb?:Function,stepcb?:Function){
        this.endCB = cb
        this.stepCB = stepcb
        this.index = -1;
        this.isRun = true;
        this.repeat = repeat ? repeat :-1
        if(!this.sprite){
            this.sprite = this.node.getComponent(cc.Sprite)
            !this.sprite && cc.error('startAnimate null',this.node.uuid)
        }
        this.sprite.spriteFrame = this.Frames[0];
    }

    stop(){
        this.isRun = false;
    }
    resume(){
        this.isRun = true;
    }

    setDelayTime(time:number){
        this.delayTime = time;
        this.runtime = this.delayTime;
    }
    /** 速度比例，值越大，播放速度越快 */
    setTimeScale(t:number){
        this.timeScale = t;
    }

    reset(){
        this.isRun = false;
        this.index = -1;
        this.Frames = []
    }

    
    private updateFrame(){
        // cc.log("SpriteAnimate : ",this.index);
        this.index += 1;
        this.stepCB && this.stepCB(this.index)
        if(this.index == this.Frames.length){
            if(this.repeat != -1){
                this.repeat -- ;
            }
            if(this.repeat >0 || this.repeat == -1){
                this.index = this.index % this.Frames.length;
            }
            if(this.repeat == 0){
                this.isRun = false;
                this.endCB && this.endCB(this);
                if(this.autoRemove){
                    this.node.destroy();
                }
                
                return;
            }
        }

        this.sprite.spriteFrame = this.Frames[this.index];
    }
    update (dt:number) {
        if(CC_EDITOR && !this._preview){
            return
        }
        if(this.followGame && !UIFrameAnimate.gameRuning){
            return
        }
        dt *= cc.director.getScheduler().getTimeScale();
        if(this.isRun){
            if(this.runtime < 0 ){
                this.runtime += this.delayTime / this.timeScale;
                this.updateFrame();
                return;
            }
            this.runtime -= dt;
        }
    }
}
let a :any = window;

a.UIFrameAnimate = UIFrameAnimate