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
4、
