/**
 * 项目入口文件
 * @name app.js
 * @kind file
 * @copyright src/app.js 2017/12/14
 * @author codingplayboy
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import 'babel-polyfill';
import './styles/clear.scss';
import 'normalize.css/normalize.css';
import './styles/common.scss';
import createStore, { makeRootSaga } from './store/';
import Routes from './routes/';
import appReducer, { AppSaga } from './store/AppFlux';
import articleReducer from './routes/Article/flux';
import homeReducer from './routes/Home/flux';
import CategoryListReducer, { CategoryListSaga } from './containers/CategoryList/flux';
// 重import可以看出来依赖哪些文件，我们看看webpack打包之后的这些文件样子
// 这个文件非常大14万行代码，汗颜，怎么看代码呢？看到配置向有个    devtool: 'source-map',这个就是应该用来调试用的
// 问题来了如何使用
// 还有个问题生成的文件在哪？
const rootSaga = makeRootSaga([AppSaga, CategoryListSaga]);

// 调用createStore方法创建store
const store = createStore({}, {
  app: appReducer,
  home: homeReducer,
  article: articleReducer,
  categoryList: CategoryListReducer
}, rootSaga);

const style = {
  container: {
    height: '100%',
    minHeight: '99%'
  }
};

/**
 * 项目根组件
 * @class App
 * @kind class
 * @extends Component
 * @see src/app.js
 */
class App extends Component {
  componentDidMount () {}

  componentDidCatch (error, info) {
    // You can also log the error to an error reporting service
    console.log(error, info);
  }

  render () {
    const { store } = this.props;

    return (
      <Provider store={store}>
        <div style={style.container}>
          <Routes />
        </div>
      </Provider>
    );
  }
}

// 渲染根组件
ReactDOM.render(
  <App store={store} />,
  document.getElementById('app')
);
