import deepClone from 'deep-clone'

const diff = require('object-diff')


function createStore(config) {
  const models = config.models
  const store = {
    models,
    views: [],
    getState: () => {
      const states = {}
      Object.keys(models).map((key) => {
        states[key] = models[key].state
      })
      return states
    },
    dispatch: {},
  }
  const rootState = store.getState()
  // 由事件触发一次所有view的变更
  function handleChange() {
    const rootState = store.getState()// 这里必须重新取一次state,是因为有些state是纯数字，没法通过引用自动修改
    store.views.map((viewWrap) => {
      const { view, mapStateToData } = viewWrap

      const data = mapStateToData(rootState)
      if (view.triggerChange) {
        const diffData = diff(view.data, data)
        if(Object.keys(diffData).length){
          view.triggerChange(diffData)
        }
      }
    })
  }

  // 遍历reducers和effects，分别传入state和rootState,并触发数据变化，并都绑到dispatch上
  Object.keys(models).map((key) => {
    const model = models[key]
    const reducers = model.reducers||{}
    const effects = model.effects && model.effects(store.dispatch)||{}

    store.dispatch[key] = {}
    for (const func in reducers) {
      const fn = reducers[func]

      store.dispatch[key][func] = (payload) => {
        model.state = fn(model.state, payload)
        handleChange()
      }
    }
    for (const func in effects) {
      const fn = effects[func]

      store.dispatch[key][func] = (payload) => {
        fn(payload, rootState)//TODO，这里需要验证一下rootState是否需要临时取
      }
    }
  })
  return store
}
module.exports = createStore
