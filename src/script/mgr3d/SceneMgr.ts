import EventMgr from "../mgrCommon/EventMgr";
import MyLog from "../tools/MyLog";
import GameConfig from "../../GameConfig";
import UserData from "../models/UserData";
import Player from "../center/Player";
import Enemy from "../center/Enemy";
import MapManager from "./MapManager";
import Camera from "../center/Camera";
import SecondCamera from "../center/SecondCamera";
import Princess from "../center/Princess";

export default class SceneMgr {
    public static Instance: SceneMgr = new SceneMgr();

    public mainScene:Laya.Scene3D;
    public mainCamera:Laya.Camera;
    public mainLight:Laya.DirectionLight;

    public escapeObj:Laya.Sprite3D;
    public player:Laya.Sprite3D;
    public model:Laya.Sprite3D;
    public enemyPrefab:Laya.Sprite3D;
    //敌人种类
    public enemyColl:Laya.Sprite3D[] = [];
    //树的种类
    public treeColl:Laya.Sprite3D[] = [];
    //道具种类
    public itemColl:Laya.Sprite3D[] = [];
    // public manager:Laya.Sprite3D;
    public bullet:Laya.Sprite3D;
    public playerComp:Player;
    public map:Laya.Sprite3D;
    public mapComp:MapManager;
    public cameraComp:Camera;
    public qiangxiao:Laya.Sprite3D;
    public qipao:Laya.Sprite3D;
    public guang:Laya.Sprite3D;
    public baozi:Laya.Sprite3D;
    public kouArr:Laya.Material[] = [];
    public pifuzhanshi:Laya.Sprite3D;
    public xingxingArr:Laya.Material[] = [];
    public toumingArr:Laya.Material[] = [];

    public princess:Laya.Sprite3D;
    public princessComp:Princess;
    //重做
    public zhongdianNode:Laya.Sprite3D;
    public roadPart:Laya.Sprite3D;
    public otherLevel:Laya.Sprite3D;
    public chaodi:Laya.Sprite3D;
    //狂点专用
    public tank:Laya.Sprite3D;
    public emy:Laya.Sprite3D;

    public trySkinId:number = null;    //试用的皮肤

    InitMain(s:Laya.Scene3D){
        Laya.stage.addChildAt(s,0);
        this.mainScene = s;
        this.mainCamera = s.getChildByName("Main Camera") as Laya.Camera;
        this.mainLight = s.getChildByName("Directional Light") as Laya.DirectionLight;
        // //添加灯光投影
        // this.mainLight.shadow=true;
        // //产生投影的范围（如过小将不会产生投影）
        // this.mainLight.shadowDistance=45;
        // //生成阴影贴图数量
        // this.mainLight.shadowPSSMCount = 1;
        // //模糊等级,越大越高,效果更好，更耗性能
        // this.mainLight.shadowPCFType=1;
        // //投影质量
        // this.mainLight.shadowResolution=1024;

        // this.mainCamera.farPlane = 33; //可以考虑这样提高性能
        // //是否需要开启雾
        // this.mainScene.enableFog = true;
        // //设置雾化的颜色
        // this.mainScene.fogColor = ;
        // //设置雾化的起始位置，相对于相机的距离
        // this.mainScene.fogStart = 10;
        // //设置雾化最浓处的距离。
        // this.mainScene.fogRange = 20;
        this.pifuzhanshi = s.getChildByName("pifuzhanshi") as Laya.Sprite3D;
        this.qiangxiao = s.getChildByName("qiangxiao-") as Laya.Sprite3D;
        this.qipao = s.getChildByName("swqp") as Laya.Sprite3D;
        this.baozi = s.getChildByName("bz") as Laya.Sprite3D;
        // this.guang.active = false;
        this.player = s.getChildByName("player") as Laya.Sprite3D;
        //cscs
        // this.mainCamera = this.player.getChildByName("Main Camera") as Laya.Camera;
        this.model = s.getChildByName("model") as Laya.Sprite3D;
        let enemys = s.getChildByName("enemyColl") as Laya.Sprite3D;
        this.map = s.getChildByName("manager") as Laya.Sprite3D;
        // this.enemyColl = [];
        // for (let i = 0; i < enemys.numChildren; i++) {
        //     const element = enemys.getChildAt(i) as Laya.Sprite3D;
        //     element.active = false;
        //     this.enemyColl.push(element);
        // }
        //重做
        this.otherLevel = s.getChildByName("otherLevel") as Laya.Sprite3D;
        this.zhongdianNode = this.otherLevel.getChildByName("zhongdian") as Laya.Sprite3D;
        this.roadPart = this.otherLevel.getChildByName("roadUnit (11)") as Laya.Sprite3D;
        this.tank = s.getChildByName("pl_tank") as Laya.Sprite3D;
        this.emy = s.getChildByName("enemy") as Laya.Sprite3D;
        this.princess = this.zhongdianNode.getChildByName("princess") as Laya.Sprite3D;
        this.guang = this.zhongdianNode.getChildByName("guang") as Laya.Sprite3D;
        this.escapeObj = this.zhongdianNode.getChildByName("zhongdianxian") as Laya.Sprite3D;
        this.escapeObj.active = false;
        this.chaodi = this.otherLevel.getChildByName("chaodi (5)") as Laya.Sprite3D;
        let trees = s.getChildByName("treeColl") as Laya.Sprite3D;
        // this.treeColl = [];
        // for(let i = 0; i < trees.numChildren;i++)
        // {
        //     const e = trees.getChildAt(i) as Laya.Sprite3D;
        //     e.active = false;
        //     this.treeColl.push(e);
        // }
        let items = s.getChildByName("itemColl") as Laya.Sprite3D;
        // for(let i = 0; i < items.numChildren;i++)
        // {
        //     const e = items.getChildAt(i) as Laya.Sprite3D;
        //     e.active = false;
        //     this.itemColl.push(e);
        // }
        this.getObject(enemys,this.enemyColl);
        this.getObject(trees,this.treeColl);
        this.getObject(items,this.itemColl);
        this.enemyPrefab = s.getChildByName("enemy") as Laya.Sprite3D;
        this.bullet = s.getChildByName("bullet") as Laya.Sprite3D;
        this.playerComp = this.player.addComponent(Player) as Player;
        this.cameraComp = this.mainCamera.addComponent(Camera) as Camera;
        this.mapComp = this.map.addComponent(MapManager) as MapManager;
        this.princessComp = this.princess.addComponent(Princess) as Princess;

        this.getMaterials(s.getChildByName("kouMaterials") as Laya.MeshSprite3D,this.kouArr);
        this.getMaterials(s.getChildByName("xingxingMaterials") as Laya.MeshSprite3D,this.xingxingArr);
        this.getMaterials(s.getChildByName("toumingMaterials") as Laya.MeshSprite3D,this.toumingArr);

        UserData.initiUser();
    }
    getMaterials(node:Laya.MeshSprite3D,arr:Laya.Material[])
    {
        // arr = [];
        let len = node.meshRenderer.materials.length;
        for(let i = 0; i < len;i++)
        {
            let mat = node.meshRenderer.materials[i];
            arr.push(mat);
        } 
        // console.log("suc",arr.length);
    }
    //实验：返回值，指定类型
    getObject(node:Laya.Sprite3D,arr:Laya.Sprite3D[])
    {
        for(let i = 0 ; i < node.numChildren;i++)
        {
            let child = node.getChildAt(i) as Laya.Sprite3D;
            arr.push(child);
        }
    }

    getSingleObj(arr:Laya.Sprite3D[]):Laya.Sprite3D
    {
        let len = arr.length;
        let index = Math.floor(Math.random()*len);
        return Laya.Sprite3D.instantiate(arr[index]) as Laya.Sprite3D;
    }
    //道具0.3盾牌0.1枪0.1车0.5
    getItem(arr:Laya.Sprite3D[]):Laya.Sprite3D
    {
        let random = Math.random();
        let index = 0;
        if(random <0.3)
        {
            index = Math.floor(Math.random()*2);
        }
        else if(random < 0.4)
        {
            index = 2;
        }
        else if(random < 0.5)
        {
            index = Math.floor(Math.random()*4) + 3;
        }
        else{
            index = Math.floor(Math.random()*4) + 7;
        }
        return Laya.Sprite3D.instantiate(arr[index]) as Laya.Sprite3D;
    }
    getSingleTree():any
    {
        let len = this.treeColl.length;
        let index = Math.floor(Math.random()*len);
        let y = this.treeColl[index].transform.localPositionY;
        let one = Laya.Sprite3D.instantiate(this.treeColl[index]) as Laya.Sprite3D;
        let data = {
            obj:one,
            yPos:y,
        }
        return data;
    }

    public TrySkin(id:number){
		this.trySkinId = id;
	}

	public ClearTrySkin(){
		this.trySkinId = null;
	}

    UseSkin(id:number){
        UserData.curSelectViewId = id;
    }

    //------------商店--------------
    public shopScene:Laya.Scene3D;

    InitShop(s:Laya.Scene3D){
        this.shopScene = s;
    }

    ShowShopSkin(name:string){

    }
}