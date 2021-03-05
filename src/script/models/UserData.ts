import MyUtils from "../tools/MyUtils";
import StorageMgr from "../mgrCommon/StorageMgr";


export class UserGameData
{
    public  levelNum: number = 1;//当前关卡
    public  moneyNum: number = 0;//金币数量
    public  crystalNum: number = 0;//钻石数量
    public  unlockedItem: Array<number> = [];//道具当前解锁的索引
    public  usedItem: number = -1;//当前使用的道具索引
    public  max_health: number = 10;//玩家最大血量
}

export default class UserData {
    public static code: string = "";//微信code
    public static openId: string = "";//微信openid
    public static sessionId: string = "";

    public static userId: any;
    public static nickName: string = "";
    public static gender:number = 0;
    public static avatarUrl: string = "";
    public static score: number = 0; //分数
    public static exp: number = 0;   //经验
    public static level: number = 1; //等级

    public static gold:number = 0;

    public static isNew: boolean = false;
    public static isLogin: boolean = false;
    public static channelId: any;

    public static fromImgid:any;
    public static fromAppid:any;

    public static adCount: number;//视频广告次数
    public static bannerTimes:number = 0 //banner刷新次数

    public static inviteShareCount:number = 0;
    public static curMultiple:number = 1;   //结算倍数
    public static allView:any = {};  //玩家所拥有的皮肤列表
    public static curSelectViewId:number = 1; //当前的选择的皮肤
    public static unlockingView:any = {}; //正在解锁的皮肤
    public static isGoldeggs = 2;//砸金蛋开关  1：需要弹出砸金蛋
    public static isAwardMoney:boolean = false;
    public static isNotification:boolean = false;
    public static isShare:boolean = false;
    //public static aladingStatus:boolean = false;

    //cscs
    public static isClickMore:boolean = false;

    private static readonly gameData : UserGameData = new UserGameData();

    public static saveData()
    {
        let str = UserData.getSaveData();
        localStorage.setItem("gameData",str);
    }

    public static getSaveData() : string
    {
        return JSON.stringify(UserData.gameData);
    }


    public static testInitUser()
    {
        UserData.gameData.levelNum = 1;
        UserData.gameData.moneyNum = 10000000;
        UserData.gameData.crystalNum = 0;
    }

    public static initiUser()
    {
        let data:any = localStorage.getItem("gameData");
        data = data || "{}";
        data = JSON.parse(data);
        if(data && 0 != data && Object.keys(data).length)
        {
            // Object.assign(this,data);
            UserData.gameData.levelNum = data.levelNum;
            UserData.gameData.moneyNum = data.moneyNum;
            UserData.gameData.crystalNum = data.crystalNum;
            //cs
            if(data.max_health)
            UserData.gameData.max_health = data.max_health;
            if(null != data.unlockedItem)
            {
                let unlockedItem : Array<number> =  data.unlockedItem;
                for(let i=0;i < unlockedItem.length;++i)
                {
                    UserData.gameData.unlockedItem.push(unlockedItem[i]);
                }
            }
            if(null != data.usedItem)
            {
                UserData.gameData.usedItem = data.usedItem;
            }
        }
        else
        {
            //todo：处理没有获取到玩家数据的情况
        }     
    }
    
    public static addHealth()
    {
        UserData.gameData.max_health++;
    }
    public static getHealth() : number
    {
        return UserData.gameData.max_health;
    }

    public static setLeveNum(levelNum : number)
    {
        UserData.gameData.levelNum = levelNum;
    }

    public static getLeveNum() : number
    {
        return UserData.gameData.levelNum;
    }

    public static addMoney(add : number)
    {
        add = Math.ceil(add)
        var last = UserData.gameData.moneyNum
        UserData.gameData.moneyNum += add;
        // ryw_EventMgr.ryw_instance.ryw_dispatch(ryw_EventDef.ryw_Game_OnUserMoneyChange,
        //     {
        //         curr : UserData.gameData.moneyNum,
        //         last : last
        //     })
    }
    public static subMoney(sub : number)
    {
        sub = Math.ceil(sub)
        var last = UserData.gameData.moneyNum
        UserData.gameData.moneyNum -= sub;
        if(UserData.gameData.moneyNum < 0)
        {
            UserData.gameData.moneyNum = 0;
        }
        // ryw_EventMgr.ryw_instance.ryw_dispatch(ryw_EventDef.ryw_Game_OnUserMoneyChange,
        //     {
        //         curr : UserData.gameData.moneyNum,
        //         last : last
        //     })
    }
    public static getMoney()
    {
        return UserData.gameData.moneyNum;
    }

    public static addCrystal(add : number)
    {
        add = Math.ceil(add)
        var last = UserData.gameData.crystalNum
        UserData.gameData.crystalNum += add;
        // ryw_EventMgr.ryw_instance.ryw_dispatch(ryw_EventDef.ryw_Game_OnUserCrystalChange,
        //     {
        //         curr : UserData.gameData.crystalNum,
        //         last : last
        //     })
    }
    public static subCrystal(sub : number)
    {
        sub = Math.ceil(sub)
        var last = UserData.gameData.crystalNum
        UserData.gameData.crystalNum -= sub;
        if(UserData.gameData.crystalNum < 0)
        {
            UserData.gameData.crystalNum = 0;
        }
        // ryw_EventMgr.ryw_instance.ryw_dispatch(ryw_EventDef.ryw_Game_OnUserCrystalChange,
        //     {
        //         curr : UserData.gameData.crystalNum,
        //         last : last
        //     })
    }
    public static getCrystal()
    {
        return UserData.gameData.crystalNum;
    }

    //获取当前商店解锁的道具
    public static getItemUnlocked() : Array<number>
    {
        let unlocked = new Array<number>();
        for (let i = 0; i < UserData.gameData.unlockedItem.length; ++i)  
        {
            unlocked.push(UserData.gameData.unlockedItem[i]);
        }
        return unlocked;
    }

    //商店道具是否解锁
    public static itemIsUnlocked(id : number) : boolean
    {
        for (let i = 0; i < UserData.gameData.unlockedItem.length; ++i)  
        {
            if(UserData.gameData.unlockedItem[i] == id)
            {
                return true;
            }
        } 
        return false;
    }

    //解锁商店道具
    public static unlockItem(id : number)
    {
        if(UserData.itemIsUnlocked(id))
        {
            console.log("商店重复解锁 id : ",id);
            return;
        }
        UserData.gameData.unlockedItem.push(id);
        // ryw_EventMgr.ryw_instance.ryw_dispatch(ryw_EventDef.Game_OnUserUnlockedStore,{unlocked : id})
    }

    //当前正在使用的道具
    public static get curUsedItem()
    {
        return UserData.gameData.usedItem;
    }
    //当前正在使用的道具
    public static set curUsedItem(value : number)  
    {
        UserData.gameData.usedItem = value;
    }
}