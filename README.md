

# GulpTaskDemo

#### 一个简单的gulp实例Demo，通过run-Sequence控制项目流程 分别创建了 开发环境服务和生产环境服务

项目中文件夹等说明

build 放置编译处理后发布的 即生产环境文件夹
src 中放置源代码/文件/静态资源等

##### git down下来的代码需要 进行 npm install 安装一下package.json中相应组件

//
项目根目录中创建gulpfile.js文件

```js
  

// 项目控件引入//及对应的说明
var gulp = require('gulp');
var less = require('gulp-less'); //less编译
var concat = require('gulp-concat'); //CSS 合并
var cleanCss = require('gulp-clean-css'); //css压缩
var del = require('del'); //删除文件/文件夹
var babel = require('gulp-babel'); //ECMA6 -> ECMA5
var uglify = require('gulp-uglify'); //压缩js
var rename = require('gulp-rename'); //文件改名
var imagemin = require('gulp-imagemin'); //图片压缩
var spriter = require('gulp-css-spriter'); //将图片处理成 雪碧图【即多张图片资源处理成一张组合图】
var base64 = require('gulp-base64'); // 将url资源文件进行base64字节码处理
var browserSync = require('browser-sync').create(); //创建实例 ，浏览器实时快速响应文件更新自动刷新
var reload = browserSync.reload;
var rev = require('gulp-rev'); //版本控制
var revCollector = require('gulp-rev-collector'); //版本控制 对（映射文件）对应修改
var notify = require('gulp-notify'); //消息通知//即可通过服务端向终端发送指定消息，通知等
var runSequence = require('run-sequence'); //项目操作流程控制先后顺序等【即控制task任务执行顺序】


```

#### 其他部分代码中有详细说明
