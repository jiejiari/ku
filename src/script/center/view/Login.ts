import { ui } from "../../../ui/layaMaxUI";
import UIProgress from "./UIProgress";
import Statics from "../ad/Statics";
import SceneMgr from "../../mgr3d/SceneMgr";
import GameMgr from "../../mgr3d/GameMgr";
import EventMgr from "../../mgrCommon/EventMgr";
import SoundMgr from "../../mgrCommon/SoundMgr";
import MathUtil from "../../tools/MathUtil";
import UserData from "../../models/UserData";

export default class Login extends ui.LaunchUI {
    constructor(){super();}
    private sceneisLoad : boolean = false;
    private sdkisload : boolean = false;

    private progress:Laya.Image;
    private scene3dUrl:string = "res3d/Conventional/game.ls";
    onAwake(): void {
        this.width = Laya.stage.width;
        this.height = Laya.stage.height;
        this.progress = this.getChildByName("progressGroup").getChildByName("progress") as Laya.Image;
        Global.Data = {}
        this.autoLogin()
        this.loadSubpackage();
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
            this.clearTimer(this,this.checkFinish);
        }
    }

    sdkLogin(openid:string,isCache:boolean){
        let self = this;
        let option = Laya.Browser.onMiniGame ? wx.getLaunchOptionsSync() : {query:{},referrerInfo:{}};
        let referrerInfoAppId = option.query.channel ? option.query.channel : '';
        let version = Laya.Browser.onMiniGame ? wx['dataversion'] : '1.0.50';
        Statics.register(openid,referrerInfoAppId,version,function(err,res){
            if(res){
                Global.Data.isCheck = parseInt(Statics.dictionary['isCheck']) || 0;
                Global.Data.isClick = parseInt(Statics.dictionary['isClick']) || 0;
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
}