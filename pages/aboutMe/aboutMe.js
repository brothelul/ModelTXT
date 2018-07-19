/**
 * Created by mosesc on 07/19/18.
 */
const util = require('../../utils/util');

Page({
    data:{
        email: '1285823170@qq.com'
    },
    onLoad: function () {
    },
    copyEmail: function () {
        const email = this.data.email;
        wx.setClipboardData({
            data: email,
            success: function(){
                util.showSuccessToast("复制成功");
            }
        });
    }
})