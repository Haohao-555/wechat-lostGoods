// pages/square/square.js
const db = wx.cloud.database()
let App = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperImgUrls: [],
    bind: App.globalData.bind,
    key: "",
    active: 0,
    show: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     this.getSwiper();
  },
  getSwiper() {
    db.collection('lost-swiper').get().then((res)=>{
      this.setData({
        swiperImgUrls: res.data
      })
    })
  },
  bind() {
      this.setData({
        show: true
      })
  },
  onClose() {
    console.log("text")
    this.setData({
      show: false
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})