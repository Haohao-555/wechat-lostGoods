import formatTime from '../../utils/formatTime.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    card: Object,
   
  },
  options:{
    styleIsolation:'apply-shared',
  },
  lifetimes:{
    ready(){
       if(typeof this.properties.card.address=='undefined'|| this.properties.card.address=='所在位置'){
         this.setData({
          showicon:true
         })
       }
    }
  },
  
  //监听时间数据
  observers: {
    ['card.createTime'](val) {
      if (val) {
        this.setData({
          //可视化时间
          _createTime: formatTime(new Date(val))
        })

      }
    }
  },
  

  /**
   * 组件的初始数据
   */
  data: {
    _createTime: '',//card.createTime 因为使用了属性监听器 一旦直接修改，会不断触发属性监听器 应该采用this.setData()方法来修改时间
    showicon:false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //选择图片
    onPreviewImage(event) {
      const ds=event.target.dataset
        wx.previewImage({
          urls: ds.imgs,
          current:ds.imgsrc,
        })
    },
    openLocation(){
      wx.getLocation({
        type:'gcj02',
        success:((res)=>{
          console.log(res)
          wx.openLocation({
            latitude: this.properties.card.latitude,
            longitude: this.properties.card.longitude,
            scale:18,
          })
        })
      })
      
    },
  }
})

