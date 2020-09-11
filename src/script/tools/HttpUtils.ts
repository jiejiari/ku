import MyUtils from "../tools/MyUtils";
import ConfigData from "../models/ConfigData";
import UserData from "../models/UserData";
import MyLog from "./MyLog";

export default class HttpUtils {
    public request(_d) {
        return;
        var meth = _d.meth || "post"
        var data = _d.data || {};
        var url = "";
        if (_d.url.indexOf("https://") > -1 ||
            _d.url.indexOf("http://") > -1) {
            url = _d.url;
        } else {
            url = ConfigData.serverUrl + _d.url;
        }
        var completeFunc = (res) => {
            if(res){
                if(!res.data){
                    res = JSON.parse(res);
                }
                if(res.data){
                    // res = res.data;
                    // if(ConfigData.encryptDES && window["strDec"]){
                    //     res = window["strDec"](res,ConfigData.encryptDESKey1,ConfigData.encryptDESKey2,ConfigData.encryptDESKey3);
                    // }
                    res = JSON.parse(res.data);
                }
            }
            //MyLog.log(res,"res");
            if (_d.callback) {
                // console.log("url:" + url +" res:" + JSON.stringify(res));
                _d.callback(res);
            }
            _d.callback = null;
            _d = null;
        };
        var errorFunc = (res) => {
            // if(res){
            //     if(ConfigData.encryptDES && window["strDec"]){
            //         res = window["strDec"](res,ConfigData.encryptDESKey1,ConfigData.encryptDESKey2,ConfigData.encryptDESKey3);
            //     }
            // }
            // res = JSON.parse(res);
            if (data.fail)  {
                data.fail(res);
            }
            data.fail = null;
            data = null;
        };
        if(UserData.sessionId){
            data.sessionId = UserData.sessionId;
            //console.log("sessionId：" + UserData.sessionId);
        }
        var xhr: Laya.HttpRequest = new Laya.HttpRequest();
        xhr.http.timeout = 30000;
        xhr.http.ontimeout = (res)=>{
            if (data.timeout)  {
                data.timeout(res);
            }
            data.timeout = null;
            data = null;
        }
        xhr.once(Laya.Event.COMPLETE, this, completeFunc);
        xhr.once(Laya.Event.ERROR, this, errorFunc);
        
        let dataStr:string = JSON.stringify(data);
        if(ConfigData.encryptDES && window["strEnc"]){
            dataStr = window["strEnc"](dataStr,ConfigData.encryptDESKey1,ConfigData.encryptDESKey2,ConfigData.encryptDESKey3);
        }
        xhr.send(url, "param=" + encodeURIComponent(dataStr), meth, "json", ["Content-Type", "application/x-www-form-urlencoded"]);
        MyLog.log("send:"+url);
        // xhr.send(url, JSON.stringify(data), meth, "json", ["Content-Type", "application/x-www-form-urlencoded"]);
    }

    public requestStatistics(_d) {
        var meth = _d.meth || "post"
        var data = _d.data || {};
        _d.url = _d.url || ""
        var url = ConfigData.statisticsUrl + _d.url;
        var completeDel = (res) => {
            if (_d.callback) {
                // console.log("url:" + url +" res:" + JSON.stringify(res));
                _d.callback(res);
            }
        };
        var errorDel = (res) => {
            if (data.fail)  {
                data.fail(res);
            }
        };
        if(UserData.sessionId){
            data.sessionId = UserData.sessionId;
            // console.log("sessionId：" + UserData.sessionId);
        }
        var xhr: Laya.HttpRequest = new Laya.HttpRequest();
        xhr.once(Laya.Event.COMPLETE, this, completeDel);
        xhr.once(Laya.Event.ERROR, this, errorDel);
        let dataStr:string = JSON.stringify(data);
        // if(ConfigData.encryptDES && window["strEnc"]){
        //     dataStr = window["strEnc"](dataStr,ConfigData.encryptDESKey1,ConfigData.encryptDESKey2,ConfigData.encryptDESKey3);
        // }
        xhr.send(url, "param=" + dataStr, meth, "json", ["Content-Type", "application/x-www-form-urlencoded"]);
    }
    
	getConfig(key:string, _callback:Function) {
        if(ConfigData.serverUrls[key]){
            var xhr: Laya.HttpRequest = new Laya.HttpRequest();
            //xhr.http.timeout = 10000;   //设置超时时间
            xhr.once(Laya.Event.COMPLETE, this, (data)=>{
                if(data && typeof data == "object"){
                    if(_callback){
                        _callback(key, data);
                    }
                }
                else{
                    if(_callback){
                        _callback(key,null);
                    }
                }
            });
            xhr.send(ConfigData.serverUrls[key],null,"get","json",["Content-Type", "application/json"]);
        }
	}
}