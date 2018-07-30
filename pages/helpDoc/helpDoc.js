const api = require('../../config/api.js');

Page({
  data:{
    toView: "toView1",
    rootUrl: api.IMGAGE_URL
  },
  toScrollView: function(e){
    const id = e.target.id;
    this.setData({
      toView: "toView"+id
    });
    console.log(id)
  }
})