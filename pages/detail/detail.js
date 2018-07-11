const util = require('../../utils/util.js');
const api = require('../../config/api.js');

Page({
    data:{
      currentPage: 1,
      pageSize: 50,
      details: [],
      touchColor: null,
      cleanId: null,
      userId: null,
    },
    onLoad: function(options){
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
        console.log("details",{ ...that.data.details, ...res.data.data },);
      });
    },
    loadingMore: function(e){
      console.log(e)
      wx.showLoading({
        title: '加载中',
      });
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
            util.request(api.DELETE_DETAIL + detailId, {},"DELETE").then(function(){
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
    }
})