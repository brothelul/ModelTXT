const api = require('../../config/api.js');
const util = require('../../utils/util.js');
const app = getApp();
Page({
  data: {
    showTopTip: false,
    errorMsg: '',
    groupCode: null,
    costGroup: null
  },
  onLoad: function (options) {
    var that = this;
    util.showLoading();
    app.login().then(function(){
      const groupCode = options.groupCode;
      const cookie = wx.getStorageSync('cookie');
      that.setData({
        groupCode: groupCode
      });
      // 获取账单
      util.request(api.GET_GROUP_BY_CODE + groupCode).then(function (res) {
        console.log("res", res);
        if (res.data == null && res.status == 200) {
          util.toIndexPageModal('你已经在该账单中了，去首页', true);
        } else if (res.data && res.status == 200) {
          that.setData({
            costGroup: res.data
          });
        }
      }, function(res){
        console.log(res);
        util.toIndexPageModal(res + '，去首页', true);
      });
    }, function(){
      util.toIndexPageModal('获取授权登录失败，去首页授权登录');
    });
  },
  requestJoin: function(e){
    const comment = e.detail.value.comment;
    if (comment == null || comment.trim() == ""){
      this.setData({
        showTopTip: true,
        errorMsg: '验证消息不能为空'
      });
      var that = this;
      setTimeout(function () {
        that.setData({
          showTopTip: false
        });
      }, 2000);
      return;
    }
    const formId = e.detail.formId;
    util.request(api.CREATE_NOTIFICATION, formId, 'POST');
    console.log("formId", formId);
    const body = {comment: comment,groupCode: this.data.groupCode};
    util.request(api.APPROVAL, body, 'POST').then(function(res){
      wx.showToast({
        title: '申请已提交，等待管理员审核',
        icon: 'success'
      });
      wx.redirectTo({
        url: '/pages/index/index',
      })
    });
  }
})