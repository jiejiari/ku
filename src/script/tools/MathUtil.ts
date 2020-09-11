import Vector3 = Laya.Vector3;
import Vector2 = Laya.Vector2;
/**
* 常用的数学工具 
*/
export default class MathUtil{
	constructor(){

	}

	public static readonly Rad2Deg = 57.29578;
    public static readonly Deg2Rad = 0.01745329;
	
	/**
	 * 产生某个范围之间的整数
	 * @param min 最小值
	 * @param max 最大值
	 */
	public static Range(min: number, max: number): number {
		if(min > max) return -1;
		if(min == max) return min;
		var num = Math.round(Math.random() * (max - min) + min);
		return num;
	}

	/**
	 * 在两个数之间产生一定数量的随机数
	 * @param min 最小值
	 * @param max 最大值
	 * @param length 产生多少个随机数
	 * @param canRepeat 里面随机数是否可以重复
	 */
	public static RangeArray(min:number,max:number,length:number,canRepeat:boolean):Array<number>{
		if (min >= max) return null;
		if (length > max - min + 1) return null;

		var rangeArray:Array<number> = new Array<number>();

		if(canRepeat){
			while(rangeArray.length < length){
				rangeArray.push(MathUtil.Range(min,max));
			}
		}
		else{
			while(rangeArray.length < length){
				var rangeNum:number = MathUtil.Range(min,max);
				if(rangeArray.indexOf(rangeNum) == -1){
					rangeArray.push(rangeNum);
				}
			}
		}

		return rangeArray;
	}	

	public static Clamp01(num:number):number{
		return num < 0 ? 0 : num > 1 ? 1 : num;
	}

	public static Clamp(num:number, min:number, max:number):number{
		return num < min ? min : num > max ? max : num;
	}

	//两个向量相加
	public static AddV(left:Laya.Vector3, right:Laya.Vector3):Laya.Vector3{
		return new Laya.Vector3(left.x+right.x, left.y+right.y, left.z+right.z);
	}

	//两个向量相减
	public static SubV(left:Laya.Vector3, right:Laya.Vector3):Laya.Vector3{
		return new Laya.Vector3(left.x-right.x, left.y-right.y, left.z-right.z);
	}

	//两个向量相乘
	public static ScaleV(org:Laya.Vector3, scale:number):Laya.Vector3{
		return new Laya.Vector3(org.x*scale, org.y*scale, org.z*scale);
	}

	//数组转换为向量
	public static CV3(o:number[]):Laya.Vector3{
		return new Laya.Vector3(o[0], o[1], o[2]);
	}

	/**
	 * 旋转三维向量 v是一个三维空间向量，k是旋转轴的单位向量，则v在右手螺旋定则意义下绕旋转轴k旋转角度θ得到的向量可以由三个不共面的向量v, k和k×v构成的标架表示：
	 *	R = cos(a)*v + (1-cos(a))*(v*k)*k + sin(a)*kxv
	 * @param v 初始向量
	 * @param k 旋转轴
	 * @param a 旋转角度
	 */
	public static RV3(v:Vector3, k:Vector3, a:number):Vector3{
		let A:Vector3 = new Vector3(0,0,0);
		Vector3.scale(v, Math.cos(MathUtil.Deg2Rad*a), A);
		let B:Vector3 = new Vector3(0,0,0);
		Vector3.scale(k, (1-Math.cos(MathUtil.Deg2Rad*a))*(v.x*k.x+v.y*k.y+v.z*k.z), B);
		let C:Vector3 = new Vector3(0,0,0);
		let X:Vector3 = new Vector3(v.y*k.z-v.z*k.y, v.z*k.x-v.x*k.z, v.x*k.y-v.y*k.x);
		Vector3.scale(X, Math.sin(MathUtil.Deg2Rad*a), C);
		let T:Vector3 = new Vector3(A.x+B.x+C.x, A.y+B.y+C.y, A.z+B.z+C.z);
		return T;
	}
}