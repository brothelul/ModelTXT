const wxCharts = require('../../utils/wxcharts.js');
const util = require('../../utils/util.js');
const api = require('../../config/api.js');

Page({
  data: {
    groupId: null,
    costCleans: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.setNavigationBarTitle('结算记录');
    const groupId = options.groupId;
    console.log(groupId)
    this.setData({
      groupId: groupId
    });
    var that = this;
    util.showLoading();
    util.request(api.CLEAN_HISTORY+groupId).then(function(res){
      // 初始化图表
      that.initData(res);
    });
  },
  initData: function(res){
    const costCleans = res.data;
    this.setData({
      costCleans: costCleans
    });
    if(costCleans && costCleans.length>0){
      var categories = [];
      var series = [];
      var tempTotal = {name: '累计消费', data: [], format: function (val) {
          return val.toFixed(2) + '元';}};
      var tempAverage = {
        name: '平均消费', data: [], format: function (val) {
          return val.toFixed(2) + '元';
        }
      }; 
      var tempTData = [];
      var tempAData = [];     
      costCleans.reverse().map(item => {
        categories.push(item.comment);
        tempTotal.data.push(item.totalCost);
        tempAverage.data.push(item.averageCost);
      });
      // 倒序排列，符合生活逻辑
      series.push(tempTotal);
      series.push(tempAverage);
      this.initLine(categories, series);
    }
  },
  initLine: function (categories, series){
    new wxCharts({
      canvasId: 'lineCanvas',
      type: 'line',
      extra: {
        lineStyle: 'curve'
      },
      categories: categories,
      series: series,
      yAxis: {
        title: '消费金额 (元)',
        format: function (val) {
          return val.toFixed(2);
        },
        min: 0
      },
      width: 340,
      height: 200
    });
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

})
