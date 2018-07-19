const util = require('../../utils/util.js');
const api = require('../../config/api.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: {},
    hiddenUpdateModal: true,
    showTopTip: false,
    errorMsg: "",
    groupId: null,
    userId: null,
    myRole: null,
    newRemarkName: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.showLoading();
    const groupId = options.groupId;
    const userId = options.userId;
    const myRole = options.myRole;
    this.setData({
      groupId: groupId,
      userId: userId,
      myRole: myRole
    });
    var that = this;
    util.request(api.ROOT_URI + "costGroup/" + groupId+"/user/"+userId).then(function (res) {
      that.setData({
        user: res.data,
        newRemarkName: res.data.remarkName
      })
    });
  },
  // 删除用户
  deleteUser: function(e){
    console.log(e.target);
    var that = this;
    wx.showModal({
      title: '温馨提示',
      content: '确定删除该用户？删除用户前，请确定该用户的消费已结算！',
      confirmText: '确定',
      cancelText: '取消',
      success: function(res){
        const url = api.ROOT_URI+"costGroup/"+that.data.groupId+"/delete/"+that.data.userId;
        if (res.confirm){
          util.request(url, {}, 'DELETE').then(function () {
            util.showSuccessToast("删除成功");
            wx.reLaunch({
              url: "/pages/index/index?type=1",
            });
          });
        }
      }
    })
  },
  updateRemarkName: function(){
    this.setData({
      hiddenUpdateModal: false,
    })
  },
  nameOnChange: function(e){
    this.setData({
      newRemarkName: e.detail.value
    });
  },
  // 设置用户备注
  comfirmRename: function(e){
    var that = this;
    const remarkName = this.data.newRemarkName;
    console.log(e);
    // 校验备注
    if (remarkName == null || remarkName == ""){
      this.setData({
        showTopTip: true,
        message: '备注不能为空'
      });
      setTimeout(function () {
        that.setData({
          showTopTip: false
        });
      }, 3000);
      return;
    }
    util.showLoading();
    const body = { targetNo: this.data.userId, remarkName: remarkName};
    util.request(api.REMARK_NAME, body, 'POST').then(function(){
      var user = that.data.user;
      user.remarkName = remarkName;
      that.setData({
        user: user,
        hiddenUpdateModal: true,
      });
    });
  },
  cancelRename: function(){
    this.setData({
      hiddenUpdateModal: true,
    });
  }
})