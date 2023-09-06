# mini-vue

> 实现一个迷你vue2

## 实现功能

- 模版编译
  - compile 方法
- 生命周期
  - beforeCreate
  - created
  - beforeMount
  - mounted
- methods事件方法
  - @click
- 数据劫持（$data中的属性放到Vue大对象中 保持双向绑定）
  - proxyData 方法
- 更新视图
  - Watch 方法
	- 用于关联dom中的视图
  - observe
   - 用于触发data中的数据发生变化来执行watch中的update
- v-model
  - 通过Object.defineProperty劫持数据发生的改变，如果数据发生改变来（在set中进行赋值），触发update方法进行更新节点内容，从而实现来双向数据绑定的原理。
