#vue 研究方向--vDom
-参考

https://blog.csdn.net/m6i37jk/article/details/78140159

https://mp.weixin.qq.com/s?__biz=MzI3NTM1MjExMg==&mid=2247483789&idx=1&sn=e7297ec3443007015117637709f27521&scene=21#wechat_redirect

https://blog.csdn.net/Forever201295/article/details/80048161

vnode和浏览器DOM中的Node一一对应
vdom是纯粹的JS对象
vdom的变更最终会转换成DOM操作
递归地进行同级vnode的diff
首尾同类型节点、直接复用DOM、缩小了后续操作
同类节点，直接复用DOM、减少了后续操作

---------------------------------------------
研究方法
1、如何创建一个vDom
2、vDom有多少属性、各个属性在哪使用
3、vDom的diff算法
4、vDom有哪些类型
-----------------------------
vDom有哪些类型
通过源码/flow/vnode.js
VNode
VNodeChildren
Component
VNodeComponentOptions
MountedComponentVNode
VNodeWithData
VNodeData
ScopedSlotsData

用法
new Vue({
render:function(createElement){
return createElement("div",{attr,style})
}})

new Vue({
template:component
})

new Vue({
el:"#id"
})
-----------------------------------
vdom实现第三方库
snabbdom

-------------------------------------------------
源码/src/core/instance/leftcycle.js
mountComponent
对options.render做了相关的处理
vm.$options.render = createEmptyVNode 在没有传递render函数的时候默认是createEmptyVNode
 通过渲染的wather来代理调用
  vm._watcher = new Watcher(vm, updateComponent, noop)
  
  updateComponent -> render -> update
  
  render得到一个vnode
  update就是降vnode渲染成dom
  
  update->__patch__利用了函数柯力化所以这个是函数提前把环境初始化好了
  
  这个在/src/partforms/run-time/index.js定义了__patch__
  
  ----------------------------------------------
  源码/src/core/observer/watcher.js
  
  getter=updateComponent
  
  get里面
  getter.call(vm,vm)
  ==
  updateComponent.call(vm,vm)
----------------------------------------------
源码/src/core/instance/render.js
这个会调用options.render
vnode = render.call(vm._renderProxy, vm.$createElement)

这个由于会被代理
render就会触发get
      
vm.$createElement  ->createElement 闭包的方式把vm带入到createElement
手写的render方法会调用$createElement
template会调用_c

都会调用createElement，最后一个参数不一样，alwaysNormalize
----------------------------------------------------
源码/src/core/vdom/create-element.js
文本vnode
createTextVNode(children)-===new VNode(undefined, undefined, undefined, String(val));
createElement
  context: Component,
  tag: any,
  data: any,
  children: any,
  normalizationType: any,
  alwaysNormalize: boolean
  
  
   createElement('button', {
                 is：
            on: {
              click: this.clickHandler，

            },
          }, '点我改变内部data值')
          
createElement(vm,"div")
          tag = button
          data={on}
          children = '点我改变内部data值'
          
data如果是对象就是 VNodeData如果是其他表示是children

 data有 VNodeData 数据结构
 通过源码/flow/vnode.js
  key?: string | number;
  slot?: string;
  ref?: string;
  is?: string;
  pre?: boolean;
  tag?: string;
  staticClass?: string;
  class?: any;
  staticStyle?: { [key: string]: any };
  style?: Array<Object> | Object;
  normalizedStyle?: Object;
  props?: { [key: string]: any };
  attrs?: { [key: string]: string };
  domProps?: { [key: string]: any };
  hook?: { [key: string]: Function };
  on?: ?{ [key: string]: Function | Array<Function> };
  nativeOn?: { [key: string]: Function | Array<Function> };
  transition?: Object;
  show?: boolean; // marker for v-show
  inlineTemplate?: {
    render: Function;
    staticRenderFns: Array<Function>;
  };
  directives?: Array<VNodeDirective>;
  keepAlive?: boolean;
  scopedSlots?: { [key: string]: Function };
  model?: {
    value: any;
    callback: Function;
  };

is
如果存在就是tag

on
并没有看到在render里面对on进行处理
只看到render产出了vnode

  
  
  ---------------
  tag
  如果不存在且is也不存在，就会调用createEmptyVNode
  会检查svg和MathML，即tag可以说是（slot,component，type,tag,attrsList,attrsMap,plain,parent,children,attrs，stop,prevent,self,ctrl,shift,alt,meta,exact）和math
  如果tag字符串是这些标签
  
  1、
  ---svg tag
  
 ---html tag
a: true
abbr: true
address: true
area: true
article: true
aside: true
audio: true
b: true
base: true
bdi: true
bdo: true
blockquote: true
body: true
br: true
button: true
canvas: true
caption: true
cite: true
code: true
col: true
colgroup: true
content: true
data: true
datalist: true
dd: true
del: true
details: true
dfn: true
dialog: true
div: true
dl: true
dt: true
element: true
em: true
embed: true
fieldset: true
figcaption: true
figure: true
footer: true
form: true
h1: true
h2: true
h3: true
h4: true
h5: true
h6: true
head: true
header: true
hgroup: true
hr: true
html: true
i: true
iframe: true
img: true
input: true
ins: true
kbd: true
label: true
legend: true
li: true
link: true
main: true
map: true
mark: true
menu: true
menuitem: true
meta: true
meter: true
nav: true
noscript: true
object: true
ol: true
optgroup: true
option: true
output: true
p: true
param: true
picture: true
pre: true
progress: true
q: true
rp: true
rt: true
rtc: true
ruby: true
s: true
samp: true
script: true
section: true
select: true
shadow: true
small: true
source: true
span: true
strong: true
style: true
sub: true
summary: true
sup: true
table: true
tbody: true
td: true
template: true
textarea: true
tfoot: true
th: true
thead: true
time: true
title: true
tr: true
track: true
u: true
ul: true
var: true
video: true
wbr:
  2、是component字符串
       vnode = createComponent(Ctor, data, context, children, tag)
  3、其他
  
  那么就会调用
   vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
  
  得到vnode.tag = tag,vnode.data=data,vnode.children=children,vnode.text = undefinded vnode.elm =undefinded vnode.context = context
  -----------------------------------------------------------------------------------------------------------------------------------
  
  源码src/core/vdom/patch.js
createPatchFunction创建patch函数
把环境中信息存到cbs这个内部变量里面
  return function patch (oldVnode, vnode, hydrating, removeOnly, parentElm, refElm) 
  oldVnode是真实的dom
  如果不存在
  
  如果存在且是不是真实的dom
  
如果存在且是真实的dom
如果属性上有SSR_ATTR表示服务器渲染data-server-rendered


  调用createElm，将vnode挂载到真实的dom
  将 oldVnode = emptyNodeAt(oldVnode)得到真实的vnode
  
  createElm (vnode, insertedVnodeQueue, parentElm, refElm, nested) 
 调用createElement，如果是node节点调用createElementNS
 nodeOps平台相关的api
 
 setScope设置css作用域
 
 createChildren
 递归调用createElm
 
 调用insert，调用insertBefore，然后删除老的节点
 先插入子节点。
 

