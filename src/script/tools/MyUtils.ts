import ConfigData from "../models/ConfigData";

export default class MyUtils {

    public static isNull(obj: any): boolean {
        if (obj == null || obj == undefined || obj == "") {
            return true;
        }
        return false;
    }


    public static random(min, max) {
        var range = max - min;
        var rand = Math.random();
        var num = min + Math.round(rand * range); //四舍五入
        return num;
    }

    		/**
		 * 比较版本号，格式xx.xx.xx
		 * @param v1 当前版本号
		 * @param v2 目标版本号
        */
    public static compareVersion(v1, v2): number {
        v1 = v1.split('.')
        v2 = v2.split('.')
        const len = Math.max(v1.length, v2.length)

        while (v1.length < len) {
            v1.push('0')
        }
        while (v2.length < len) {
            v2.push('0')
        }

        for (let i = 0; i < len; i++) {
            const num1 = parseInt(v1[i])
            const num2 = parseInt(v2[i])

            if (num1 > num2) {
            return 1
            } else if (num1 < num2) {
            return -1
            }
        }

        return 0
    }

    //顶部按钮对齐，大体适配是ok的
    public static autoScreenSize(node: any[]) {
        if (!Laya.Browser.onMiniGame) {
            return
        }
        let info = ConfigData.systemInfo;
        let _y = 20;
        if (info.statusBarHeight == 20) { 
        }else if (info.statusBarHeight == 44 || info.statusBarHeight == 27) { //27
            _y += 70;
        }else if( info.statusBarHeight == 24){
            _y += 16;
        }
        node.forEach(e => { // 20  
            e.y = _y + e.height/2;
        })
    }

    public static scoreConversion(orginScore:number):any {
        // l、当金币数＞3位数后，每隔3位便用逗号隔开，比如100,000,000
        // 2、当金币数＞7位数后，单位换算成K
        // 1000=1K，1000,000=1M，1000,000,000=1B,1000,000,000,000=1T
        let k = null; //k==4: K   k==3: M   k==2: B   k==1: T
        
        let score = Math.round(orginScore)
        let stringCoin = score.toString();
        
        let unitList = [1e12, 1e9, 1e6, 1e3];
        for(let i=0; i<unitList.length; i++){
            let tcn = Math.floor(score/unitList[i]);
            if (tcn >= 1){
                k = i;
                stringCoin = tcn.toString();
                break;
            }
        }
        var rgx = /(\d+)(\d{3})/;  
        while (rgx.test(stringCoin)) {  
            stringCoin = stringCoin.replace(rgx, '$1' + ',' + '$2');  
        }
        // console.log("value:"+ stringCoin.toLocaleString() + "  isK:" + k);

        return {value:stringCoin.toLocaleString(), isK:k};
    }

    //从一个数组中随机抽取num个数，返回对应数组
    public static randomSipArray(array: any[], num) {

        if (array.length < num) {
            console.log("数组长度不够");
            return null;
        } else if (array.length == num) {
            let a = [];
            for (let i = 0; i < array.length; i++) {
                a.push(array[i]);
            }
            return a;
        } else {
            let tempArray = [];
            for (let k = 0; k < array.length; k++) {
                tempArray.push(k);
            }
            let a = [];
            for (let j = 0; j < num; j++) {
                let tempIndex = this.random(0, tempArray.length - 1);
                let index = tempArray[tempIndex];
                tempArray.splice(tempIndex, 1);
                a.push(array[index]);
            }
            return a;
        }
    }
}