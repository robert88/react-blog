http缓存.md
[浏览器HTTP缓存原理分析](https://www.cnblogs.com/tzyy/p/4908165.html)

情景一：若没有过期，则不向服务器发送请求，直接使用缓存中的结果，此时我们在浏览器控制台中可以看到  200 OK(from cache) ，此时的情况就是完全使用缓存，浏览器和服务器没有任何交互的。

情景二：若已过期，则向服务器发送请求，此时请求中会带上①中设置的文件修改时间，和Etag

[浏览器缓存，状态码200与304](https://www.jianshu.com/p/75ff40c61665)

浏览器根据什么来判断请求是有缓存的？

[REST笔记(五):你应该知道的HTTP头------ETag](https://www.cnblogs.com/tyb1222/archive/2011/12/24/2300246.html)

[Last-Modify、ETag、Expires和Cache-Control(转载)](https://www.cnblogs.com/coolmanlee/archive/2012/12/06/2805030.html)

[request的cache-control和response cache-control不同点](https://www.cnblogs.com/maxomnis/p/5577445.html)
响应头


Last-Modified

 ETag
 
Cache-Control

Expires （废弃）

请求头

If-Modified-Since

If-None-Match

Cache-Control

Pragma（废弃）

--------------------------------------------------------------
Last-Modified 与 If-Modified-Since 对应的，前者是响应头，后者是请求头它的值是上一次的Last-Modified。

Etag 与 If-None-Match 是对应的，前者是响应头，后者是请求头它的值是上一次的Etag。
 
 ETag有两种类型：强ETag(strong ETag)与弱ETag(weak ETag)。

强ETag表示形式："22FAA065-2664-4197-9C5E-C92EA03D0A16"。

弱ETag表现形式：w/"22FAA065-2664-4197-9C5E-C92EA03D0A16"。
 
 计算ETag值开销最大的一般是计算采用哈希算法

获取资源的表述值。可以只计算资源的哈希值，也可以将头信息和头信息的值也包含进去。如果包含头信息，那么注意

不要包含计算机标识的头信息。同样也应该避免包含Expires、Cache-Control和Vary头信息。注意：在通过哈希算法

计算ETag值时，先要组装资源的表述。若组装也比较耗时，可以采用生成GUID的方式。优化ETag值的获取。

① Cache-Control  用来做缓存过期判断  
常用指令：  
no-cache  不直接使用缓存，始终向服务器发起请求  
max-age  缓存过期时间，是一个时间数值，比如3600秒，设置为0的时候效果等同于no-cache  
s-maxage  给缓存代理用的指令，对直接返回资源的server无效，当s-maxage生效时，会忽略max-age的值  
only-if-cached 若有缓存，则只使用缓存，若缓存文件出问题了，请求也会出问题  

Cache-Control是通用的头，响应头的作用是设置，请求头的作用是检测

chrome：再访问相同的URL时候是发出if-modified-since。这说明即使接收到cache-control:no-contro，chrome也会进行缓存。

IE9:再次访问相同URL时，跟第一次访问（无缓存情况下）一样，没有if-modified-since，也没有其他缓存相关的头域，而且缓存文件夹也没有缓存文件。也就是说，IE9接收到cache-control:no-contro，不会将response内容缓存起来。

FF：跟IE9行为类似

而另外，cache-control：no-store出现在response中才有意义，意思是告诉缓存系统不要缓存或者存储response内容（不要任何形式的存储，包括存储在缓存文件夹中，以免一些敏感信息外泄）。chrome,IE9,FF对这个头的实现是一样的。当接收到有这个头的response，三个浏览器的缓存目录都找不到相关的缓存文件。

   只有get请求会被缓存，post请求不会
   
---------------------------------------------------------

200 ok  　　　　　　　　----  从原始服务器请求成功

200 ok from cache   　  ----

200 ok from disk cache  ----

200 ok from memory cache ----

304 not modified          ----  向服务器发送请求，验证新鲜度，足够新鲜，服务器会返回 304状态
304 Not Modified (from memory cache) 不会向服务器发送请求

对于js和其他文件如果直接通过浏览器url打开，request的cache-control一直是max-age=0  
如果用html引用js那么浏览器请求就是 200 ok from disk cache

200 ok from memory cache ----浏览器关闭之后，缓存就会清除


当浏览器F12 里面设置了勾选了disable chache选项之后request的 Cache-Control: no-cache，if-modified-since和if-none-match就会清除；js文件就会再次200请求，不会影响response的对浏览器的设置，即if-modified-since和if-none-match在去掉设置之后，还是起作用。
 
 当去掉了disable cache之后浏览器就会把之前的if-modified-since和if-none-match带上，如果不变的话就是304
 
*画流程图 https://www.zybuluo.com/mdeditor

场景一：
 
 设置response头部Cache-Control:max-age=36000
设置10个小时
那么第一次打开html
index.html 200
index.js 200

刷新浏览器
index.html 304
index.js 200 cache form memory

关闭浏览器
index.html 200 cache from desk
index.js 200 cache from desk

刷新浏览器
index.html 304
index.js 200 cache form memory


浏览器url打开index.js

index.js 304 Not Modified

场景二：

 设置response头部Cache-Control:max-age=36000
设置10个小时
那么第一次打开html，
index.html 200
index.js 200

刷新浏览器
index.html 304
index.js 200 cache form memory

（f12设置disable cache）

刷新浏览器
index.html 200
index.js 200 

（去掉disable cache）

刷新浏览器 
index.html 304
index.js 200 cache form memory

场景三：

设置response头部Cache-Control:max-age=0  
不缓存  
那么第一次打开html  
index.html 200  
index.js 200  

刷新浏览器
index.html 304  
index.js 304  


刷新浏览器
index.html 304  
index.js 304  

关闭浏览器
index.html 304  
index.js 304  


设置response头部Cache-Control:max-age=600  
刷新浏览器  
index.html 304 Cache-Control:max-age=600  
index.js 304 Not Modified (from memory cache)Cache-Control: max-age=600  （工作浏览器，应该浏览器的问题）
index.js 304 Not Modified (Cache-Control: max-age=600  （家里浏览器）

刷新浏览器
index.html 304 Cache-Control:max-age=600  
index.js 304 Not Modified (from memory cache) Cache-Control:max-age=0  工作浏览器，应该浏览器的问题）
index.js 200(from memory cache) Cache-Control:max-age=0  （家里浏览器）

直接打开index.js刷新
index.js304

再次设置response头部Cache-Control:max-age=0  

刷新浏览器
index.html 304 Cache-Control
index.js 200 (from memory cache) 

场景四：

 设置response头部Cache-Control:no-store
不缓存  
那么第一次打开html  
index.html 200  
index.js 200  

刷新浏览器
index.html 200  
index.js 200  

关闭浏览器
index.html 200  
index.js 200 



总结
url上直接打开的文件永远过期，但有缓存

中途改变max-age只有js可以缓存，即文件过期了之后才会重新设置max-age

浏览器针对不同格式的文件有不容缓存机制

Cache-control:max-age=0和no-store，在于max-age可以命中缓存，no-store永远是200，没有304

当设置了cache-control:2000如果缓存没有过期，在设置cache-control:0是不起作用

当url改变时，如加版本号，请求会变200

如何查看缓存是否过期
https://www.cnblogs.com/shixiaomiao1122/p/7591556.html

chrome://view-http-cache
版本chrome69找不到页面；





