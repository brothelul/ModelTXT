Page({
  data: {
    groupId: null,
    costCleans: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const groupId = options.groupId;
    console.log(groupId)
    this.setData({
      groupId: groupId
    });
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

})
