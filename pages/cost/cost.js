const util = require("../../utils/util.js");
const api = require('../../config/api');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    costDate: util.formatTime(new Date()),
    costGroups: [],
    costCategories: [],
    selectCategory: 1,
    selectCostGroup: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const groupId = options.groupId;
    this.initCategory();
    this.initCostGroup(groupId);
  },
  // 初始化分类
  initCategory: function(){
    var that = this;
    util.request(api.CATEGORY).then(function (res) {
      that.setData({
        costCategories: res.data
      });
    });
  },
  initCostGroup: function(groupId){
    var that = this;
    util.request(api.COSTGROUP).then(function(res){
      var costGroups = res.data;
      console.log(res)
      // 如果有group则初始化
      var costGroup;
      if (groupId){
        costGroup = costGroups.filter(item => item.groupId == groupId)[0];
      } else{
        costGroup = costGroups[0];
      }
      console.log(res)
      that.setData({
        costGroups: costGroups,
        selectCostGroup: costGroup
      });
    });
  },
  selectCostDate: function(e){
    this.setData({
      costDate: e.detail.value
    })
  },
  selectCostGroup: function(e){
    console.log(e)
    this.setData({
      selectCostGroup: this.data.costGroups[e.detail.value]
    });
  },
  selectCategory: function(e){
    console.log(e)
    this.setData({
      selectCategory: e.currentTarget.id
    });
  },
  // 创建新的消费记录
  createNewCost: function(e){
    const costMoney = e.detail.value.costMoney;
    const comment = e.detail.value.comment;
    const body = {
      cateId: this.data.selectCategory,
      costDate: this.data.costDate,
      costDesc: comment,
      costMoney: parseFloat(costMoney)
    };
    util.request(api.ROOT_URI+'costDetail/'+this.data.selectCostGroup.groupNo, body, 'POST').then(function(){
      util.showSuccessToast('创建消费记录成功');
      wx.reLaunch({
        url: '/pages/index/index?type=1'
      })
    });
  }
})