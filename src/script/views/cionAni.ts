

export class cionAni extends Laya.Image {

	public M_left = 0;
	public M_right = 0;
	public L_OR_R = false;
	private zuoyou = false;
	constructor() {
		super();
		this.shezhi_thefish();
	}
	public shezhi_thefish() {
		this.skin = "mainview/zhuye_jinbi02.png";
		this.anchorX = 0.5;
		this.anchorY = 0.5;
		this.rotation = 0;
		this.alpha = 1;
	}
	public Initialize() {
		this.x = 300;
		this.y = 640;
		this.rotation = 0;
		this.alpha = 1;
	}
	public Addcionain = new Laya.Tween();
	public Addcionain1 = new Laya.Tween();
	/**
* 随机整数
* @param min 最小值
* @param max  最大值
*/
	public Random_Int(min: number, max: number): number {
		var Range = max - min;
		var Rand = Math.random();
		return (min + Math.round(Rand * Range));
	}
	/**
	 * 游戏结算获取金币动画表现
	 */
	public OVERhuoquAIn(bOOL: boolean, originalPos:any, targetPos:any) {
		this.Addcionain.complete();
		this.Addcionain1.complete();
		this.visible = false;
		this.scale(1, 1);
		let XX = this.Random_Int(originalPos.x - 110, originalPos.x + 110);
		let YY = this.Random_Int(originalPos.y - 100, originalPos.y + 100);

		this.pos(XX, YY);
		this.scale(0, 0);
		this.rotation = 0;
		this.visible = true;

		this.Addcionain1.to(this, { rotation: 360 }, 200, null, Laya.Handler.create(this, () => {
			this.Addcionain.to(this, { scaleX: 2, scaleY: 2 }, 100, null, Laya.Handler.create(this, () => {
				// let zhuanghhou = GameWin.thistutu.localToGlobal(new Laya.Point(GameWin.thistutu.x, GameWin.thistutu.y));
				this.Addcionain.to(this, { x: targetPos.x, y: targetPos.y, scaleX: 1, scaleY: 1, rotation: 720 }, 300, null, Laya.Handler.create(this, () => {
					this.visible = false;
					this.rotation = 0;
					this.scale(1, 1);
					this.pos(300, 640);
					this.removeSelf();
					Laya.Pool.recover("CONINAIN", this);
					// GameWin.cionAIN();
					if (bOOL) {
						//显示金币数字变化
						// GameWin.gameoveryancixianshi();
					}
					//播放音效
					// game.SoundMgr.Instance.Player_yixniao("gold");
				}));

			}));
		}));
		this.Addcionain.to(this, { scaleX: 2.2, scaleY: 2.2 }, 200, null, Laya.Handler.create(this, () => {

		}));
	}
}