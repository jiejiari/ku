import { ui } from "../../../ui/layaMaxUI";
import UIProgress from "./UIProgress";
import Statics from "../ad/Statics";
import SceneMgr from "../../mgr3d/SceneMgr";
import GameMgr from "../../mgr3d/GameMgr";
import EventMgr from "../../mgrCommon/EventMgr";
import SoundMgr from "../../mgrCommon/SoundMgr";
import MathUtil from "../../tools/MathUtil";
import UserData from "../../models/UserData";
import BannerNode from "../ad/BannerNode";

export default class Login extends ui.LaunchUI {
    constructor(){super();}
    private sceneisLoad : boolean = false;
    private sdkisload : boolean = false;
    private appid:string = "wx93296c46035473d2";

    private progress:Laya.Image;
    private scene3dUrl:string = "res3d/Conventional/game.ls";
    onAwake(): void {
        this.width = Laya.stage.width;
        this.height = Laya.stage.height;
        this.progress = this.getChildByName("progressGroup").getChildByName("progress") as Laya.Image;
        Global.Data = {}
        // this.checkJoinScene();
        this.autoLogin()
        this.loadSubpackage();

        BannerNode.init();
        BannerNode.preload(4)

        
        Global.Event.on(GlobalEvent.API_VIDEO_SUCCESS,function(){
            Laya.Scene.open("AllFlows.scene",false);
        },this)
        Global.Event.on(GlobalEvent.API_VIDEO_FAIL,function(){
            Laya.Scene.open("AllFlows.scene",false,function(){
                Laya.Scene.open("AllFlows1.scene",false);
            });
        },this)
    }

    loadSubpackage(){
        // let progress = this.getChildByName('prossBg').getComponent(UIProgress) as UIProgress;
        let self = this;
        if(!Laya.Browser.onMiniGame){
            this.loadGameRes();
            return
        }
        console.log("开始加载分包");
        
        let thread = wx.loadSubpackage({
            name:"res",
            success:function(){
                console.log("分包加载成功，开始加载内存")
                // self.loadGameRes();
                //加载第二个分包
                let thread1 = wx.loadSubpackage({
                    name:"res3d",
                    success:()=>{
                        self.loadGameRes();
                    },
                    fail:()=>{
                        console.log("分包加载失败");
                        setTimeout(() => {
                            self.loadSubpackage();
                        }, 1000);
                    }
                });
                thread1.onProgressUpdate((res)=>{
                    self.updateProgress(res.progress * 0.5 + 0.5);
                })
            },
            fail:function(){
                console.log("分包加载失败，马上继续加载");
                setTimeout(() => {
                    self.loadSubpackage();
                }, 1000);
            }
        })
        thread.onProgressUpdate(function(res){
            self.updateProgress(res.progress + 0.5);
        })
    }

    //加载3D场景
    loadGameRes()
    {
        this.updateProgress(1);
        Laya.Scene3D.load(this.scene3dUrl, Laya.Handler.create(this, (scene) => {
            console.log("加载场景完");
            //添加场景
            // Laya.stage.addChildAt(scene, 0)
            //添加场景游戏脚本
            // scene.addComponent(SceneMgr);
            //cscs
            SceneMgr.Instance.InitMain(scene);
            GameMgr.Instance.Init();
            // SoundMgr.instance.playBGM();
            this.sceneisLoad = true;
            this.enterLobby();
            //cscs
            // UserData.testInitUser();
        }))
    }

    autoLogin() {
        let openid = Laya.LocalStorage.getItem('wei_openid');
        if (!!openid) {
            // Global.Platform.reportData({ type: 'login' });
            (Global.Platform.isWechat || Global.Platform.isQQ || Global.Platform.isWeb) && this.sdkLogin(openid, true)
        } else {
            Global.Platform.autoLogin((res) => {
                console.log('后台注册结果:--------------', res)
                Laya.LocalStorage.setItem('wei_openid', res.openid);
                // Global.Platform.reportData({ type: 'login' });
                (Global.Platform.isWechat || Global.Platform.isQQ || Global.Platform.isWeb) && this.sdkLogin(res.openid, false)
            })
        }
    }

    checkFinish(){
        if(this.sceneisLoad && this.sdkisload){
            Laya.Scene.open('scenes/GamePlay.scene',true);
            this.clearTimer(this,this.checkFinish);
        }
    }

    enterLobby(){
        // this.frameLoop(10,this,this.checkFinish);
        if(this.sceneisLoad && this.sdkisload){
            //cscs
            // Laya.Scene.open('scenes/GamePlay.scene',true);
            EventMgr.instance.emit("goHome");
            //cscs
            // this.clearTimer(this,this.checkFinish);
        }
    }

    sdkLogin(openid:string,isCache:boolean){
        let self = this;
        let option = Laya.Browser.onMiniGame ? wx.getLaunchOptionsSync() : {query:{},referrerInfo:{}};
        let referrerInfoAppId = option.query.channel ? option.query.channel : '';
        let version = Laya.Browser.onMiniGame ? wx['dataversion'] : '1.0.1';
        Statics.register(openid,referrerInfoAppId,version,function(err,res){
            if(res){
                if(Global.Platform.isWeb)
                {
                    Global.Data.isCheck = 1;
                    Global.Data.isClick = 1;
                    Global.Data.Channel = 1;
                    Global.Data.noShowUI = 1;
                }
                else{
                    Global.Data.isCheck = (self.canClick(Statics.channelName) && !parseInt(Statics.dictionary['isCheck']))?0:1;
                    Global.Data.isClick = (self.canClick(Statics.channelName) && !parseInt(Statics.dictionary['isClick']))?0:1;
                    Global.Data.Channel = self.canClick(Statics.channelName) ? 0 : 1;
                    Global.Data.noShowUI = (self.canClick(Statics.channelName) && !parseInt(Statics.dictionary['noShowUI']))?0:1;
                    console.log('是Wechat');
                }
                // Global.Data.isCheck = parseInt(Statics.dictionary['isCheck']) || 1;
                // Global.Data.isClick = parseInt(Statics.dictionary['isClick']) || 1;
                self.sdkisload = true;
                self.enterLobby();
                console.log('后台注册成功,isCheck:',Global.Data.isCheck,Global.Data.isClick)
            } else {
                self.sdkLogin(openid,false);
            }
        })
        // this.sdkisload = true;
        // this.enterLobby();
    }

    onDisable(): void {
        
    }
    updateProgress(percent:number)
    {
        this.progress.width = 500 * MathUtil.Clamp01(percent);
    }
    checkJoinScene(){
                if(Global.Platform.isWechat){
                    var option = wx.getLaunchOptionsSync();
                    let referrerInfoAppId = option.query.channel ? option.query.channel : '';
                    Global.Data.canClick = option.scene == 1037 || option.scene == 1089 || option.scene == 1001
                    console.log('canClick:',Global.Data.canClick,',来源:',option.scene,referrerInfoAppId)
                }
            }

    canClick(name)
    {
        let cname = localStorage.getItem('lastChannelName');
        if(!cname){
            name.length && localStorage.setItem('lastChannelName',name);
            return name.length > 0
        } else {
            return cname.length > 0
        }
    }
}