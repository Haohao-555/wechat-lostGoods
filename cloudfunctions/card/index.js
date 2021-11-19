// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const TcbRouter = require('tcb-router')

const db = cloud.database()

const lostCollection = db.collection('lost')

const lostComment = db.collection('lost-comment')

const MAX_LIMIT = 100
// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })
  //显示列表
  app.router('list', async (ctx, next) => {
    const keyword = event.keyword
    //查询条件
    let w = {}
    if (keyword.trim() != '') {//添加正则表达式
      w = {
        content: db.RegExp({
          regexp: keyword,
          options: 'i'//忽略大小写  m跨行搜索  s可以匹配所有字符包括换行符
        })
      }
    }
    let lostlist = await lostCollection.where(w).skip(event.start)
      .limit(event.count)
      .orderBy('createTime', 'desc')
      .get()
      .then((res) => {
        return res.data
      })
    ctx.body = lostlist
  })


  //显示单条及评论
  app.router('detail', async (ctx, next) => {
    //id
    let lostId = event.lostId
    //(1)查询详细信息
    let detail = await lostCollection.where({
      _id: lostId
    }).get().then((res) => {
      return res.data//显示在云函数端
    })


    // (2)评论查询
    const countResult = await db.collection('lost-comment').where({lostId}).count()//返回的是对象
    const commentCount = countResult.total//有多少评论数
    let commentList={
      data:[]
    }
    if (commentCount > 0) {
      const batchTimes = Math.ceil(commentCount / MAX_LIMIT)//向下取整
      const tasks = []//存放promise任务
      for (let i = 0; i < batchTimes; i++) {
        let promise =  db.collection('lost-comment').skip(i * MAX_LIMIT)
          .limit(MAX_LIMIT).where({
            lostId
          }).orderBy('createTime', 'desc').get()
          tasks.push(promise)
      }
      //判断任务是否完成
      if(tasks.length>0){
       commentList= (await Promise.all(tasks)).reduce((acc,cur)=>{
          return {
            data:acc.data.concat(cur.data)
          }
        })
      }
    }
    ctx.body={
      commentList,
      detail,
    }
  })

  //查找自己
  const wxContext=cloud.getWXContext()
  app.router('getListOpenid',async(ctx,next)=>{
   ctx.body=await lostCollection.where({
      _openid:wxContext.OPENID
    }).skip(event.start).limit(event.count)
    .orderBy('createTime','desc').get()
    .then((res)=>{
      return res.data
    })
  })
  return app.serve()
}