import BaseView from "../../views/BaseView";
import UserData from "../../models/UserData";
import SceneMgr from "../../mgr3d/SceneMgr";
import EventMgr from "../../mgrCommon/EventMgr";
import ViewMgr from "../../mgrCommon/ViewMgr";
import SoundMgr from "../../mgrCommon/SoundMgr";



export default class Skin111 extends BaseView
{
    // protected ryw__krqMain : ryw_KRQ_Main = null;

    protected ryw__centerZone : Laya.Clip = null;
    private fnt_myCoin:Laya.FontClip;
    private btn_close:Laya.Button;
    private btn_unlock:Laya.Image;
    private icon_shipin:Laya.Image;
    private icon_jinbi:Laya.Image;
    private lbl_coin:Laya.Label;
    private bg:Laya.Image;
    private itemArray:Laya.Image[];
    private bg_coin:Laya.Image;
    private fnt_price:Laya.FontClip;
    // private img_success:Laya.Image;

    private selectIndex:number = -1;
    private roleScene: Laya.Scene3D;
    private _plRole: Laya.Panel;
    //总物体的数组
    private pifuArray:Laya.Sprite3D[] = [];
    private inGame:boolean = false;
    //每隔一个金币上升一百,视频上升1
    private pifuInfo = [];

    onAwake()
    {
        super.onAwake();

        // this.ryw__krqMain = this.ryw_View.getChildByName("KRQ_Main").getComponent(ryw_KRQ_Main);
        // this.ryw__centerZone = this.ryw_View.getChildByName("CenterZone") as Laya.Clip;

        // this.img_success = this.ryw__centerZone.getChildByName("img_success") as Laya.Image;
        // this.img_success.visible = false;
        this.fnt_myCoin = this.owner.getChildByName("coinPanel").getChildByName("coinNum") as Laya.FontClip;
        this._plRole = this.owner.getChildByName("shopInfo") as Laya.Panel;
        this.bg = this.owner.getChildByName("shopInfo").getChildByName("bg") as Laya.Image;
        this.itemArray = [];
        for(let i = 0; i < this.bg.numChildren - 2 ; i++)
        {
            let child = this.bg.getChildByName("item"+i) as Laya.Image;
            this.itemArray.push(child);
        }
        this.btn_close = this.owner.getChildByName("shopInfo").getChildByName("btn_close") as Laya.Button;
        this.btn_unlock = this.bg.getChildByName("btn_unlock") as Laya.Image;
        this.icon_jinbi = this.btn_unlock.getChildByName("icon_jinbi") as Laya.Image;
        this.icon_shipin = this.btn_unlock.getChildByName("icon_shipin") as Laya.Image;
        this.lbl_coin = this.btn_unlock.getChildByName("lbl_coin") as Laya.Label;

        let item = localStorage.getItem("shipin") || "{}";
        this.pifuInfo = JSON.parse(item);
        console.log(this.pifuInfo,"asdasda");
        if(Object.keys(this.pifuInfo).length == 0)
        this.pifuInfo = [];

        var aspectRatio = Laya.stage.width / Laya.stage.height;
        // if(aspectRatio  < 0.5)
        // {
        //     if(ryw_Utilit.ryw_isIphoneX())
        //     {
        //         this.ryw__centerZone.top =  this.ryw__centerZone.top + 75;
        //     }
        // }
        // else
        // {
        //     // this.ryw__centerZone.top =  this.ryw__centerZone.top - 200;
        //     if(ryw_Utilit.ryw_isIphoneX())
        //     {
        //         this.ryw__centerZone.top =  this.ryw__centerZone.top + 75;
        //     }
        // }
    }

    onStart()
    {
        super.onStart();
        //cs
        // UserData.addMoney(1000000);
        this.updateMoney();
    }
    onEnable()
    {
        super.onEnable();
    }
    onDisable()
    {
        super.onDisable();
    }

    addEvent()
    {
        for(let i = 0; i < this.itemArray.length;i++)
        {
            this.itemArray[i].on(Laya.Event.CLICK,this,this.select,[i]);
        }
        this.btn_unlock.on(Laya.Event.CLICK,this,this.unlock);
        // this.btn_close.on(Laya.Event.CLICK,this,this.close);
        this.btn_close.clickHandler = new Laya.Handler(this,this.close)
        super.addEvent();
    }

    removeEvent()
    {
        for(let i = 0; i < this.itemArray.length;i++)
        {
            this.itemArray[i].on(Laya.Event.CLICK,this,this.select);
        }
        this.btn_unlock.off(Laya.Event.CLICK,this,this.unlock);
        this.btn_close.off(Laya.Event.CLICK,this,this.close);
        super.removeEvent();
    }
    openView(data?:any)
    {
        super.openView(data);
        if(data && data.inGame)
        {
            this.inGame = true;
        }
        else{
            this.inGame = false;
        }
        
        if(UserData.curUsedItem == -1)
        {
            //解锁默认皮肤
            UserData.curUsedItem = 0;
            UserData.unlockItem(0);
        }
        for(let i = 0;i < this.itemArray.length;i++)
        {
            for(let j = 0;j < UserData.getItemUnlocked().length;j++)
            {
                //已解锁
                if(i == UserData.getItemUnlocked()[j])
                {
                    this.showLock(this.bg.getChildAt(i),false);
                }
            }
        }

        //添加3d物体
        this.create3DScene();
        this.select(UserData.curUsedItem);
    }
    select(index:number)
    {
        if(this.selectIndex == index) return;
        this.selectIndex = index;
        //高亮
        // for(let i = 0;i < 8;i++)
        // {
        //     if(this.selectIndex == i)
        //     {
        //         (this.bg.getChildAt(i).getChildByName("img_select") as Laya.Image).visible = true;
        //     }
        //     else{
        //         (this.bg.getChildAt(i).getChildByName("img_select") as Laya.Image).visible = false;
        //     }
        // }
        //设置皮肤显示
        for(let i = 0;i < this.pifuArray.length;i++)
        {
            if(index == i)
            {
                this.pifuArray[i].active = true;
            }
            else{
                this.pifuArray[i].active = false;
            }

        }
        if(UserData.itemIsUnlocked(this.selectIndex))
        {
            UserData.curUsedItem = this.selectIndex;
            this.btn_unlock.visible = false;
        }
        else{
            this.btn_unlock.visible = true;
            //灰图
            this.changeColor(false);
            if(index%2==0)
            {
                //看视频
                this.icon_jinbi.visible = false;
                this.icon_shipin.visible = true;
                let ci = this.checkVideoTime(index);
                this.lbl_coin.text = ci + "/" + index + "";
            }
            else{
                //金币
                this.icon_jinbi.visible = true;
                this.icon_shipin.visible = false;
                let money = 100 * index;
                this.lbl_coin.text = money + "";
                if(UserData.getMoney() < money)
                {
                    this.changeColor(true);
                }
            }
        }

    }
    checkVideoTime(index:number)
    {
        //(a,b)a:索引，b:次数
        for(let i = 0; i < this.pifuInfo.length;i++)
        {
            if(this.pifuInfo[i][0] == index)
            {
                return this.pifuInfo[i][1];
            }
        }
        return 0;
    }
    addVideoTime()
    {
        for(let i = 0; i < this.pifuInfo.length;i++)
        {
            if(this.pifuInfo[i][0] == this.selectIndex)
            {
                this.pifuInfo[i][1] += 1;
                return this.pifuInfo[i][1];
            }
        }
        // console.log(this.pifuInfo,"pifu");
        this.pifuInfo.push([this.selectIndex,1]);
        return 1;
    }
    unlock()
    {
        // ryw_SoundMgr.ryw_instance.ryw_playSound("button");
        if(this.selectIndex%2==0)
        {
            //看完视频
            if(Laya.Browser.onMiniGame)
            {
                let self = this;
                Global.Platform.showRewardVideo("shop",function(){
                    self.videoCallback();
                });
            }
            else{
                this.videoCallback();
            }
        }
        else{
            let money = 200 + 300 * UserData.getItemUnlocked().length;
            if(UserData.getMoney() < money) return;
            UserData.subMoney(money);
            UserData.unlockItem(this.selectIndex);
            UserData.curUsedItem = this.selectIndex;
            // ryw_GameMgr.ryw_getInstance().ryw_saveGameData();
            UserData.saveData();
            this.updateMoney();
            //解锁成功
            // this.img_success.y = 500;
            // this.img_success.alpha = 1;
            // this.img_success.visible = true;
            // Laya.Tween.to(this.img_success,{y:300,alpha:0},500,null,Laya.Handler.create(this,()=>{
            //     this.img_success.visible = false;
            // }))
            this.showLock(this.bg.getChildAt(this.selectIndex),false);
            this.btn_unlock.visible = false;
        }
        
    }
    
    videoCallback()
    {
        let time = this.addVideoTime();
        localStorage.setItem("shipin",JSON.stringify(this.pifuInfo));
        console.log(localStorage.getItem("shipin"),"shji");
        if(time == this.selectIndex)
        {
            UserData.unlockItem(this.selectIndex);
            UserData.curUsedItem = this.selectIndex;
            UserData.saveData();
            this.showLock(this.bg.getChildAt(this.selectIndex),false);
            this.btn_unlock.visible = false;
        }
        else{
            this.lbl_coin.text = time + "/" + this.selectIndex;
        }
    }

    close()
    {
        // ryw_SoundMgr.ryw_instance.ryw_playSound("button");
        // if(this.inGame)
        // {
        //     let data = {
        //         revive:false,
        //     }
        //     ryw_ViewMgr.ryw_instance.ryw_openView(ryw_ViewDef.ryw_InGameView,data);
        //     if(!MyScene.instance.mapComp.newStart)
        //     {
        //         MyScene.instance.gameStatus = GameStatus.Execute;
        //     }
        // }
        // else{
        //     ryw_ViewMgr.ryw_instance.ryw_openView(ryw_ViewDef.ryw_MainView);
        // }
        // this.ryw_closeView();
        SceneMgr.Instance.playerComp.changeMat(UserData.curUsedItem);
        SoundMgr.instance.playSound("button");
        EventMgr.instance.emit("goHome");
        // (this.owner as Laya.Scene).close();
    }
    create3DScene()
    {
        let scene = this.owner.addChild(new Laya.Scene3D()) as Laya.Scene3D;
        this.roleScene = scene;

        let camera = scene.addChild(new Laya.Camera()) as Laya.Camera;
        scene.addChild(camera);
        let p = new Laya.Point(this._plRole.x, this._plRole.y);
        p = (this._plRole.parent as Laya.UIComponent).localToGlobal(p);
        camera.viewport = new Laya.Viewport(p.x, p.y-500, this._plRole.width, this._plRole.height);
        camera.transform.translate(new Laya.Vector3(0, 0.8, 2), false);
        camera.clearFlag = Laya.BaseCamera.CLEARFLAG_NONE;

        let light = scene.addChild(new Laya.SpotLight()) as Laya.SpotLight;
        light.transform.position = new Laya.Vector3(0, 3, 2);
        light.transform.localRotationEulerX = -50;
        light.spotAngle = 35;
        light.intensity = 3;

        this.pifuArray = [];
        for(let i = 0; i < 8;i++)
        {
            let one = Laya.Sprite3D.instantiate(SceneMgr.Instance.pifuzhanshi.getChildAt(i) as Laya.Sprite3D,scene);
            // if(i < 4)
            // {
            //     one.transform.position = new Laya.Vector3(0,0.5,0);
            // }
            // else
            {
                one.transform.position = new Laya.Vector3(0,0,0);
            }
            // one.transform.localScale = new Laya.Vector3(0.7,0.7,0.7);
            one.active = false;
            //烟灰缸
            // if(i != 3)
            // {
            //     one.getChildAt(1).active = false;
            // }
            this.pifuArray.push(one);
        }
    }
    updateMoney()
    {
        this.fnt_myCoin.value = UserData.getMoney() + "";
    }
    changeColor(isGray:boolean)
    {
        if(isGray)
        {
            //由 20 个项目（排列成 4 x 5 矩阵）组成的数组，灰图
            var grayscaleMat: Array<number> = [0.3086, 0.6094, 0.0820, 0, 0, 0.3086, 0.6094, 0.0820, 0, 0, 0.3086, 0.6094, 0.0820, 0, 0, 0, 0, 0, 1, 0];
            //创建一个颜色滤镜对象，灰图
            var grayscaleFilter:Laya.ColorFilter = new Laya.ColorFilter(grayscaleMat);
            this.btn_unlock.filters = [grayscaleFilter];
        }
        else
        {
            this.btn_unlock.filters = null;
        }
    }
    showLock(img:any,visible:boolean)
    {
        (img.getChildByName("img_suo") as Laya.Image).visible = visible;
    }
}