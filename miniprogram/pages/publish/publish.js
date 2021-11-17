// pages/blog-edit/blog-edit.js
const MAX_WORDS_NUM = 140
const MAX_IMG_NUM = 9
const db = wx.cloud.database()
const App = getApp()
//输入的文字内容
let content = ''
//经纬网
let longitude = ''
let latitude = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bind: false,
    userInfo: {},
    wordsNum: 0,//当前字数
    footerBottom: 0,//发布位置是否改变高度
    image: [],//保存图片
    selectphoto: true,//添加图片元素是否出现 true出现
    weizi:'所在位置',
    showweizi:false,
    show: false
  },
  bind() {
    this.setData({
      show: true
    })
  },
  onClose() {
    this.setData({
       show: false
    })
 },
  bindId(event) {
    this.setData({
      bind: event.detail.bind,
      show: event.detail.show
    })
    wx.getStorage({
      key: "userInfo",
      success: (res) => {
        this.setData({
          userInfo: JSON.parse(res.data)
        })
      }
    })
  },
  //发布博客
  send() {
    //步骤一：上传图片到云存储
    if (content.trim() === '') {//内容为空
      wx.showModal({
        title: "请输入内容"
      })
      return
    }
    wx.showLoading({
      title: '发布中',
      mask: true,//产生蒙板
    })
    let promiseArr = []
    let fileIds = []
    for (let i = 0, len = this.data.image.length; i < len; i++) {//每次只能上传一张图片
      let p = new Promise((resolve, reject) => {
        let item = this.data.image[i]
        //获取文件扩展名(正则表达式)
        let suffix = /\.\w+$/.exec(item)[0]
        wx.cloud.uploadFile({
          cloudPath: 'lost/' + Date.now() + '-' + Math.random() * 10000000 + suffix,//上传到云存储的路径
          filePath: item,//当前文件的路径
          success: (res) => {
            // console.log(res)
            fileIds = fileIds.concat(res.fileID)
            resolve()
          },
          fail: (err) => {
            console.error(err)
            reject()
          },
        })
      })
      promiseArr.push(p)
    }
    //步骤二：将文本内容 fileid openid 昵称 头像 时间 位置 经纬网 上传到云数据库
    Promise.all(promiseArr).then((res) => {
      db.collection('lost').add({
        data: {
          ...this.data.userInfo,//用户全部信息
          longitude,
          latitude,
          content,//文本内容
          address:this.data.weizi,
          img: fileIds,
          createTime: db.serverDate(),//服务端时间
        }
      }).then((res) => {
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
        })
        // //返回博客列表blog页面,并且刷新页面，调用blog页面中的_loadBlogList()方法
        // wx.navigateBack()
        // const pages = getCurrentPages()//获取页面 pages是一个数组 下标为1是其子页面blog-edit 下标为0是其父页面blog 
        // // console.log(pages)
        // //取父页面
        // const prevPage = pages[pages.length - 2]
        // prevPage.onPullDownRefresh()
      })
    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: '发布失败',
      })
    })
  },
  //查看图片
  onPreviewImage(event) {
    wx.previewImage({
      urls: this.data.image,
      current: event.target.dataset.imgsrc,
    })
  },
  //删除图片
  OnDelimage(event) {
    //event.target.dataset.index获取data-index="{{index}}"索引 返回的是被删除的位置
    this.data.image.splice(event.target.dataset.index, 1)
    this.setData({
      image: this.data.image
    })
    //判断删除后图片可以在添加的个数
    if (this.data.image.length == MAX_IMG_NUM - 1) {
      this.setData({
        selectphoto: true
      })
    }
  },
  //选择图片
  obChooseImage() {
    //还能在选几张图片
    let max = MAX_IMG_NUM - this.data.image.length
    wx.chooseImage({
      count: max,
      sizeType: ['original', 'compressed'],//图片类型 原始值 压缩值
      sourceType: ['album', 'camera'],//图片来源 手机相册 手机照相
      success: (res) => {
        //console.log(res)
        this.setData({
          image: this.data.image.concat(res.tempFilePaths)//图片应该采用追加的形式添加
        })
        //判断是否为9张图片
        max = MAX_IMG_NUM - this.data.image.length
        this.setData({
          selectphoto: max <= 0 ? false : true
        })
      },
    })
  },
  //获取焦点事件
  onFocus(event) {
    this.setData({
      footerBottom: event.detail.height//获取键盘高度
    })
  },
  //失去焦点事件
  onBlur() {
    this.setData({
      footerBottom: 0,
    })
  },
  //监听输入文字个数
  onInput(event) {
    content = event.detail.value
    let wordNums = content.length
    if (wordNums >= MAX_WORDS_NUM) {
      wordNums = `最多字数为${MAX_WORDS_NUM}`
    }
    this.setData({
      wordsNum: wordNums
    })
  },
  //打开地图选择位置
  chooseLocation() {
    wx.chooseLocation({
      success: ((res) => {
        longitude = res.longitude
        latitude = res.latitude
        this.setData({
          weizi:res.name,
          showweizi:true,
        })
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    
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
      bind: App.globalData.bind,
      userInfo: App.globalData.userInfo,
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