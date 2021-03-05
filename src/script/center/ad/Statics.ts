var adminUrl = 'https://admin.hanyougame.com'
// var adminUrl = 'http://192.168.0.188:8007'
const gameid = 6
const secret = '21b3fc85bd5b0fdf4dea508229daad2a'
function convertString(obj) {
    var str = '';
    for (let key in obj) {
        if (!!str) {
            str += '&'
        }
        str += key + '=' + obj[key];
    }
    return str;
}

export default class Statics {
    public static dictionary: any = {};
    /** 当前已有订阅 */
    public static subscribe : boolean = false;

    private static openid: string = '';
    private static version: string = '';
    public static flows: Array<any> = [];
    public static registerTimeTick: number = 0;
    public static channelName: string = '';

    static register(openid: string, referrerInfoAppId: string, version: string, cb: Function) {
        this.openid = openid;
        this.version = version
        let self = this;
        this.get('', { openid: openid, referrerInfoAppId: referrerInfoAppId }, (err, res) => {
            console.log('注册结果:', res);
            if (res) {
                self.flows = res.flows;
                self.subscribe = res.subscribe
                self.registerTimeTick = res.registerTimeTick
                self.channelName = res.channelName;
                Global.Event.emit('updateFlows');
                if (res.dictionary) {
                    for (let i = 0; i < res.dictionary.length; i++) {
                        if (res.dictionary[i].version == version) {
                            self.dictionary[res.dictionary[i].key] = res.dictionary[i].value
                        }
                    }
                }
            }

            cb(err, res);
        }, '/gameRegister')
    }
    static login(openid: string, version: string, cb: Function) {
        this.openid = openid;
        this.version = version
        var self = this;
        this.get('login', { openid: openid, version: version }, (err, res) => {
            console.log('统计服务器登陆结果:', res);
            if (res) {
                self.flows = res.flows;
                self.registerTimeTick = res.registerTimeTick
                self.subscribe = res.subscribe
                Global.Event.emit('updateFlows');
                if (res.dictionary) {
                    for (let i = 0; i < res.dictionary.length; i++) {
                        if (res.dictionary[i].version == version) {
                            self.dictionary[res.dictionary[i].key] = res.dictionary[i].value
                        }
                    }
                }
            }
            cb && cb(err, res);
            // cb(res);
        })
    }
    static addFlowCount(data) {
        data.openid = this.openid
        this.get('addFlowCount', data, (err, res) => {
            console.log('addFlowCount:', res);
        })
    }
    static addFlowOpenCount(data) {
        data.openid = this.openid
        this.get('addFlowOpenCount', data, (err, res) => {
            console.log('addFlowCount:', res);
        })
    }
    static addEvent(eventName) {
        var data = {
            eventName: eventName
        }
        this.get('addEvent', data, (err, res) => {
            console.log('addEvent:', res);
        })
    }
    static userEvent(eventName){
        this.get('userEvent', {eventName:eventName}, (err, res) => {
            console.log('userEvent:', res);
        })
    }
    static requestSubscribeMessage(cb){
        this.get('subscribeSuccss',{},(err,res)=>{
            this.subscribe = res.subscribe
        })
    }
    static saveCacheData(cache:string){
        this.get('saveData',{cacheData:cache},(err,res)=>{
            console.log('数据保存结果:',res);
        })
    }
    static get(route: string, data: any, cb: Function, path: string = '/game'): void {
        data.secret = secret;
        data.gameid = gameid
        data.openid = this.openid
        Global.Http.loginGet({
            path: path,
            route: route,
            data: data,
            cb: cb,
            reconnect: true,
            url: adminUrl
        })
    }
}