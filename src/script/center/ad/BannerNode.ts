
export default class BannerNode extends Laya.Script {
    /** @prop {name:aUnitName, tips:"广告名", type:String, default:"lobby"}*/
    public aUnitName: string = "lobby";

    /** @prop {name:autoShow, tips:"自动显示", type:boolean, default:true}*/
    public autoShow: boolean = true;

    /** @prop {name:alginBottom, tips:"对齐最下方", type:boolean, default:true}*/
    public alginBottom: boolean = true;

    private static bannerSize: any = null;

    static onStaticBannerShow(res: any) {
        this.bannerSize = res;
        Global.Platform.bannerAD.hide();
    }

    static preload(name?: string) {
        Global.Event.off(this);
        if (Global.Platform.isWechat || Global.Platform.isQQ) {
            let cfg = Global.Platform['config'];
            let idx = Math.floor(Math.random() * cfg.banner.length);
            Global.Event.off(this)
            if (Object.keys(cfg.banner).length) {
                var systemInfo = wx.getSystemInfoSync();
                let w = systemInfo.windowWidth
                let h = 200 / Laya.stage.height * systemInfo.screenHeight
                Global.Platform.showBanner(name || cfg.banner[idx], w, h)
                Global.Event.on('bannershow', this.onStaticBannerShow, this);
            }
        }
    }
    onStart(){
        if (this.aUnitName) {
            if (Global.Platform.bannerAD && BannerNode.bannerSize) {
                if (this.autoShow) {
                    this.Show();
                } else {
                    this.Hide()
                }
            } else {
                Global.Event.once('bannershow', this.onBannerShow, this);
            }
        }
        let sp = this.owner as Laya.Image
        sp.skin = ''
    }

    onDisable(){
        console.log('banner ------------------ onDisable -------------------')
        BannerNode.bannerSize = null;
        Global.Event.off(this)
        Global.Platform.destroyBanner(this.aUnitName);
        BannerNode.preload(this.aUnitName);
    }

    onDestroy() {
        Global.Event.off(this)
    }

    private _showLoop(){
        if (Laya.Browser.onMiniGame && Global.Platform.bannerAD && BannerNode.bannerSize) {
            // this.unscheduleAllCallbacks()
            this.owner.clearTimer(this,this._showLoop);
            Global.Platform.bannerAD.show();
            var systemInfo = wx.getSystemInfoSync();
            let node = this.owner as Laya.Image
            node.width = BannerNode.bannerSize.width / systemInfo.screenWidth * Laya.stage.width;
            node.height = BannerNode.bannerSize.height / systemInfo.screenHeight * Laya.stage.height

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
            console.log('BannerNode show:', pos, '->', x, y, BannerNode.bannerSize)
            Global.Platform.bannerAD.style.left = x;
            Global.Platform.bannerAD.style.top = this.alginBottom ? systemInfo.screenHeight - BannerNode.bannerSize.height : systemInfo.screenHeight - y;
            node.y =  Global.Platform.bannerAD.style.top / systemInfo.screenHeight * Laya.stage.height
            Global.Event.emit('bannerresize')
        }
    }

    Show() {
        this.autoShow = true;
        this.owner.frameLoop(1,this,this._showLoop);
    }
    Hide() {
        console.log('BannerNode Hide');
        Global.Platform.bannerAD && Global.Platform.bannerAD.hide();
    }

    private onBannerShow(res: { width: number, height: number }) {
        if (Laya.Browser.onMiniGame) {
            if (Global.Platform.bannerAD) {
                if (this.autoShow) {
                    this.Show();
                } else {
                    this.Hide()
                }
            }
        }
    }
}