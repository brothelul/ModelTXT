const api = require('../../config/api.js');
const util = require('../../utils/util.js');
Page({
  data:{
    group:{},
    approvalUsers: [],
    groupId: null,
    myRole: null
  },
  onLoad: function(options){
    const groupId = options.groupId;
    const myRole = options.myRole;
    wx.setNavigationBarTitle({
      title: '用户申请',
    });
    this.setData({
      groupId: groupId,
      myRole: myRole
    });
    this.loadApplication(groupId);
  },
  // 加载用户申请
  loadApplication: function(groupId){
    var that = this;
    util.request(api.APPLICATIONS + groupId).then(function(res){
      var approvalUsers = res.data.map(item => {
        return { ...item, loading: false };
      });
      that.setData({
        approvalUsers: approvalUsers
      });
    });
  },
  onPullDownRefresh: function(){
    wx.showLoading({
      title: '加载中'
    });
    this.loadApplication(this.data.groupId);
    wx.stopPullDownRefresh();
    wx.hideLoading();
  },
  // 同意申请
  approveJoin: function(e){
    const userId = e.target.id;
    var that = this;
    var url = api.ROOT_URI + '/approval/' + that.data.groupId + '/user/' + userId;
    util.request(url, {}, 'POST').then(function(res){
      var users = that.data.approvalUsers;
      users = users.map(item => {
        if (item.user.userId == userId) {
          return { ...item, status: "已接受", loading: false };
        } else {
          return item;
        }
      });
      that.setData({
        approvalUsers: users
      });
    });
  }
})