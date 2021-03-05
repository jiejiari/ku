import Statics from "../ad/Statics";



export default class FlowManager extends Laya.Script {
    /** @prop {name:sceneName, tips:"场景类型", type:String, default:""}*/
    public sceneName: string = "";
    /** @prop {name:line, tips:"固定横向数量", type:Number, default:-1}*/
    public line: number = -1;
    /** @prop {name:column, tips:"固定纵向数量", type:Number, default:-1}*/
    public column: number = -1;

    /** @prop {name:width, tips:"单个宽度 用来计算偏移", type:Number, default:100}*/
    public width: number = 100;
    /** @prop {name:height, tips:"单个高度 用来计算偏移", type:Number, default:100}*/
    public height: number = 100;

    /** @prop {name:spaceX, tips:"宽度间隔", type:Number, default:10}*/
    public spaceX: number = 10;
    /** @prop {name:spaceY, tips:"高度间隔", type:Number, default:10}*/
    public spaceY: number = 10;

    /** @prop {name:canelScene, tips:"取消后打开的场景", type:String, default:""}*/
    public canelScene: string = "";

    /** @prop {name:scrollY, tips:"直接滚动", type:Number, default:0}*/
    public scrollY: number = 0;

    /** @prop {name:anim, tips:"自动摇动", type:Boolean, default:false}*/
    public anim: boolean = false;

    private friendArr : Array<any> = null
    private scrollBar : Laya.ScrollBar = null;
    private pic : number = 1;
    constructor() { super(); }
    
    onEnable(): void {
        
        if(!this.onGetFlows()){
            Global.Event.on('flows',this.onGetFlows,this);
        }
    }

    onGetFlows(){
        let flows = Statics.flows;
        if(!flows){
            return false;
        }
        var friendArr:Array<any> = flows.filter(function(element){
            return element.sceneName == this.sceneName
        }.bind(this));
        this.friendArr = friendArr;
        // if(this.useList){
            let list = this.owner as Laya.List;
            let repeatX = friendArr.length,repeatY = 1;
            if(this.line != -1 && this.column != -1){
                repeatX = this.line
                repeatY = this.column
            } else if(this.line != -1){
                repeatX = this.line
                repeatY = Math.ceil(friendArr.length/repeatX)
            } else if(this.column != -1){
                repeatY = this.column
                repeatX = Math.ceil(friendArr.length/repeatY)
            }
            list.repeatX = repeatX;
            list.repeatY = repeatY;
            list.array = friendArr;
            list.spaceX = this.spaceX;
            list.spaceY = this.spaceY
            list.selectHandler = new Laya.Handler(this,this.onClickImg);
            list.selectEnable = true
            list.renderHandler = new Laya.Handler(this,this.onListRender);

            let overstepx = (this.width+this.spaceX) * list.repeatX > list.width+5
            let overstepy = (this.height+this.spaceY) * list.repeatY > list.height + 5
            console.log("overstepy:",repeatY,(this.height+this.spaceY) * list.repeatY,list.height)
            overstepx && (list.hScrollBarSkin = '');
            overstepy && (list.vScrollBarSkin = '');

            if(overstepx || overstepy){
                this.scrollBar = list.scrollBar;
                this.scrollBar.isVertical = overstepy
                // list.scrollB
                list.timerLoop(16,this,this.autoScroll)
            } else if(this.scrollY){
                list.vScrollBarSkin = ''
                this.scrollBar = list.scrollBar;
                this.scrollBar.isVertical = true
                list.timerLoop(16,this,this.autoScroll)
            }
        
        return true
    }
    onDestroy(){
        Global.Event.off('flows',this.onGetFlows,this);
    }
    onClickImg(arg){
        if(arg == -1){
            return;
        }
        console.log('onClick:',this.owner.scene.name);
        let d1 = this.friendArr[arg];
        let data = {
            fid : d1.fid,
            appId:d1.appId,
            path:d1.path,
            sceneName:d1.sceneName
        }
        FlowManager.navigateToMiniProgram(data,this.sceneName)
    
        let list = this.owner as Laya.List;
        list.selectedIndex = -1
    }

    static navigateToMiniProgram(data:any,sceneName:string){
        Statics.addFlowCount(data)
        if(Global.Platform.isWechat){
            wx.aldSendEvent && wx.aldSendEvent('点击导流',data)
        }
        let self = this
        if(Laya.Browser.onMiniGame){
            let options = {
                appId: data.appId,
                envVersion : 'release',
                path: data.path, 
                extraData:{},
                fail:function(){
                    console.log('跳转失败:')
                    if(sceneName != 'top' && sceneName != 'center'){
                        Laya.Scene.open('AllFlows1.scene',false);
                    }
                },
                success:function(){
                    console.log('跳转成功')
                    Statics.addFlowOpenCount(data)
                    wx.aldSendEvent && wx.aldSendEvent('打开导流',data)
                },
                complete:function(){
                    
                }
            }
            console.log('navigateToMiniProgram',options)
            wx.navigateToMiniProgram(options)
        } else {
            if(sceneName != 'top' && sceneName != 'center'){
                Laya.Scene.open('AllFlows1.scene',false);
            }
        }
    }

    autoScroll(){
        if(this.pic + this.scrollBar.value >= this.scrollBar.max || this.pic + this.scrollBar.value <= 0){
            this.pic *= -1
            let list = this.owner as Laya.List;
            list.clearTimer(this,this.autoScroll);
            list.timerOnce(2000,this,function(){
                list.timerLoop(16,this,this.autoScroll);
            })
        } else {
            this.scrollBar.value += this.pic
        }
    }
    onListRender(cell:any,index:number){
        let img = cell as Laya.Image;
        
        // 

        let icon = img.getChildByName('icon') as Laya.Image
        icon = (icon || img);
        //icon.skin = cell.dataSource.imgUrl
        let res = Laya.loader.getRes(cell.dataSource.imgUrl);
        if(res)
        {
            icon.source=res;
        }
        else
        {
            Laya.loader.load(cell.dataSource.imgUrl,new Laya.Handler(this,function(tex:Laya.Texture)
            {
                if(icon) icon.source=tex;
            }));
        }
        // icon.skin = cell.dataSource.imgUrl;
        // console.log('skin:',cell.dataSource.imgUrl)
        icon.width = this.width
        icon.height = this.height
        let name = img.getChildByName('name') as Laya.Label;
        if(name){
            name.text = cell.dataSource.showName;
        }
        let player = img.getChildByName('player') as Laya.Label;
        if(player){
            player.text = Math.floor(Math.random() * 100)+'万人在玩'
        }
        // if(this.anim && !cell.first){
        //     index % 2== 0 ? this.animItem(img) : this.owner.timerOnce(400,this,()=>{
        //         this.animItem(img);
        //     })
        // }
        if(this.anim && !cell.first){
            this.animItem(img)
        }
        let xinyou = img.getChildByName("xinyou") as Laya.Image;
        if(xinyou && !cell.first)
        {
            let x = xinyou.scaleX;
            let y = xinyou.scaleY;
            Laya.Tween.clearAll(this);
            let anim = ()=>{
                Laya.Tween.to(xinyou,{scaleX:x+0.2,scaleY:y+0.2},500,null,Laya.Handler.create(this,()=>{
                    Laya.Tween.to(xinyou,{scaleX:x,scaleY:y},500,null,Laya.Handler.create(this,()=>{
                        anim();
                    }))
                }))
            }
            anim();
        }

        cell.first = true;
    }

    animItem(img:Laya.Image){
        let self = this
        Laya.Tween.to(img,{rotation:5},100,null,new Laya.Handler(self,function(){
            Laya.Tween.to(img,{rotation:-5},200,null,new Laya.Handler(self,function(){
                Laya.Tween.to(img,{rotation:0},100,null,new Laya.Handler(self,function(){
                    Laya.Tween.to(img,{},400,null,new Laya.Handler(self,function(){
                        self.animItem(img);
                    }))
                }))
            }))
        }))
    }


    onDisable(): void {
    }
}