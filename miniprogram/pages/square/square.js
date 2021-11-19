// pages/square/square.js
const db = wx.cloud.database()
let App = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperImgUrls: [],
    bind: false,
    key: "",
    active: 0,
    show: false,
    userInfo: {},
    cardList: [],
    hideList: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getSwiper();
    this.loadlostList();
  },
  getSwiper() {
    db.collection('lost-swiper').get().then((res) => {
      this.setData({
        swiperImgUrls: res.data
      })
    })
  },
  loadlostList(start = 0) {
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name: 'card',
      data: {
        keyword: this.data.key,
        start,
        $url: 'list',
        count: 10,
      }
    }).then((res) => {
      this.setData({
        cardList: this.data.cardList.concat(res.result)
      })
      //判断是否为空
      if (this.data.cardList.length != 0) {
        this.setData({
          hideList: false,
          showcontent: true,
        })

      } else {
        this.setData({
          hideList: true,
          showcontent: false,
        })
      }

      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },


  onClose() {
    this.setData({
      show: false
    })
  },
  bind() {
    this.setData({
      show: true
    })
  },
  close() {
    this.setData({
      show: false
    })
  },
  bindId(event) {
    this.setData({
      bind: event.detail.bind,
      show: event.detail.show
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
    this.setData({
      userInfo: App.globalData.userInfo,
      bind: App.globalData.bind
    })
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