import FlowManager from "./FlowManager";
import Statics from "../ad/Statics";

export default class FlowTeamChange extends Laya.Script {
    /** @prop {name:sceneName, tips:"场景类型", type:String, default:""}*/
    public sceneName: string = "";
    
    /** @prop {name:canelScene, tips:"取消后打开的场景", type:String, default:""}*/
    public canelScene: string = "";

    /** @prop {name:interval, tips:"刷新时间", type:Number, default:5}*/
    public interval: number = 5;

    /** @prop {name:anim, tips:"自动放大", type:Boolean, default:false}*/
    public anim: boolean = false;

    private friendArr : Array<any> = []
    private friendIndex : Array<number> = []
    private runTime : number = 0;
    private isReturn : boolean = false;

    onEnable(): void {
        let i=0;
        while(true){
            let chd = this.owner.getChildAt(i) as Laya.Image
            if(!chd){
                break
            }
            // chd.on(Laya.Event.CLICK,this,this.onClickImg,[i])
            let btn = chd.getChildByName('button') as Laya.Sprite
            btn && btn.on(Laya.Event.CLICK,this,this.onClickImg,[i])
            this.anim && (i %2 == 0 ? this.autoScale(chd) : this.owner.timerOnce(1500,this,()=>{
                this.autoScale(chd);
            }))
            
            let xinyou = chd.getChildByName("xinyou") as Laya.Image;
            if(xinyou)
            {
                let x = xinyou.scaleX;
                let y = xinyou.scaleY;
                let anim = ()=>{
                    Laya.Tween.to(xinyou,{scaleX:x+0.2,scaleY:y+0.2},500,null,Laya.Handler.create(this,()=>{
                        Laya.Tween.to(xinyou,{scaleX:x,scaleY:y},500,null,Laya.Handler.create(this,()=>{
                            anim();
                        }))
                    }))
                }
                anim();
            }
            i++
        }

        if(!this.onGetFlows()){
            Global.Event.on('flows',this.onGetFlows,this);
        }
    }

    onDestroy(){
        Global.Event.off('flows',this.onGetFlows,this);
    }

    onGetFlows(){
        let flows = Statics.flows;
        if(!flows){
            return false;
        }
        var friendArr:Array<any> = flows.filter(function(element){
            return element.sceneName == this.sceneName
        }.bind(this));
        this.friendArr = friendArr
    }
    updateChild(){
        let idxs = [];
        for(let i=0; i<this.friendArr.length; i++){
            idxs.push(i);
        }
        idxs.sort(function(a,b){
            return Math.random() - 0.5
        })
        // console.log("updateChild:",idxs)
        this.friendIndex = idxs;

        let i=0;
        while(true){
            let chd = this.owner.getChildAt(i) as Laya.Image
            if(!chd){
                break
            }
            let idx = idxs[i];
            if(i >= this.friendArr.length){
                break
            }
            let data = this.friendArr[idx];
            this.friendIndex.push(idx);
            let icon = (chd.getChildByName('icon') as Laya.Image) || chd
            let name = chd.getChildByName('name') as Laya.Label
            // chd.scaleX = 1;
            // chd.scaleY = 1;
            // Laya.Tween.clearAll(this);
            // Laya.Tween.to(chd,{scaleX:0.1,scaleY:0.1},1000,null,Laya.Handler.create(this,()=>{
            //     Laya.Tween.to(chd,{scaleX:1,scaleY:1},1000);
            // }));
            icon.skin = data.imgUrl
            if(name)
            name.text = data.showName + ""

            i++
        }
    }

    autoScale(img:Laya.Image){
        let self = this;
        Laya.Tween.to(img,{scaleX:1.2,scaleY:1.2},200,null,new Laya.Handler(null,function(){
            Laya.Tween.to(img,{scaleX:1,scaleY:1},200,null,new Laya.Handler(null,function(){
                Laya.Tween.to(img,{scaleX:1.2,scaleY:1.2},200,null,new Laya.Handler(null,function(){
                    Laya.Tween.to(img,{scaleX:1,scaleY:1},200,null,new Laya.Handler(null,function(){
                        Laya.Tween.to(img,{},3000,null,new Laya.Handler(null,function(){
                            self.autoScale(img);
                        }))
                    }))
                }))
            }))
        }))
    }

    onClickImg(arg,event:Laya.Event){
        event.stopPropagation()
        if(arg == -1){
            return;
        }
        
        let d1 = this.friendArr[this.friendIndex[arg]];
        console.log('onClick:',this.canelScene);
        let data = {
            fid : d1.fid,
            appId:d1.appId,
            path:d1.path,
            sceneName:d1.sceneName
        }
        FlowManager.navigateToMiniProgram(data,this.sceneName);
    }
    onUpdate(){
        if(this.isReturn){
            return;
        }
        let dt = Laya.timer.delta / 1000;
        this.runTime -= dt;
        if(this.runTime <= 0){
            this.updateChild();
            this.runTime = this.interval
            if(this.interval == 0){
                this.isReturn = true;
            }
        }
    }
}