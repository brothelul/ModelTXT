const util = require('../../utils/util.js');
const api = require('../../config/api.js');

Page({
    data:{
      currentPage: 1,
      pageSize: 100,
      details: [],
      touchColor: null,
      cleanId: null,
      userId: null,
      startTime: 0,
      endTime: 0
    },
    onLoad: function(options){
      util.showLoading();
      const groupId = options.groupId;
      const cleanId = options.cleanId;
      const userId = options.userId;
      console.log("groupId", options.groupId);
      console.log("cleanId", options.cleanId);
      this.setData({
        groupId: groupId,
        cleanId: cleanId,
        userId: userId
      });
      this.loadDetails();
    },
    loadDetails: function(){
      const url = api.ROOT_URI + "costDetail/" + this.data.groupId + "/list";
      const cleanId = this.data.cleanId;
      var data = {
        "criteria": [
          {
            "fieldName": "cleanId",
            "value": cleanId
          }
        ],
        "page": this.data.currentPage,
        "size": this.data.pageSize
      };
      const userId = this.data.userId;
      if (userId){
        data.criteria.push({fieldName: 'userId', value: userId});
      }
      var that = this;
      util.request(url, data, "POST").then(function (res) {
        var details = that.data.details;
        details = details.concat(res.data.data);
        that.setData({
          details: details,
          currentPage: res.data.page
        });
      });
    },
    loadingMore: function(e){
      util.showLoading();
      this.setData({
        currentPage: currentPage+1
      });
      this.loadDetails();
      wx.hideLoading();
    },
    openDeleleComfirm: function(e){
      const detailId = e.currentTarget.id;
      console.log(detailId);
      var that = this;
      wx.showModal({
        title: '温馨提示',
        content: '确定要删除该消费记录吗？',
        success: function(res){
          if(res.confirm){
            util.request(api.ROOT_URI+"costDetail/costGroup/"+that.data.groupId+"/detail/" + detailId, {},"DELETE").then(function(){
              var details = that.data.details;
              details = details.filter(item => item.costId != detailId);
              that.setData({
                details: details
              });
              util.showSuccessToast("删除成功");
            });
          }
        }
      })
    },
  // 展示账单的备注信息
  showDetailComment: function(e){
    const grap = this.data.endTime - this.data.startTime;
    if (grap>350){
      return;
    }
    const detailId = e.currentTarget.id;
    const details = this.data.details;
    const costDetail = details.filter(item => item.costId == detailId)[0];
    var comment = costDetail.costDesc;
    comment = comment.length > 0 ? comment : "没有备注信息哦";
    wx.showModal({
      title: '消费记录备注',
      content: comment,
      showCancel: false,
      confirmText: "关闭"
    })
  },
  bindTouchStart: function (e) {
    this.setData({
      startTime: e.timeStamp
    });
  },
  bindTouchEnd: function (e) {
    this.setData({
      endTime: e.timeStamp
    });
  }
})