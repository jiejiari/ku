export default class AdsMgrDating {
    public static  mBannerAd:any = null;
    private static banerID:string="adunit-a98e22e959506c8f";

    public static initBannerAd(){
     
        if(Global.Platform.isWechat)
        {
        var systemInfo = wx.getSystemInfoSync();
        if (systemInfo.SDKVersion < '2.0.4') { //不满足显示广告的SDK版本
            return;
        }
        // if (this.mBannerAd) {
        //     this.hideBannerAd();
        // }
        var showWidth = systemInfo.screenWidth;
        this.mBannerAd = wx.createBannerAd({
            adUnitId: this.banerID,
            adIntervals: 30,
            style: {
                left: 0,
                top: systemInfo.screenHeight - 100,
                width: showWidth,
            }
        });
        var self = this;

        this.mBannerAd.onResize(res => {
            let left = (systemInfo.screenWidth - res.width) / 2;
            let top = systemInfo.screenHeight - res.height;
            var model = systemInfo.model.toString();
            if (model.search("iPhone X") != -1) {
                top -= 20;
            }
            self.mBannerAd.style.top = top;
            self.mBannerAd.style.left = left;

        });

        this.mBannerAd.onError(function (errMsg) {
            console.log(" ---------------------- banner广告加载失败:" + errMsg);
        });
    }
    }

     //显示Baner广告
     public static showBanerAd():void {
      
       if(Global.Platform.isWechat)
       {
           if(this.mBannerAd)
           {
               this.mBannerAd.show();
           }
      
       }
    }

  //影藏Baner广告
  public static hideBannerAd():void {
  
    if (this.mBannerAd) {                   
        this.mBannerAd.hide();
        // this.mBannerAd.destroy();
        // this.mBannerAd = null;
    }
}
}