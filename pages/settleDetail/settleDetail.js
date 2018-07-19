var wxCharts = require('../../utils/wxcharts.js');
const api = require('../../config/api.js');
const util = require('../../utils/util.js');
const app = getApp();

Page({
  data: {
    cleanDetail: null,
    errorMsg: null,
    groupId: null,
    cleanId: null,
    loading: false,
    showTopTip: false,
    showPie: false
  },
  onLoad: function (options) {
    const type = options.type;
    const groupId = options.groupId;
    const cleanId = options.cleanId;
    const from = options.from;
    util.showLoading();
    if(from){
      var that = this;
      app.login().then(function(){
        that.init(type, groupId, cleanId);
      }, function(){
        util.toIndexPageModal('自动授权登录失败，去首页授权登录');
      })
    } else{
      this.init(type, groupId, cleanId);
    }
  },
  init: function (type, groupId, cleanId){
    var that = this;
    var url = type == 'view' ? api.UNCLEAN_DETAIL + groupId : api.ROOT_URI + 'costClean/' + cleanId + '/costGroup/' + groupId;
    util.request(url).then(function (res) {
      that.initData(res);
      that.setData({
        groupId: groupId
      });
      if (cleanId){
        that.setData({
          cleanId: cleanId
        });
      }
    }, function(res){
      util.toIndexPageModal(res + '，回到首页', true);
    })
  },
  initData: function(res){
    // 初始化图表
    const cleanDetail = res.data;
    const cateSummary = cleanDetail.categorySummary;
    var series = [];
    if (cateSummary && cateSummary.length>0) {
      cateSummary.map(item => {
        series.push({ name: item.cateName, data: item.totalCost });
      })
      console.log("series", series)
      this.initPie(series);
    } else{
    }
    // 初始化柱状图
    const userSummary = cleanDetail.userSummary;
    var columnData = [];
    if (userSummary) {
      userSummary.map(item => {
        columnData.push({
          name: item.remarkName, data: [item.totalCost, item.leftCost]})
      });
    }
    console.log("columnData", columnData)
    this.initColumn(columnData);
    this.setData({
      cleanDetail: cleanDetail
    });
  },
  initPie: function (series){
    this.setData({
      showPie: true
    });
    var windowWidth = 340;
    new wxCharts({
      canvasId: 'pieCanvas',
      type: 'pie',
      series: series,
      width: windowWidth,
      height: 280,
      dataLabel: true
    });
  },
  initColumn: function (series){
    new wxCharts({
      canvasId: 'columnCanvas',
      type: 'column',
      categories: ['消费情况', '结算情况'],
      series: series,
      yAxis: {
        format: function (val) {
          return val + '元';
        }
      },
      width: 340,
      height: 200
    });
  },
  settleDetail: function(e){
    var comment = e.detail.value.comment;
    this.setData({
      loading: true
    });
    var that = this;
    if (comment == null || comment == ""){
      this.setData({
        loading: false,
        showTopTip: true,
        errorMsg: "结算备注不能为空"
      });
      setTimeout(function () {
        that.setData({
          showTopTip: false
        });
      }, 3000);
      return;
    }
    util.showLoading('结算中');
    const groupId = this.data.groupId;
    const url = api.ROOT_URI+"costDetail/"+groupId+"/clean";
    util.request(url, comment, 'DELETE').then(function(res){
      util.showSuccessToast("结算成功");
      that.setData({
        cleanId: res.data.cleanId
      });
    });
    this.setData({
      loading: false
    });
    const formId = e.detail.formId;
    util.request(api.CREATE_NOTIFICATION, formId, 'POST');
  },
  onShareAppMessage: function(){
    const costDetail = this.data.cleanDetail;
    const groupId = this.data.groupId;
    const cleanId = this.data.cleanId;
    return{
      path: "pages/settleDetail/settleDetail?groupId="+groupId+"&cleanId="+cleanId+"&from=share",
      title: costDetail.costGroup.groupName+"账单的结算记录"
    }
  }
})