
export enum ProgressType {
    HORIZONTAL=0,
    VECTIACAL,
    RADIAN
}

export default class UIProgress extends Laya.Script {
    /** @prop {name:_progress, tips:"当前比例", type:number, default:0.5}*/
    public _progress : number = 0.5;

    /** @prop {name:_type, tips:"进度条类型", type:ProgressType, default:0}*/
    public _type : number = ProgressType.HORIZONTAL;


    private _bar : Laya.Sprite = null;

    constructor() { super(); }

    onAwake(){
        this._bar = this.owner.getChildByName('bar') as Laya.Sprite;
        console.log('UIProgress:',this._progress,'type:',this._type);
    }

    public get progress(){
        return this._progress;
    }

    public set progress(v:number){
        this._progress = Math.max(Math.min(1,v),0);
        let node = (this.owner as Laya.Sprite)
        if(this._type == ProgressType.HORIZONTAL){
            this._bar.width = this._progress * node.width;
        } else if(this._type == ProgressType.VECTIACAL){
            this._bar.height = this._progress * node.height;
        } else if(this._type == ProgressType.RADIAN){

        }
    }
    
}