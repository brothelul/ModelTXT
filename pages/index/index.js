/**
 * @auther mosesc
 * @date 2018-06-21
 */
const app = getApp()
const api = require('../../config/api.js');
const util = require('../../utils/util.js');

Page({
  data: {
    userInfo: app.globalData.userInfo,
    hasUserInfo: app.globalData.hasUserInfo,
    costGroups: [],
  },
  onLoad: function (options) {
    console.log(options)
    if (options.from){
      wx.showLoading({
        title: '加载中',
      });
      this.initUserInfo();
      this.initGroupInfo();
      wx.hideLoading();
    } else{
      wx.showLoading({
        title: '登录中',
      });
      var that = this;
      app.login().then(function () {
        that.initUserInfo();
        that.initGroupInfo();
        wx.hideLoading();
      }, function (err) {
        console.log(err);
        wx.hideLoading();
        wx.showToast({
          title: err.errMsg,
          icon: 'none',
        })
      });
    }
  },
  // 初始化用户基本信息
  initUserInfo: function () {
    var that = this;
    util.request(api.CURRENT_USER).then(function (res) {
      app.globalData.userInfo =res.data;
      app.globalData.hasUserInfo = true;
      that.setData({
        userInfo: res.data,
        hasUserInfo: true,
      })
    });
  },
  // 初始化账单信息
  initGroupInfo: function () {
    var that = this;
    util.request(api.MYGROUPS_OVERVIEW).then(function (res) {
      that.setData({
        costGroups: res.data
      });
    });
  },
  // 下拉刷新页面
  onPullDownRefresh: function () {
    wx.showLoading({
      title: '加载中',
    });
    this.initUserInfo();
    this.initGroupInfo();
    wx.hideLoading();
    wx.stopPullDownRefresh();
  },
  // 分享页面
  onShareAppMessage: function (res) {
    if (res.from == 'button') {
      const groupCode = res.target.id;
      const userName = this.data.userInfo.nickName;
      const costGroups = this.data.costGroups.filter(item => item.costGroup.groupCode == groupCode);
      return {
        title: userName + '邀请你加入账单' + costGroups[0].costGroup.groupName,
        path: 'pages/approval/approval?groupCode=' + groupCode
      }
    } else {
      return {
        title: userName + '邀请你使用AAB制，让你的生活更便捷',
        path: 'pages/index/index'
      }
    }
  },
  getUserInfo: function (e) {
    wx.showLoading({
      title: '登录中',
    });
    var that = this;
    this.loginByButton(e).then(function (res) {
      that.initUserInfo();
      that.initGroupInfo();
      wx.hideLoading();
      that.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      });
    },function(e){
      wx.hideLoading();
      wx.showToast({
        title: e.errMsg,
        icon: 'none'
      });
    });
  },
  loginByButton: function (e) {
    return new Promise(function (resolve, reject) {
      wx.login({
        success: res => {
          const wxCode = res.code;
          var that = this;
          wx.request({
            url: api.LOGIN,
            method: 'POST',
            data: {
              wxCode: wxCode,
              iv: e.detail.iv,
              encryptedData: e.detail.encryptedData
            },
            success: function (res) {
              console.log("OK");
              if (res.statusCode == 200) {
                var cookie = "JSESSIONID=" + res.data.data;
                wx.setStorageSync('cookie', cookie);
                resolve();
              } else {
                console.log("登录失败")
                reject(res.data.message);
              }
            },fail: function(res){
              console.log(res)
              reject(res);
            }
          });
        }
      });
    });
  },
  // open more action
  openMore: function (e) {
    const groupId = e.currentTarget.id;
    var selectGroup = this.data.costGroups.filter(item => item.costGroup.groupNo == groupId)[0];
    var that = this;
    var itemList = ['设置', '退出', '结算', "结算记录"];
    if (selectGroup.myRole == 'admin') {
      itemList = itemList.concat(['删除']);
    }
    wx.showActionSheet({
      itemList: itemList,
      success: (res) => {
        // 退出消费者警告
        switch (res.tapIndex) {
          // 修改账单设置页面
          case 0:
            wx.navigateTo({
              url: '/pages/group/group?groupId=' + groupId,
            })
            break;
          // 退出账单操作
          case 1:
            wx.showModal({
              title: '温馨提示',
              content: '确定要退出该账单吗？',
              confirmText: "确定",
              cancelText: "取消",
              success: function (res) {
                if (res.confirm){
                  const url = api.ROOT_URI+'costGroup/'+groupId+'/leave';
                  util.request(url, {}, 'DELETE').then(function () {
                    // 从当前数据中删除改组
                    var newCostGroups = that.data.costGroups.filter(item => item.costGroup.groupNo != groupId);
                    that.setData({
                      costGroups: newCostGroups
                    });
                  });
                }
              }
            });
            break
          // 结算页面
          case 2:
            wx.navigateTo({
              url: '/pages/settleDetail/settleDetail?groupId=' + groupId+"&type=view",
            })
            break;
          // 历史结算页面
          case 3:
            wx.navigateTo({
              url: '/pages/settlement/settlement?groupId='+groupId,
            })
            break;
          // 删除账单页面
          case 4:
            wx.showModal({
              title: '温馨提示',
              content: '确定要删除该账单吗？',
              confirmText: "确定",
              cancelText: "取消",
              success: function (res) {
                if (res.confirm) {
                  util.request(api.DELETE_GROUP + groupId, {}, 'DELETE').then(function () {
                    var costGroups = that.data.costGroups;
                    costGroups = costGroups.filter(item => item.costGroup.groupNo != groupId);
                    that.setData({
                      costGroups: costGroups
                    });
                  });
                }
              }
            });
            break;
          default:
            break;
        }

      }
    })
  },
  // 打开添加按钮
  openAdd: () => {
    var that = this;
    wx.showActionSheet({
      itemList: ['添加消费记录', '创建新的账单', "报一个BUG"],
      success: (res) => {
        if (res.tapIndex == 1) {
          wx.navigateTo({
            url: '/pages/group/group',
          })
        } else if (res.tapIndex == 0) {
          wx.navigateTo({
            url: '/pages/cost/cost',
          })
        } else if (res.tapIndex == 2) {
          wx.navigateTo({
            url: '/pages/feedback/feedback?groupId=9',
          })
        }
      }
    })
  },
})
