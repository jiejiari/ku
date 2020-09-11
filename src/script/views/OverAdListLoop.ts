import MyUtils from "../tools/MyUtils";
import WXAPI from "../platform/wx/WXAPI";
import PlatformMgr from "../mgrCommon/PlatformMgr";


enum Direction {
    UP = 0,
    DOWN = 1,
}

export default class OverAdListLoop extends Laya.Script {
    private _cells: Array<MyRow>;
    private _spaceX: number;
    private _spaceY: number;

    private _itemWidth: number;
    private _itemHeight: number;

    private _repeatX: number;
    private _repeatY: number;

    private _mouseDown: boolean;

    private moveDirection: Direction;
    private startTime: number;

    private fristPosY: number;
    private endPosY: number;

    private _mouseY: number;
    private speedTime: number;

    private adInfos: any;

    private moveSpeed: number = 0.5;

    private viewHeight: number;



    constructor() {
        super();
        this._itemHeight = 244;
        this._itemWidth = 184;
        this._spaceX = 14;
        this._spaceY = 14;
        this._repeatX = 3;
        this._repeatY = 3;
        this.speedTime = 500;
        this.viewHeight = 503;
    }


    start(adInfos) {
        if (MyUtils.isNull(adInfos)) {
            return;
        }
        this.owner.removeChildren();
        this._cells = [];
        this.adInfos = adInfos;
        let col = 0; //从第0列开始
        let myRow = new MyRow();

        let self = this;
        for (var i = 0; i < self.adInfos.length; i++) {
            let adinfo = self.adInfos[i];
            let image: Laya.Image = new Laya.Image();
            this.owner.addChild(image);
            let y = this._cells.length * (this._itemHeight + this._spaceY);
            image.pos(col * (this._itemWidth + this._spaceX), y);
            image.skin = adinfo.param;
            image.width = this._itemWidth;
            image.height = this._itemHeight;

            image.on(Laya.Event.MOUSE_DOWN, this, () => {
                self.startTime = Laya.timer.currTimer;
            });
            image.name = i.toString();
            image.on(Laya.Event.MOUSE_UP, this, () => {
                let index = Number(image.name);
                let adinfo = self.adInfos[index];
                if (Laya.timer.currTimer - self.startTime <= 200) {
                    self.tiaozhuang(adinfo, 1003);
                }
                self.startTime = Laya.timer.currTimer;
            });

            col++;
            myRow._posY = y;
            myRow._cells.push(image);
            if (col > 2) {
                this._cells.push(myRow);
                col = 0;
                myRow = new MyRow();
            }
        }
        if (col != 0) {
            this._cells.push(myRow);
        }

        this.fristPosY = 0;
        this.endPosY = this.viewHeight - this._itemHeight;
        this.setDirtion(Direction.DOWN);
        this._mouseDown = false;
        this.autoMove();

        this.owner.on(Laya.Event.MOUSE_DOWN, this, this.mouseDown);
        this.owner.on(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
        this.owner.on(Laya.Event.MOUSE_UP, this, this.mouseUp);
        this.owner.on(Laya.Event.MOUSE_OUT, this, this.mouseUp);
        this.owner.on(Laya.Event.FOCUS_CHANGE, this, this.mouseUp);
    }

    autoMove() {
        Laya.timer.clearAll(this);
        Laya.timer.loop(10, this, () => {
            this.move();
        });
    }


    move() {
        let index = 0;
        let self = this;

        let distance = -(this._cells[0].getPosY() - this.fristPosY);
        let timer = Math.abs(this.speedTime / (this._itemHeight + this._spaceY) * distance);

        for (var i = 0; i < this._cells.length; i++) {
            let cell = this._cells[i];
            cell.setPosY(cell.getPosY() + this.moveSpeed);
        }
        if (this.moveDirection == Direction.DOWN && this._cells[0].getPosY() > this.fristPosY) {
            this.setDirtion(Direction.UP);
        }
        if (this.moveDirection == Direction.UP && this._cells[this._cells.length - 1].getPosY() < this.endPosY) {
            this.setDirtion(Direction.DOWN);
        }
    }

    setDirtion(dir: Direction) {
        this.moveDirection = dir;
        if (this.moveDirection == Direction.DOWN) {
            this.moveSpeed = 0.5;
        } else {
            this.moveSpeed = -0.5;
        }
    }


    public tiaozhuang(adInfo, positionIdx) {
        var _d: any = {
            my_uuid: positionIdx,
            to_appid: adInfo.appid,
            appid: adInfo.appid,
            toLinks: adInfo.toLinks,
        };
        _d.callback = ()=>{
            WXAPI.ald("结算页广告位跳出成功",{
                "path": adInfo.toLinks,
                "appId": adInfo.appid,
                "position": adInfo.position
            })
        }
        WXAPI.ald("结算页广告位跳出",{
            "path": adInfo.toLinks,
            "appId": adInfo.appid,
            "position": adInfo.position
        })
        PlatformMgr.callAPIMethodByProxy("navigateToMiniProgram", _d);
    }


    mouseDown() {
        Laya.timer.clearAll(this);
        this._mouseDown = true;
        this._mouseY = Laya.MouseManager.instance.mouseX;
    }

    mouseMove() {
        if (this._mouseDown) {
            var dis = Laya.MouseManager.instance.mouseY - this._mouseY;
            dis = dis > 30 ? 30 : dis < -30 ? -30 : dis;
            this._mouseY = Laya.MouseManager.instance.mouseY;
            //先移动
            if (dis > 0 && this._cells[0].getPosY() + dis > this.fristPosY) {
                dis = this.fristPosY - this._cells[0].getPosY();
            }
            if (dis < 0 && this._cells[this._cells.length - 1].getPosY() + dis < this.endPosY) {
                dis = this.endPosY - this._cells[this._cells.length - 1].getPosY();
            }
            for (var j = 0; j < this._cells.length; j++) {
                let cell = this._cells[j];
                cell.setPosY(cell.getPosY() + dis);
            }
        }
    }


    mouseUp(event: Event) {
        this._mouseDown = false;
        this._mouseY = 0;
        this.autoMove();
    }



}



class MyRow {
    public _cells: Array<any>;
    public _posY: number;
    constructor() {
        this._cells = [];
        this._posY = 0;
    }
    public setPosY(posY: number) {
        for (let i = 0; i < this._cells.length; i++) {
            let cell = this._cells[i] as Laya.Image;
            let x = cell.x;
            cell.pos(x, posY)
        }
        this._posY = posY;
    }

    public getPosY() {
        return this._posY;
    }
}