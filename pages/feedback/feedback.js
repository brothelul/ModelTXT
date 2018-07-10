const recorderManager = wx.getRecorderManager();
const options = {
  duration: 600000,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 160000,
  format: 'mp3',
  frameSize: 50
}
recorderManager.onStart(() => {
  console.log('recorder start')
});
recorderManager.onStop((res, ) => {
  console.log('recorder stop', res)
  const { tempFilePath } = res;
  // that.setData({
  //   filePath: tempFilePath
  // });
  return tempFilePath;
});

Page({
  data:{
    detail:{},
    groupId: null
  },
  onLoad: function(options){
    const groupId = options.groupId;
    console.log("groupId", groupId);
    this.setData({
      groupId: groupId
    });
  },
  stratRecordVoice: function(){
    recorderManager.start(options);
  }, 
  endRecordVoice: function(){
    console.log("file",recorderManager.stop());
  }
})