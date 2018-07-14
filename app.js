//app.js
const api = require('config/api.js');
App({
  onLaunch: function () {
  },
  globalData: {
    userInfo: { leftCost: 0, totalCost: 0, avatarUrl: '../../img/default.png' },
    hasUserInfo: false,
  },
  // 用户登录，全局应该只登录一次
  login: function(){
    var that = this;
    return new Promise(function(resolv, reject){
      wx.login({
        success: res => {
          const wxCode = res.code;
          wx.getSetting({
            success: function (res) {
              if (!res.authSetting['scope.userInfo']) {
                wx.authorize({
                  scope: 'scope.userInfo',
                  success() {
                    // 用户已经同意获取基本信息
                    that.lifeLogin(wxCode, reject, resolv);
                  },
                  fail(e){
                    reject();
                    wx.showToast({
                      title: "自动登录失败，可以手动授权登录",
                      icon: 'none',
                      duration: 3000
                    })
                  }
                })
              } else{
                that.lifeLogin(wxCode, reject, resolv);
                wx.hideLoading();
              }
            }
          })
        }
      })
    });
},
  lifeLogin: function (wxCode, reject, resolv){
  wx.getUserInfo({
    success: resInfo => {
      wx.request({
        url: api.LOGIN,
        method: 'POST',
        data: {
          wxCode: wxCode,
          iv: resInfo.iv,
          encryptedData: resInfo.encryptedData
        },
        success: function (res) {
          if (res.statusCode == 200) {
            var cookie = "JSESSIONID=" + res.data.data;
            wx.setStorageSync('cookie', cookie);
            resolv();
          } else {
            console.log("登录失败")
            reject(res.data.message);
          }
          wx.hideLoading();
        },
        fail: function (res) {
          reject(res);
          wx.hideLoading();
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
          })
        }
      });
    }
  });
}
})