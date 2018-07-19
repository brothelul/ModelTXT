const api = require('../../config/api.js');
const util = require('../../utils/util.js');
const app = getApp();
Page({
  data: {
    showTopTip: false,
    errorMsg: '',
    costGroup: null,
    loading: false
  },
  onLoad: function (options) {
    util.showLoading();
    const from = options.from;
    const groupCode = options.groupCode;
    if (from){
      this.initCostGroup(groupCode);
    } else{
      var that = this;
      app.login().then(function () {
        const cookie = wx.getStorageSync('cookie');
        that.initCostGroup(groupCode);
      }, function () {
        util.toIndexPageModal('自动授权登录失败，去首页授权登录');
      });
    }
  },
  initCostGroup: function (groupCode){
    var that = this;
    // 获取账单
    util.request(api.GET_GROUP_BY_CODE + groupCode).then(function (res) {
      if (res.data == null && res.status == 200) {
        util.toIndexPageModal('你已经在该账单中，回到首页', true);
      } else if (res.data && res.status == 200) {
        that.setData({
          costGroup: res.data
        });
      }
    }, function (res) {
      util.toIndexPageModal(res + '，回到首页', true);
    });
  },
  requestJoin: function(e){
    this.setData({
      loading: true
    });
    const formId = e.detail.formId;
    util.request(api.CREATE_NOTIFICATION, formId, 'POST');
    const costGroup = this.data.costGroup;
    const groupId = costGroup.groupNo;
    util.request(api.JOIN_COSTGROUP + groupId).then(function(res){
      util.showSuccessToast('成功加入账单' + costGroup.groupName);
      wx.reLaunch({
        url: '/pages/index/index?from=share',
      })
      this.setData({
        loading: false
      });
    }, function(){
      this.setData({
        loading: false
      });
    });
  }
})