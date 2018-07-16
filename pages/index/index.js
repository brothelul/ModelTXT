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
    groupDetail: null,
    selectCostGroup: null,
    showSmall: true
  },
  onLoad: function (options) {
    const defualtCostGroup = wx.getStorageSync("selectCostGroup");
    this.setData({
      selectCostGroup: defualtCostGroup
    });
    console.log(options)
    if (options.from){
      util.showLoading();
      this.initUserInfo();
      this.initGroupInfo();
    } else{
      util.showLoading('登录中');
      var that = this;
      app.login().then(function () {
        util.showLoading();
        that.initUserInfo();
        that.initGroupInfo();
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
  // 初始化所有账单
  initGroupInfo: function () {
    var that = this;
    util.request(api.COSTGROUP).then(function (res) {
      const costGroups = res.data;
      console.log("costGroups",res.data)
      that.setData({
        costGroups: costGroups
      });
      if (costGroups.length > 0){
        // 判断是否存在默认的组
        var selectCostGroup = that.data.selectCostGroup;
        console.log(selectCostGroup)
        selectCostGroup = selectCostGroup ? selectCostGroup : {};
        const temp = costGroups.filter(item => item.groupNo == selectCostGroup.groupNo);
        if (temp.length == 0){
          selectCostGroup = costGroups[0];
        } else{
          selectCostGroup = temp[0];
        }
        console.log("temp", selectCostGroup)
        that.setData({
          selectCostGroup: selectCostGroup
        });
        wx.setStorageSync("selectCostGroup", selectCostGroup);
        that.initGroupDetail(selectCostGroup.groupNo);
      } else {
        wx.setStorageSync("selectCostGroup", null);
      }
    });
  },
  // 初始化某一账单信息
  initGroupDetail: function(groupNo){
    console.log("groupNo", groupNo);
    var that = this;
    util.request(api.ROOT_URI+"costGroup/"+groupNo+"/overview").then(function(res){
      console.log(res.data)
      that.setData({
        groupDetail: res.data
      });
    });
  },
  // 下拉刷新页面
  onPullDownRefresh: function () {
    util.showLoading();
    this.initUserInfo();
    this.initGroupInfo();
    wx.stopPullDownRefresh();
  },
  // 分享页面
  onShareAppMessage: function (res) {
    console.log(res)
    if (res.from == 'button') {
      const groupCode = res.target.id;
      const userName = this.data.userInfo.nickName;
      const costGroups = this.data.costGroups.filter(item => item.groupCode == groupCode);
      return {
        title: userName + '邀请你加入账单' + costGroups[0].groupName,
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
    util.showLoading('登录中');
    var that = this;
    this.loginByButton(e).then(function () {
      that.initUserInfo();
      that.initGroupInfo();
      that.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      });
    }, function(){
      wx.showToast({
        title: "未授权，登录失败",
        icon: 'none',
        duration: 3000
      })
    });
  },
  loginByButton: function (e) {
    console
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
              wx.hideLoading();
            },fail: function(res){
              console.log(res);
              wx.hideLoading();
              reject(res);
            }
          });
        }
      });
    });
  },
  // open more action
  openMore: function () {
    const selectGroup = this.data.selectCostGroup;
    const groupId = selectGroup.groupNo;
    var that = this;
    var itemList = ['设置', '退出', '结算', "历史结算记录"];
    if (this.data.groupDetail.myRole == 'admin') {
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
                    var newCostGroups = that.data.costGroups.filter(item => item.groupNo != groupId);
                    that.setData({
                      costGroups: newCostGroups
                    });
                    util.showLoading();
                    that.initGroupInfo();
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
                    costGroups = costGroups.filter(item => item.groupNo != groupId);
                    that.setData({
                      costGroups: costGroups
                    });
                    util.showLoading();
                    that.initGroupInfo();
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
  openAdd: function(e){
    console.log(e)
    const selectCostGroup = this.data.selectCostGroup;
    var itemList = ['创建新的账单'];
    if (this.data.costGroups.length > 0){
      itemList.push('添加消费记录');
    }
    wx.showActionSheet({
      itemList: itemList,
      success: (res) => {
        if (res.tapIndex == 0) {
          wx.navigateTo({
            url: '/pages/group/group',
          })
        } else if (res.tapIndex == 1) {
          var url = "/pages/cost/cost";
          if (selectCostGroup){
            url=url.concat("?groupId="+selectCostGroup.groupNo);
          }
          wx.navigateTo({
            url: url
          })
        } else if (res.tapIndex == 2) {
          wx.navigateTo({
            url: '/pages/feedback/feedback?groupId=9',
          })
        }
      }
    })
  },
  // 选择默认的账单
  selectCostGroup: function(e){
    util.showLoading();
    const selectCostGroup = this.data.costGroups[e.detail.value];
    this.setData({
      selectCostGroup: selectCostGroup
    });
    wx.setStorageSync("selectCostGroup", selectCostGroup);
    this.initGroupDetail(selectCostGroup.groupNo);
  },
})
