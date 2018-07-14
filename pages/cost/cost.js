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
    selectCostGroup: null,
    loading: false,
    showTopTip: false,
    errorMsg: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.setNavigationBarTitle('新建消费记录');
    util.showLoading();
    const groupId = options.groupId;
    console.log(groupId)
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
        costGroup = costGroups.filter(item => item.groupNo == groupId)[0];
      } else{
        costGroup = costGroups[0];
      }
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
    this.setData({
      loading: true
    });
    var costMoney = e.detail.value.costMoney;
    const comment = e.detail.value.comment;
    const costDate = this.data.costDate;
    const cateId = this.data.selectCategory;
    var transitMoneyFailed = false;
    try {
      if (costMoney){
        costMoney = parseFloat(costMoney);
      } else{
        throw "cost money can not be null"
      }
    } catch (err){
      transitMoneyFailed = true;
    }
    if (costDate == null || cateId == null || transitMoneyFailed){
      this.setData({
        loading: false,
        showTopTip: true,
        errorMsg: "时间/分类/花费不能为空"
      });
      var that = this;
      setTimeout(function () {
        that.setData({
          showTopTip: false
        });
      }, 3000);
      return;
    }
    const body = {
      cateId: cateId,
      costDate: costDate,
      costDesc: comment,
      costMoney: costMoney
    };
    util.request(api.ROOT_URI+'costDetail/'+this.data.selectCostGroup.groupNo, body, 'POST').then(function(){
      util.showSuccessToast('创建消费记录成功');
      wx.reLaunch({
        url: '/pages/index/index?from=share'
      })
    });
    this.setData({
      loading: false
    });
    const formId = e.detail.formId;
    util.request(api.CREATE_NOTIFICATION, formId, 'POST');
  }
})