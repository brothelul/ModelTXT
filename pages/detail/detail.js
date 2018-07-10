const util = require('../../utils/util.js');
const api = require('../../config/api.js');

Page({
    data:{
      currentPage: 1,
      pageSize: 50,
      details: [],
      touchColor: null,
    },
    onLoad: function(options){
      console.log("groupId", options.groupId);
      const groupId = options.groupId;
      this.setData({
        groupId: groupId
      });
      this.loadDetails();
    },
    loadDetails: function(){
      const url = api.ROOT_URI + "costDetail/" + this.data.groupId + "/list";
      const data = {
        "criteria": [
          {
            "fieldName": "cleanId"
          }
        ],
        "page": this.data.currentPage,
        "size": this.data.pageSize
      };
      var that = this;
      util.request(url, data, "POST").then(function (res) {
        that.setData({
          details: {...that.data.details,...res.data.data},
          currentPage: res.data.page
        });
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
      wx.showModal({
        title: '温馨提示',
        content: '确定要删除该消费记录吗？',
        success: function(res){
          if(res.confirm){
            console.log("确认")
          }else{
            console.log("No")
          }
        }
      })
    }
})