const api = require('../../config/api.js');
const util = require('../../utils/util.js');
Page({
  data:{
    loading: false,
    showTopTip: false,
    errorMsg: "",
    groupId: null,
    groupName: null,
    action: 'new'
  },
  onLoad: function(options){
    const groupId = options.groupId;
    var msg = '新建账单';
    if (groupId){
      util.showLoading();
      this.initCostGroup(groupId);
      msg = "修改账单"
    }
    util.setNavigationBarTitle(msg);
  },
  // 如果传入groupId那么会判断是否需要进行更新操作
  initCostGroup: function(groupId){
    var that = this;
    util.request(api.COSTGROUP_BY_ID+groupId).then(function(res){
      that.setData({
        groupId: groupId,
        groupName: res.data.groupName,
        action: 'update'
      });
    });
  },
  newOrUpdateGroup: function(e){
    this.setData({
      loading: true
    });
    const groupName = e.detail.value.groupName;
    if(groupName == null || groupName == ""){
      this.setData({
        loading: false,
        showTopTip: true,
        errorMsg: "账单名称不能为空哦"
      });
      var that = this;
      setTimeout(function () {
        that.setData({
          showTopTip: false
        });
      }, 3000);
      return;
    }
    const action = this.data.action;
    var url = action == 'new' ? api.CREATE_GROUP : api.UPDATE_GROUP+this.data.groupId;
    var successMsg = action == 'new' ? '创建账单成功':'修改账单成功';
    util.request(url, groupName, 'POST').then(function(){
      wx.showToast({
        title: successMsg,
      });
      wx.reLaunch({
        url: '/pages/index/index?from=share',
      })
    });
  }
})