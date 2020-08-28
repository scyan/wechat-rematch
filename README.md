## 用法

### 安装
```
npm install wechat-rematch
```
### 使用

1. 小程序开发工具顶部工具栏：工具->构建npm<br />
2. 小程序右侧工具栏：勾选“使用npm模块”<br />
3. 参考以下demo,在代码中定义自己的models，用createStore组装所有models,按以下步骤改造app.js、Page、Component<br />

### 定义models
models/count.js
```
const count={
    state:{
      count:0
    },
    //处理直接修改state的事件
    reducers: {
      increment: (state, payload) => {
        return Object.assign(state, { count: state.count + payload })
      },
    },
    //处理事件
    effects: (dispatch) => ({ 
      async incrementAsync(payload, rootState) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        dispatch.count.increment(payload)
      }
    })
  }
  module.exports  = count;
```

### 生成store
```
const { createStore } = require("wechat-rematch")
const count = require('./models/count')
const store = createStore({
  models:{
    count
  }
})
module.exports = store
```

### 改造app.js
```
const { Provider } = require("wechat-rematch")
  const store = require('./store')
  App(
    Provider(store)({
      onLaunch: function () {
      }
    })
  )
```

### 改造Page
```
const { connect } = require("wechat-rematch")
//将count注入页面的data
function mapStateToData(state){
  return {
    count: state.count.count
  }
}
Page(connect(mapStateToData)({
  data:{
  },
  onLoad: function() {
   
    
  },
  add: function(){
    
    this.dispatch.count.increment(1)
  },
  addAsync: function(){
    this.dispatch.count.incrementAsync(1)
  }
}))
```

### 改造Component
```
const { connect } = require("wechat-rematch")
//将count注入组件的data
function mapStateToData(state) {
  return {
    count: state.count.count
  }
}
Component(connect(mapStateToData)({
  /**
   * 组件的方法列表
   */
  methods: {
    add:function(){
      console.log(this.data.count)
      this.dispatch.count.increment(1)
    }
  }
}))
```
### note

为了避免性能问题，dispatch事件不会触发隐藏页面的setData,在隐藏页面onShow时会触发一次setData来获取到store里最新的state并覆盖页面data，所以注意请勿在页面内setData而是统一用dispatch，否则页面的隐藏和出现会导致数据变化

### 反馈地址
[https://github.com/scyan/wechat-rematch/issues](https://github.com/scyan/wechat-rematch/issues)