# vue 研究方向--vDom

* 参考

> - https://blog.csdn.net/m6i37jk/article/details/78140159
> - https://mp.weixin.qq.com/s?__biz=MzI3NTM1MjExMg==&mid=2247483789&idx=1&sn=e7297ec3443007015117637709f27521&scene=21#wechat_redirect
> - https://blog.csdn.net/Forever201295/article/details/80048161


### 研究方法
* 一、如何使用
* 二、如何实现
* 三、vDom是如何渲染成真实的dom
* 四、vDom的diff算法

#### 一、如何使用vDom
* 参考
> - https://blog.csdn.net/qq_36351817/article/details/72902813

* 1.1、
 ```javascript
 new Vue({
  el:"#root",
     render(createElement) {
         return createElement("button", {
             on: {
                 click: function (argument) {
                     // body...
                     alert(1)
                 }
             },"this is button"
         })
     }
 })
```
 ```javascript
 new Vue({
     render(createElement) {
         return createElement("button", {
             on: {
                 click: function (argument) {
                     // body...
                     alert(1)
                 }
             }
         })
     }
 }).$mount('#root')
```
 ```javascript
 new Vue({
     render(createElement) {
         return createElement("button", {
             on: {
                 click: function (argument) {
                     // body...
                     alert(1)
                 }
             }
         })
     }
 }).$mount('#root')
``` 
```javascript
Vue.component('child', {
      render: function(createElement) {
        return createElement(
          'h'+ this.level, // tagName标签名称
          {
            // 事件监听器基于 "on"
            // 所以不再支持如 v-on:keyup.enter 修饰器
            on: {
              click: this.clickHandler
            }
          }
        )
      }
    })

    new Vue({
        el:"#div1"
    })
```
* 1.2、
 ```javascript
  new Vue({
    template:component
  })
```
* 1.3、
 ```javascript
   new Vue({
     el:"#id"
   })
```

#### 二、如何实现

*画流程图 https://www.zybuluo.com/mdeditor
```flow
index=>start: Vue的构造器 (/src/core/instance/index.js)
init=>operation: prototype._init (/src/core/instance/init.js)
cMount=>operation: prototype.mount (/src/platforms/web/entry-runtime-with-compiler.js)
e=>end
index->init->cMount
```

```graphLR
    A[mount] -->| options.render=false | B(options.template)
    B --> C{Decision}
    C -->|true| D[Result one]
    C -->|false| E[Result two]
```

```flow
mount=>operation: prototype.$mount (/src/platforms/web/runtime/index.js)
mountComponent=>operation: mountComponent (/src/core/instance/lifecycle.js)
updateComponentWatcher=>operation: Watcher (/src/core/oberser/watcher.js)
updateComponentWatcherGet=>operation: Watcher.get (/src/core/oberser/watcher.js)
updateComponentWatcherGetter=>operation: Watcher.getter (/src/core/oberser/watcher.js)
updateComponent=>operation: updateComponent (/src/core/instance/lifecycle.js)
render=>operation: vm._render (/src/core/instance/render.js)
update=>operation: vm._update (/src/core/instance/lifecycle.js)
e=>end
mount->mountComponent->updateComponentWatcher->updateComponentWatcherGet->updateComponentWatcherGetter->updateComponent
```

```seq
_render->B: _render/options.render (/src/core/instance/render.js)
```
```seq
B->_createElement: _createElement (/src/core/vdom/create-element.js)
```
```seq
_createElement->E: Vnode (/src/core/vdom/vnode.js)
```
```seq
_createElement->F: createComponent (/src/core/vdom/create-component.js)
```
```graphLR
_createElement --> D{tag}
D --> |html/svg标签/非标准标签| E[ new VNode ]
D --> |component/component名称| F[createComponent]
E --> |vnode结构|_render
F --> |vnode结构|_render
```

```seq
_update->BB: __patch__ (/src/core/instance/leftcycle.js)
BB-> CC:createElm (/src/core/instance/patch.js)
CC->DD:invokeCreateHooks
```

```graphLR
invokeCreateHooks --> D{hook}
D --> E[updateAttrs]
D --> |component/component名称| F[createComponent]
E --> |vnode结构|_render
F --> |vnode结构|_render
```


##### 在init里面做啥事？
 
 vm._uid 标识这个初始化唯一的id给这个实例
 
 vm._isVue 设置为true
 
 vm._renderProxy 设置vm
 
 vm._self 设置vm
 
 触发beforeCreate和created钩子
 
如果options里面有el就调用$mount,如果没有就需要手动调用$mount(el)

...

 ##### 在$mount里面做啥事？
 
 使用document.querySelectAll得到el
 
 在compiler+runtime版本里面compiler对$mount做了些补充
 主要是对render和template之前切换使用
 
 ...
 
 ##### 在mountComponent里面做啥事？
  
  vm.$el 存储el dom元素
  
 触发beforeMount
 
 设置vm._watcher绑定这个mountComponent函数
 
 并且调用_render 和 _update
 
 如果存在vm.$vnode
 vm._isMounted设置为true
 触发mounted钩子
 
 ...

 ##### _render里面做啥事？
 
 如果有options._parentVnode，
 vm.$scopedSlots设置options._parentVnode.data.scopedSlots
 vm.$vnode设置为options._parentVnode
 vnode.parent设置为options._parentVnode
 调用外部的render得到一个vnode

...

 #### _createElement里面做啥事
 
我们实例里面传递了tag，和data 和 children
形参中data没有的话，children可以提前

如果定了data.is，那么tag就变为data.is
通过options.render调用的创建vdom的方式是ALWAYS_NORMALIZE

通过 new Vnode得到一个含有tag,data,children的vode结构

...

 ##### _update里面做啥事？
 
 设置局部全局变量activeInstance = vm;
 
如果vm._isMounted那么就会触发一个beforeupdate

将vm._vnode设置为render函数得到的vnode

如果vm._vnode在次之前不存在
通过 vm.__patch__ 并且覆盖vm.$el
并清空
vm.$options._parentElm
vm.$options._refElm
如果之前vm.$el存在
清空之前$el.__vue__  并且为新的vm.$el.__vue__ = vm;重新赋值

满足
vm.$vnode
vm.$parent
vm.$vnode === vm.$parent._vnode
更新
vm.$parent.$el = vm.$el

...

 ##### __patch__里面做啥事？
 
 这个函数是src/platforms/web/runtime/index.js -> src/platforms/web/runtime/patch.js -> /src/platforms/web/runtime/node-ops.js
 
 在初始化的时候封装了平台的api，因为vnode兼容浏览器api和wexx的api

在update里面会有两个方式调用__patch__即oldVnode可能是dom也可以是vdom；第一次初始化的时候是dom

如果oldVnode是dom且属性定义了data-server-rendered，就标志服务器渲染，如果没有定义，oldVnode是就会转换为tag是dom的tag的vnode的并且用elm设置为dom

调用createElm创建新dom

...

 ##### createElm里面做啥事？
需要新的vnode，插入的队列，挂载的dom的父类（这里就说明挂载的dom不能是body），挂载dom的上一个兄弟dom

vnode.isRootInsert设置boolean

调用createComponent

//vnode.data.pre

1、如果有tag

如何有ns就调用createElementNS创建节点对象，否则createElement创建dom赋值给vnode.elm
调用setScope处理css作用域
调用createChildren递归调用createElm
调用invokeCreateHooks初始化vnode.data

2、否则vnode.isComment表示是注释节点 调用createComment

3、否则是文本 调用createTextNode

最后3个都调用insert插入节点

 ##### createComponent里面做啥事？
 
根据vnode.componentInstance和vnode.data.keepAlive来判断是否实例化
如果定义vnode.data.hook或者vnode.data.init就调用hook或者init
如果componentInstance存在就初始化

...

 ##### setScope里面做啥事？
vnode.fnScopeId
vnode.context
vnode.context.$options._scopeId
vnode.parent
vnode.fnContext
利用闭包全局activeInstance

##### invokeCreateHooks里面做啥事？

调用updateAttrs  （/src/platforms/web/runtime/modules/attrs.js）
调用updateClass （/src/platforms/web/runtime/modules/class.js）
调用 updateDOMListeners （/src/platforms/web/runtime/modules/events.js）
调用 updateDOMProps （/src/platforms/web/runtime/modules/dom-props.js）
调用 updateStyle （/src/platforms/web/runtime/modules/style.js）
调用 _enter （/src/platforms/web/runtime/modules/transition.js）
调用 create

使用闭包全局emptyNode

 ##### updateAttrs里面做啥事？
 
 针对vnode.data.attrs
 
  ##### updateAttrs里面做啥事？
 
 针对
 vnode.data. staticClass 
 vnode.data.class
 
 ##### updateDOMListeners里面做啥事？
 
  针对
 vnode.data.on
 
 设置闭包全局  target$1 = vnode.elm;
 
 调用normalizeEvent
 解析on的name
 "click"
 "~click" ->once
 "&click" ->passive
 "!click" ->capture

 调用addEventListener

  
 ```javascript
 vnode.data.on={click:function(){}}
封装
 vnode.data.on={click:{fns:[function(){}]}}
 封装成
 withMacroTask//这种有状态控制的function
 
  ```
  调用 add 添加,将事件绑定到闭包全局target$1
  
 然后删除oldvnode的绑定的事件

...

 ##### updateDOMProps里面做啥事？
 
 针对
 vnode.data.domProps

...

 ##### updateStyle里面做啥事？
 
针对
vnode.data.style
vnode.data.staticStyle

...

 ##### enter里面做啥事？
 
针对
vnode.data.show
vnode.data.transition

如果存在vnode.elm._leaveCb，就调用 并且 el._leaveCb.cancelled设置true

调用 resolveTransition

 ##### enter里面做啥事？
 
针对
vnode.data.ref
vnode.data.refInFor
vm.$refs;

 
---------------------------------------------------------------------------------------------------------------
vDom有哪些类型
通过源码/flow/vnode.js

-----------------------------------
vdom实现第三方库
snabbdom

-------------------------------------------------
  源码/src/core/instance/leftcycle.js

  对options.render做了相关的处理
  vm.$options.render = createEmptyVNode 在没有传递render函数的时候默认是createEmptyVNode

  update->__patch__利用了函数柯力化所以这个是函数提前把环境初始化好了
  
  这个在/src/partforms/run-time/index.js定义了__patch__
  
----------------------------------------------
  源码/src/core/observer/watcher.js
  
  getter=updateComponent
  
----------------------------------------------
源码/src/core/instance/render.js

手写的render方法会调用$createElement
template会调用_c

都会调用createElement，最后一个参数不一样，alwaysNormalize

----------------------------------------------------

源码/src/core/vdom/create-element.js

data如果是对象就是 VNodeData

 data是 VNodeData 数据结构

-----------------------------------------------------------------------------------------------------------------------------------

 源码src/core/vdom/patch.js

 hooks可以分以下几个类
 const hooks = ['create', 'activate', 'update', 'remove', 'destroy']
 
 createPatchFunction创建patch函数；把环境中信息存到cbs这个内部变量里面

 nodeOps平台相关的api

 调用createElm，将vnode挂载到真实的dom


 调用createElement，如果是node节点调用createElementNS


 setScope设置css作用域

 createChildren
 递归调用createElm

 调用insert，调用insertBefore，然后删除老的节点
 先插入子节点。
 


vnode和浏览器DOM中的Node一一对应
vdom是纯粹的JS对象
vdom的变更最终会转换成DOM操作
递归地进行同级vnode的diff

diff算法优化
首尾同类型节点、直接复用DOM、缩小了后续操作
同类节点，直接复用DOM、减少了后续操作

---------------------------------------------
