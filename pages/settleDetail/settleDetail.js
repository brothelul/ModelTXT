var wxCharts = require('../../utils/wxcharts.js');
Page({
  data: {
    
  },
  onLoad: function (options) {
    var windowWidth = 340;
    new wxCharts({
      canvasId: 'pieCanvas',
      type: 'pie',
      series: [{
        name: '吃喝',
        data: 50,
      }, {
        name: '娱乐',
        data: 30,
      }, {
        name: '家电',
        data: 1,
      }, {
        name: '交通',
        data: 1,
      }, {
        name: '日用品',
        data: 46,
      }, {
        name: '旅游',
        data: 46.1,
      }, {
        name: '其他',
        data: 46.8,
      }],
      width: windowWidth,
      height: 280,
      dataLabel: true
    });

    new wxCharts({
      canvasId: 'columnCanvas',
      type: 'column',
      categories: ['消费情况','结算状况'],
      series: [{
        name: '露哥',
        data: [15,-11]
      }, {
        name: '小谢',
        data: [70, 20]
        }, {
          name: '艺姐',
          data: [108,23]
      }, {
        name: '大灰',
        data: [65,23]
        }, {
          name: '李晓明',
          data: [123,-1]
        }],
      yAxis: {
        format: function (val) {
          return val + '元';
        }
      },
      width: windowWidth,
      height: 200
    });
  },
})