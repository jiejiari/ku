import game from "../Game/game";
import tankMe from "../Game/tankMe";
import MapManager from "./MapManager";

const {ccclass, property} = cc._decorator;

export enum GameStatus{
    None,
    Wait,
    Pause,
    Play,
    Pass,
    Over
}

@ccclass
export default class GameMgr{

    public mapComp:MapManager;
    public playerComp:tankMe;
    //界面
    public uiGame:game;
    
    //游戏数据
    //排名
    public rank:number = 1;
    //击杀
    public killed:number = 0;
    //可以弹出全屏2
    public show2:boolean = true;

    public static readonly Instance:GameMgr = new GameMgr();
    public gameStatus:GameStatus = GameStatus.None;

    init()
    {
        this.gameStatus = GameStatus.Wait;
    }

    gameStart()
    {
        this.gameStatus = GameStatus.Play;
        this.uiGame.init();
        this.mapComp.init(1);
        this.resetRankData();
    }
    gamePass()
    {
        this.gameStatus = GameStatus.Pass;
    }
    gamePause()
    {
        this.gameStatus = GameStatus.Pause;
    }
    gameContinue()
    {
        this.gameStatus = GameStatus.Play;
    }
    gameOver()
    {
        this.gameStatus = GameStatus.Over;
    }
    gameRelive()
    {
        this.gameStatus = GameStatus.Play;
        this.playerComp.relive();
        this.uiGame.resumeTimer();
    }

    resetRankData()
    {
        this.rank = this.mapComp.tankAll + 1;
        this.killed = 0;
    }
}
