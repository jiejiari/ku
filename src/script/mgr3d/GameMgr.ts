import SceneMgr from "./SceneMgr";
import HttpMgr from "../mgrCommon/HttpMgr";
import StatisticsMgr from "../mgrCommon/StatisticsMgr";
import UserData from "../models/UserData";
import EventMgr from "../mgrCommon/EventMgr";
import { EventDefine } from "../mgrCommon/EventDefine";
import SoundMgr from "../mgrCommon/SoundMgr";

export default class GameMgr {
    public static readonly Instance: GameMgr = new GameMgr();

    //当前游戏状态
    public gameStatus:GameStatus;
    //复活次数
	public reviveCount:number;
    
	public Init():void{
		this.gameStatus = GameStatus.None;

		this.GamePrepare();
	}

  public GamePrepare():void{
        //启动
		SceneMgr.Instance.mapComp.init(false);
		
		this.gameStatus = GameStatus.Wait;
  }
    
  public GameStart():void{
		this.gameStatus = GameStatus.Execute;
		//临时方法
		EventMgr.instance.emit(EventDefine.PIC);
		HttpMgr.instance.StartGame();
		StatisticsMgr.instance.startGameStatistics();
  }

	public GameOver():void{
		this.gameStatus = GameStatus.Over;
	}

	public GameExit():void{
		this.gameStatus = GameStatus.None;
		this.GamePrepare();
  }
    
  public GameRestart():void{
		this.GameExit();
	}

	public GamePass():void{
		//cscs
		// UserData.level += 1;
		UserData.setLeveNum(UserData.getLeveNum()+1);
		UserData.saveData();
		this.gameStatus = GameStatus.Pass;
		SceneMgr.Instance.playerComp.activeRender(false);
		SceneMgr.Instance.cameraComp.passAnim();
		SoundMgr.instance.stopBGM();
		SoundMgr.instance.playSound("success");
		SceneMgr.Instance.princessComp.playAnim("dance",false);
		Laya.timer.once(2000, this, ()=>{
			EventMgr.instance.emit(EventDefine.PLAYER_PASS);
		});
	}
			
	public Dead():void{
		this.GameOver();
		SoundMgr.instance.stopBGM();
		SoundMgr.instance.playSound("fail");
		Laya.timer.once(1000, this, ()=>{
			EventMgr.instance.emit(EventDefine.PLAYER_DIE);
		});
	}

    public GameRevive():void{
		this.reviveCount += 1;
		SoundMgr.instance.playBGM();
		Laya.stage.on(Laya.Event.MOUSE_DOWN,this,this.TouchGame);
	}
    
	private TouchGame():void{
		Laya.stage.off(Laya.Event.MOUSE_DOWN,this,this.TouchGame);
		this.gameStatus = GameStatus.Execute;
	}
	
	public GameOverScore():number{
		return SceneMgr.Instance.mapComp.coinInLevel;
	}
}

//游戏状态
export enum GameStatus {
	None = 0,
	Wait,
	Execute,
	Pause,
	Pass,
	Over,
}