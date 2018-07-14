var api = require('../config/api.js');

function formatTime(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  return [year, month, day].map(formatNumber).join('-');
}

function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : '0' + n;
}

/**
 * 封装微信的的request
 */
function request(url, data = {}, method ='GET') {
  const  header = {};
  const cookie = wx.getStorageSync('cookie');
  if (cookie){
    header.Cookie = cookie;
  }
  return new Promise(function (resolve, reject) {
    wx.request({
      url: url,
      data: data,
      method: method,
      header: header,
      success: function (res) {
        if (res.statusCode == 200) {
          wx.hideLoading();
          resolve(res.data);
        } else if (res.statusCode == 401) {
          wx.hideLoading();
          //需要登录后才可以操作
          wx.showModal({
            title: '温馨提示',
            content: '请先登录',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.redirectTo({
                  url: '/pages/index/index'
                });
              }
            }
          });
        } else{
          wx.hideLoading();
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 3000
          });
          reject(res.data.message);
        }
      },
      fail: function (err) {
        reject(err);
        wx.hideLoading();
        wx.showToast({
          title: err.errMsg,
          icon: 'none',
          duration: 3000
        });
        console.log("failed request", err);
      }
    })
  });
}

function showSuccessToast(msg) {
  wx.showToast({
    title: msg,
    icon: 'success'
  })
}

function showLoading(msg){
  msg = msg ? msg : '加载中';
  wx.showLoading({
    title: msg,
  })
}

function setNavigationBarTitle(msg){
  wx.setNavigationBarTitle({
    title: msg,
  })
}

function toIndexPageModal(msg, hasLogin){
  console.log(hasLogin);
  var url = '/pages/index/index';
  url = hasLogin ? url+'?from=share' : url;
  wx.showModal({
    title: '温馨提示',
    content: msg,
    showCancel: false,
    success: function () {
      wx.reLaunch({
        url: url,
      })
    },
  });
}

module.exports = {
  formatTime,
  request,
  showSuccessToast,
  showLoading,
  setNavigationBarTitle,
  toIndexPageModal
}

