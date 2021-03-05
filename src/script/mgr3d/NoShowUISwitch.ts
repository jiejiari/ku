
export default class NoShowUISwitch extends Laya.Script{
    
    onAwake()
    {
        if(Global.Data.noShowUI)
        {
            (this.owner as Laya.Sprite).visible = false;
        }
    }
}