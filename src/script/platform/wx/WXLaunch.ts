import ConfigData from "../../models/ConfigData";
import SoundMgr from "../../mgrCommon/SoundMgr";
import SceneMgr from "../../mgr3d/SceneMgr";
import ViewMgr from "../../mgrCommon/ViewMgr";
import MyUtils from "../../tools/MyUtils";
import EventMgr from "../../mgrCommon/EventMgr";
import PlatformMgr from "../../mgrCommon/PlatformMgr";
import HttpMgr from "../../mgrCommon/HttpMgr";
import MyLog from "../../tools/MyLog";
import UserData from "../../models/UserData";
import GameMgr from "../../mgr3d/GameMgr";

export default class WXLaunch extends Laya.Script {
    private progress: number = 0;
    // private proLabel: Laya.Label;
    private pro: Laya.Image;
    // private netMsg:Laya.Image;
    private closeButton:Laya.Image;
    private scene3dUrl:string = "res3d/Conventional/game.ls";
    private shop3dUrl:string = "res3d/shop/shop.ls";

    private jsonRes:string[] = [
        // "level"
    ];

    onEnable(): void {
        (this.owner as Laya.View).height = Laya.stage.height;
        var group: Laya.Image = this.owner.getChildByName("progressGroup") as Laya.Image;
        this.pro = group.getChildByName("progress") as Laya.Image;
        // this.proLabel = group.getChildByName("proLab") as Laya.Label;
        // this.netMsg = this.owner.getChildByName("netMsg") as Laya.Image;
        // this.netMsg.visible = false;
        // this.closeButton = this.netMsg.getChildByName("closeButton") as Laya.Image;

        this.LoadRemoteRes();
        this.loadRes();
    }

    private LoadRemoteRes(){
        this.jsonRes.forEach(element => {
           ConfigData.RequestConfig(element);
        });
    }

    private loadRes() {
        var resource: Array<any> = [
            { url: "res/atlas/common.atlas", type: Laya.Loader.ATLAS },
            { url: "res/atlas/game.atlas", type: Laya.Loader.ATLAS },
            { url: "res/atlas/mainview.atlas", type: Laya.Loader.ATLAS },
            { url: "res/atlas/numberFonts.atlas", type: Laya.Loader.ATLAS },
            { url: "res/atlas/rank.atlas", type: Laya.Loader.ATLAS },
            { url: "res/atlas/reward.atlas", type: Laya.Loader.ATLAS },
            { url: "res/atlas/skinShop.atlas", type: Laya.Loader.ATLAS },
            //{ url: "res/language/" + ConfigData.language + ".json", type: Laya.Loader.JSON },
        ];

        this.jsonRes.forEach(element => {
            resource.push({url:"res/json/"+element+".json", type:Laya.Loader.JSON});
        });

        var self = this;
        if (Laya.Browser.onMiniGame) {
            var loadTask: any = window["wx"].loadSubpackage({
                name: 'res3d', // name 可以填 name 或者 root
                success: (res) => {
                    // 分包加载成功后通过 success 回调
                    var loadTask1: any = window["wx"].loadSubpackage({
                        name: 'res', // name 可以填 name 或者 root
                        success: (res) => {
                            // 分包加载成功后通过 success 回调
                            Laya.loader.load(resource, Laya.Handler.create(this, () => {
                                self.updateProgress(0.99);
                                this.loadResComplete()
                            }), Laya.Handler.create(this, (res) => {
                                self.updateProgress(0.6 + res * 0.4)
                            }));
                        },
                        fail: (res) => {
                            // 分包加载失败通过 fail 回调时强行重新加载资源，这样才能进游戏
                            this.loadRes();
                        }
                    });
                    loadTask1.onProgressUpdate(res => {
                        self.updateProgress(0.3 + res.progress * 0.003)
                    });
                },
                fail: (res) => {
                    // 分包加载失败通过 fail 回调
                    this.loadRes();
                }
            });

            loadTask.onProgressUpdate(res => {
                self.updateProgress(res.progress * 0.003)
            });
        } else {
            Laya.loader.load(resource, Laya.Handler.create(this, () => {
                self.updateProgress(0.99);
                this.loadResComplete()
            }), Laya.Handler.create(this, (res) => {
                self.updateProgress(res)
            }));
        }

        Laya.timer.once(10000,this,()=>{
            // self.netMsg.visible = true;
            self.closeButton.on(Laya.Event.CLICK, self, ()=>{
                // self.netMsg.visible = false;
                self.closeButton.offAll();
               
            });
        });
    }

    private loadResComplete() {
        
        //本地游戏数据配置
        this.jsonRes.forEach(element => {
            ConfigData.initConfigData(element, Laya.Loader.getRes("res/json/"+element+".json"));
        });
        //语言文件
        //ConfigData.languageData = Laya.Loader.getRes("res/language/" + ConfigData.language + ".json");
        // Laya.Scene3D.load(this.shop3dUrl, Laya.Handler.create(this, this.OnShop3DResLoadComplete));
        this.OnShop3DResLoadComplete();
    }

    private OnShop3DResLoadComplete(scene?: Laya.Scene3D) {
        SceneMgr.Instance.InitShop(scene);
        Laya.Scene3D.load(this.scene3dUrl, Laya.Handler.create(this, this.On3DResLoadComplete));
    }

    private On3DResLoadComplete(scene?: Laya.Scene3D) {
        this.updateProgress(1);
        
        if (Laya.Browser.onMiniGame) {
            Laya.MiniAdpter.sendAtlasToOpenDataContext("res/atlas/rank.atlas"); //使用接口将图集透传到子域
        }
        PlatformMgr.callAPIMethodByProxy("setOpenDomainOffset");
        SoundMgr.instance.playBGM();
        SceneMgr.Instance.InitMain(scene);
        GameMgr.Instance.Init();
        EventMgr.instance.emit("goHome");
    }

    /**
		 * 更新资源加载进度
		 */
    public updateProgress(progress): void {
        this.progress = progress > 1 ? 1 : progress;
        //最高100%进度
        if (this.progress >= 1) {
            // Laya.Tween.clearAll(this.pro);
            // this.proLabel.text = "游戏加载完毕，即将进入游戏...";
            this.pro.width = 500;
            Laya.timer.frameOnce(2, this, () => {
                this.owner.destroy();
                Laya.loader.clearRes("loading/loading.atlas");
                this.destroy();
            })

        } else {
            this.pro.width = 500 * this.progress;
            // Laya.Tween.clearAll(this.pro);
            // Laya.Tween.to(this.pro,{width:500 * this.progress},100,Laya.Ease.linearNone)
            //进度增加
            //this.proLabel.text = "资源加载中..." + Math.floor(this.progress * 100) + "%";
        }
    }
}