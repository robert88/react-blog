/**
 * @desc webpack开发环境配置文件
 */

const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const PUBLICPATH = '/assets/';
const PORT = '9090';
const ENV = process.env.NODE_ENV || 'dev';

const options = {
  // publicPath: '/', // for `ip:port`, not need `ip:port/${output}`
  publicPath: PUBLICPATH,
  loaders: {
    styles: ['style-loader', 'css-loader', 'postcss-loader'],
    imageAssets: 'url-loader?limit=6000&name=[path][name].[ext]?[hash:8]',
    iconFonts: [{
      loader: 'url-loader',
      query: {
        limit: 10000,
        name: '[path][name].[ext]?[hash:8]'
      }
    }]
  },
  globals: {
    'process.env': {
      'NODE_ENV': JSON.stringify(ENV)
    },
    '__DEV__': ENV === 'dev',
    '__PROD__': ENV === 'production',
    '__TEST__': ENV === 'test'
  },
  beforePlugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
};
//代码到这里我完全蒙b了，代码是如何跑的就return个什么鬼，写个debugger来调试吧，怎么启动这个debugger呢？
//从yarn一般按照并且有批处理能力的会在环境路径里面可以看到path里面有两个路径一个node的路径一个是npm全局按照的路径
//找到yarn.bat 经典的写法之后我可以知道以后的批处理也可以这样写可以从命令行里面看出执行node node_moudle/yarn/yarn.js

//打开yarn.js
//https://www.cnblogs.com/qinmengjiao123-123/p/8503163.html
//fs.existsSync(v8CompileCachePath)v8CompileCachePath并没有带文件后缀名，也是可以的
//process.env.DISABLE_V8_COMPILE_CACHE这个网上也找不到资料
// 只能从字面上理解
//我们来认识一下箭头函数《es6 箭头函数》

//process.getuid
//https://www.cnblogs.com/Joans/p/4462993.html
//获取缓存路径
//os.tmpdir()方法返回一个字符串, 表明操作系统的默认临时文件目录
//https://zhidao.baidu.com/question/538124386.html《win7临时目录.docx》
//代码没有执行cache
//原来#!/usr/bin/env node会将console.log信息屏蔽掉
module.exports = function (args) {
console.log(args.ROOTPATH)
  options.ROOTPATH = args.ROOTPATH;
  options.env = args.env;
//base.conf这个才是重点
  return webpackMerge(require('./base.conf')(options), {
    devtool: 'source-map',
    devServer: {
      contentBase: path.join(args.ROOTPATH, './src'),//它指定了服务器资源的根目录，如果不写入contentBase的值，那么contentBase默认是项目的目录。
      historyApiFallback: true,//，这个配置属性是用来应对返回404页面时定向到特定页面用的
      inline: true,
      hot: true,
        //quiet当它被设置为true的时候，控制台只输出第一次编译的信息，当你保存后再次编译的时候不会输出任何内容，包括错误和警告
      port: PORT,//port配置属性指定了开启服务的端口号
      host: '127.0.0.1',//host设置的是服务器的主机号：
      proxy: {
        '/': {
          bypass: function (req, res, proxyOptions) {
            console.log('Skipping proxy for browser request.');
            return `${PUBLICPATH}index.html`;
          }
        }
      }
    },
    plugins: []
  });
};
