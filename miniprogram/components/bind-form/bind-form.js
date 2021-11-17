// components/bind-form/bind-form.js
const userCollection = wx.cloud.database().collection('userInfo')
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    stuId: "",
    pwd: "", 
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    async binId() {
      wx.showLoading({
        title: '加载中...',
      })
      await userCollection.where({
        password: this.data.pwd,
        stuId: this.data.stuId
      }).get().then(res => {
        if (res.data.length != 0) {
          this.triggerEvent("res",{show: false, bind: true});
          wx.setStorage({
            key: "userInfo",
            data: JSON.stringify(res.data[0])
          })
          getApp().globalData.bind = true
          getApp().globalData.userInfo = res.data[0]
        } else {
          wx.showToast({
            title: '未找到用户',
            icon: "error",
            duration: 2000,
          })
  
        }
        wx.hideLoading()
  
      })
    },
  }
})
