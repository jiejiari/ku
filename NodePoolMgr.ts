
export class Pool {
    public name : string = '';
    public params : any = {};
    public pool : cc.NodePool = null;
    constructor(name:string,params){
        this.name = name;
        this.params = params
        this.pool = new cc.NodePool(name);
    }
    preload(num:number){
        for(var i=0; i<num; i++){
            var node =null;
            if(this.params instanceof cc.Prefab || this.params instanceof cc.Node){
                node = cc.instantiate(this.params)
            } else if(this.params instanceof cc.SpriteFrame){
                node = new cc.Node();
                node.addComponent(cc.Sprite).sprite = this.params;
            }
            this.pool.put(node)
        }
    }
    get():cc.Node{
        if(this.pool.size() <= 0){
            this.preload(1);
        }
        return this.pool.get();
    }
    put(node:cc.Node){
        this.pool.put(node)
    }
    clear(){
        this.pool.clear()
    }
}

export class NodePoolMgr {
    private static names = {}
    //params 可以为prefab可spriteFrame
    public static preload(name,params,num=10):Pool{
        if(this.names[name]){
            this.names[name].params = params
            return this.names[name];
        }
        var pool = new Pool(name,params);
        this.names[name] = pool;
        pool.preload(num);
        return pool;
    }
    public static pool(name:string):Pool{
        return this.names[name]
    }
    public static get(name:string,parent:cc.Node,createFun?:Function,caller = null):cc.Node{
        if(!this.names[name]){
            cc.error('没有初始化对象池', name);
            // let node:cc.Node = createFun.call(caller);
            // node.parent = parent;
            // return node;
            return null;
        }
        var node = this.names[name].get() as cc.Node;
        if(!node){
            this.names[name].get();
            cc.log('')
        }
        if(!node.children){
            cc.log('')
        }
        parent.addChild(node);
        return node
    }
    public static put(name,node){
        if(!this.names[name]){
            cc.error('没有初始化对象池', name)
            return null;
        }
        this.names[name].put(node);
    }
    public static clean(name){
        if(name){
            var pool = this.names[name];
            pool.clear();
            return
        }
        for(var key in this.names){
            var pool = this.names[key];
            pool.clear();
        }
    }
}
