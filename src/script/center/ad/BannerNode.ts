export default class BannerNode extends Laya.Script {
    /** @prop {name:useOld, tips:"使用之前的", type:Boolean, default:false}*/
    public useOld: boolean = false;

    /** @prop {name:autoShow, tips:"自动显示", type:Boolean, default:true}*/
    public autoShow: boolean = true;

    /** @prop {name:alginBottom, tips:"对齐最下方", type:Boolean, default:true}*/
    public alginBottom: boolean = true;

    private static bannerCaches : any[] = [];
    private static preIndex : number = 0;

    private static currentName:string = '';
    private static showIndex : number = 0;
    public static lastShow : BannerNode = null;
    public static nodeQueue : Array<BannerNode> = [];
    private static bannerNameCalcelist : Array<string> = [];// 均分几个banner点击率

    static onBannerOnload(aUname:string,bannerad:any){
        this.bannerCaches.push(bannerad)
    }
    static onBannerError(aUname:string,bannerad:any,err:any){
        let idx = this.bannerCaches.indexOf(bannerad)
        if(this.bannerCaches[idx]){
            this.bannerCaches[idx].destroy();
            this.bannerCaches.splice(idx,1)
        }
        if(this.bannerNameCalcelist.indexOf(aUname) != this.bannerCaches.length-1){ //如果最后一个出错了，则不继续拉取
            setTimeout(() => {
                this.preload(1);
            }, 500);
        } else {
            console.log('最后一个banner拉取出错')
        }
    }

    static init(){
        if(!Global.Platform.isWechat){
            return
        }
        let cfg = Global.Platform['config'];
        let keys = Object.keys(cfg.banner)
        this.bannerNameCalcelist = keys.sort(function(a,b){return Math.random() - 0.5});
        Global.Event.on(GlobalEvent.API_BANNER_ONLOAD,this.onBannerOnload,this)
        Global.Event.on(GlobalEvent.API_BANNER_ERROR,this.onBannerError,this)
        // Global.Event.on('onResize',this.onBannerResize,this)
    }

    static preload(num:number) {
        if(!Laya.Browser.onMiniGame){
            return
        }
        var systemInfo = wx.getSystemInfoSync();
        let w = systemInfo.windowWidth
        let h = 200 / Laya.stage.height * systemInfo.screenHeight
        let cfg = Global.Platform['config'];
        let keys = Object.keys(cfg.banner)
        let max = Math.min(num+this.preIndex,this.bannerNameCalcelist.length)
        for(let i=this.preIndex; i<max; i++){
            Global.Platform.showBanner(this.bannerNameCalcelist[i], w, h);;
        }
        this.preIndex = max%this.bannerNameCalcelist.length;
    }
    static getTopBanner(){
        return this.nodeQueue.length ? this.nodeQueue[this.nodeQueue.length-1] : null;
    }
    onAwake(){
        BannerNode.nodeQueue.push(this);
    }

    onEnable(){
        if (this.autoShow) {
            this.Show();
        } else {
            this.Hide()
        }
        let sp = this.owner as Laya.Image
        sp.skin = ''
    }

    onDisable(){
        console.log('banner ------------------ onDisable -------------------')
        this.autoShow = false;
        this.Hide();
        Global.Event.off(this)
        
    }

    onDestroy() {
        Global.Event.off(this)
        let idx = BannerNode.nodeQueue.indexOf(this)
        if(idx){
            BannerNode.nodeQueue.splice(idx,1);
        }
        let scr = BannerNode.getTopBanner();
        if(scr && scr.autoShow){ //如果节点未隐藏，则要刷新之前的banner
            scr.Show();
        }
    }

    private _showLoop(){
        if (Laya.Browser.onMiniGame && Object.keys(BannerNode.bannerCaches).length) {
            // this.unscheduleAllCallbacks()
            if(BannerNode.currentName){
                if(BannerNode.bannerCaches[BannerNode.currentName]){
                    BannerNode.bannerCaches[BannerNode.currentName].hide();
                }
            }

            let keys = Object.keys(BannerNode.bannerCaches);
            BannerNode.currentName = this.useOld ? '0' :  ''+Math.min(BannerNode.showIndex,keys.length-1);
            let banner = BannerNode.bannerCaches[BannerNode.currentName]
            console.log('keys:',keys,BannerNode.currentName);
            banner.show();
            this.owner.clearTimer(this,this._showLoop);
            // Global.Platform.bannerAD.show();
            var systemInfo = wx.getSystemInfoSync();
            let node = this.owner as Laya.Image
            let bannerSize = banner.style;
            node.width = bannerSize.realWidth / systemInfo.screenWidth * Laya.stage.width;
            node.height = bannerSize.realHeight / systemInfo.screenHeight * Laya.stage.height

            let dx = 0, dy = 0;
            if (node.x + node.width > Laya.stage.width) {
                dx += Laya.stage.width - node.width - node.x
            }
            if (node.y + node.height > Laya.stage.height) {
                dy += Laya.stage.height - node.height - node.y
            }
            let pos = {x:node.x,y:node.y}

            let x = (pos.x + dx) * systemInfo.screenWidth / Laya.stage.width
            var y = (pos.y + dy) * systemInfo.screenHeight / Laya.stage.height
            banner.style.left = x;
            banner.style.top = this.alginBottom ? systemInfo.screenHeight -bannerSize.realHeight : systemInfo.screenHeight - y;
            node.y =  banner.style.top / systemInfo.screenHeight * Laya.stage.height
            Global.Event.emit('bannerresize')
            
            BannerNode.showIndex = (BannerNode.showIndex+1)%BannerNode.bannerCaches.length;
            BannerNode.lastShow = this;
        }
    }

    Show() {
        this.autoShow = true;
        this.owner.frameLoop(1,this,this._showLoop);
    }
    Hide() {
        console.log('BannerNode Hide:',BannerNode.currentName);
        
        if(this.useOld){
            if(BannerNode.bannerCaches[0]){
                BannerNode.bannerCaches[0].destroy();
                BannerNode.bannerCaches.splice(0,1);
            }
            BannerNode.preload(1)
        } else {
            if(BannerNode.currentName){
                if(BannerNode.bannerCaches[BannerNode.currentName]){
                    BannerNode.bannerCaches[BannerNode.currentName].hide();
                }
            }
        }
        BannerNode.currentName = ''
        BannerNode.lastShow = null;
    }
}