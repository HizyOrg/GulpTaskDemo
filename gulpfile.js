/*
    说明:XXX
*/

// 项目控件引入
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
/*
//runSequence 说明： 
    runSequence(['A','B','C'],['D']);
    在参数中：[]内任务同步执行（异步操作），[]之间的任务顺序执行 即上一个执行完执行下一个
*/


//生产环境文件路径
var build = {
    basePath: './build/',
    css: './build/css/',
    images: './build/images/',
    js: './build/js/'
}
//开发环境文件路径
var src = {
    basePath: './src/',
    css: './src/css/',
    images: './src/images/',
    js: './src/js/',
    less: './src/less/'
}

/*
    开发模式下

    **开发环境和生产环境要分开//即不能在开发中将开发环境的文件直接dest()操作到生产环境
*/
//开发模式下静态服务器
gulp.task('server:dev', function () {
    browserSync.init({
        server: {
            baseDir: src.basePath,
            index: 'index.html'
        },
        port: 8080
    });

    //启动文件监听
    //文件监听事件 路径前面不能带./ 如果带上会导致 新增文件不能监听
    gulp.watch("src/*.html", ["html:dev"]);
    gulp.watch("src/less/*.less", ["less"]);
    gulp.watch("src/css/*.css", ["css:dev"]);
    gulp.watch("src/js/*.js", ["js:dev"]);

    //项目执行流程控制
    runSequence(['less'], ['css:dev', 'js:dev']);
});

//html 任务
gulp.task('html:dev', function () {
    gulp.src([
            src.basePath + '*.html'
        ])
        .pipe(gulp.dest(src.basePath))
        .pipe(reload({
            stream: true
        }))
});

//less 任务
gulp.task('less', function () {
    gulp.src(src.less + '*.less')
        .pipe(less())
        .pipe(gulp.dest(src.css))
        .pipe(reload({
            stream: true
        }))
});
//css 任务
gulp.task('css:dev', function () {
    //读取开发环境css文件中除过all.min.css 及all.css一类css文件
    gulp.src([src.css + '*.css', '!' + src.css + 'all.min.css', '!' + src.css + 'all.css'])
        //css合并
        .pipe(concat('all.css'))
        //对css中图片进行雪碧图处理//并替换url中图片为生成的雪碧图
        .pipe(spriter({
            'spriterSheet': src.css + 'spritersheet.png',
            'pathToSpriteSheetFromCSS': '../images/spritesheet.png'
        }))
        //输出一个未压缩版本
        .pipe(gulp.dest(src.css))
        //css压缩
        .pipe(cleanCss())
        //对压缩后的文件进行重命名
        .pipe(rename('./all.min.css'))
        //输出一个压缩版本
        .pipe(gulp.dest(src.css))
        //启动服务器自动监听重新加载
        .pipe(reload({
            stream: true
        }))
        //消息通知
        //其中 <=% file.relative %>! 是指消息提醒文件的来源
        .pipe(notify("已修改完css XXX <%= file.relative %>!"))
});

//js 任务
gulp.task('js:dev', function () {
    //读取开发环境js文件中除过all.min.js 及all.js一类js文件
    gulp.src([src.js + '*.js', '!' + src.js + 'all.js', '!' + src.js + 'all.min.js'])
        //对文件进行转码 ECMA6 -> ECMA5
        .pipe(babel({
            presets: ['es2015']
        }))
        //js合并
        .pipe(concat('all.js'))
        //输出一个未压缩版
        .pipe(gulp.dest(src.js))
        //js压缩
        .pipe(uglify())
        //压缩后重命名
        .pipe(rename('./all.min.js'))
        //输出压缩且重命名js
        .pipe(gulp.dest(src.js))
        //启动服务器自动监听重新加载     
        .pipe(reload({
            stream: true
        }))
});

//******************* 生产环境下  ********************* */

//生产模式下的服务器
gulp.task('server:product', function () {
    // runSequence(['imagemin', 'publish:html', 'publish:css', 'publish:js'], ['rev']);
    runSequence(['publish:html', 'publish:css', 'publish:js'], ['rev']);
    browserSync.init({
        server: {
            baseDir: build.basePath,
            index: 'index.html'
        },
        port: 8081
    });
});

//该组件
//压缩图片//只限jpg,png
gulp.task('imagesmin', function () {
    //取出开发环境所有图片文件
    gulp.src(src.images + '*.*')
        //进行图片压缩
        .pipe(imagemin())
        //在生产环境部署
        .pipe(gulp.dest(build.images))
});

//移动开发环境到生产环境
gulp.task('publish:html', function () {
    gulp.src(src.basePath + '*.html')
        .pipe(gulp.dest(build.basePath))
});

//开发环境css部署到生产环境
gulp.task('publish:css', function () {
    //取出开发环境合并压缩后的css
    gulp.src(src.css + 'all.min.css')
        //可选//对生产环境的css中Url引用图片等进行字节码处理
        .pipe(base64())
        //版本控制//发布新版本
        .pipe(rev())
        //部署到生产环境
        .pipe(gulp.dest(build.css))
        //生成版本控制映射文件
        .pipe(rev.manifest())
        //将生成的版本映射文件放在 rev目录下
        .pipe(gulp.dest('./rev/css/'))
});
//开发环境的js文件部署到生产环境下
gulp.task('publish:js', function () {
    //取出开发环境合并压缩后的js文件    
    gulp.src(src.js + 'all.min.js')
        //版本控制//发布新版本
        .pipe(rev())
        //生成版本控制映射文件
        .pipe(rev.manifest())
        //将映射文件放在指定目录下
        .pipe(gulp.dest('./rev/js/'))
});

//删除 生产环境目录文件【不放入版本流程控制中】//有需要用到可单独执行
gulp.task('del:bulid', function () {
    del([
        build.basePath
    ])
});

//版本控制操作-->revCollector根据映射文件替换页面等中的引用文件到对应版本
gulp.task('rev', function () {
    return gulp.src(['./rev/**/*.json', build.basePath + '*.html'])
        .pipe(revCollector({
            //使用默认操作//可结合API查阅其他规则
        }))
        .pipe(gulp.dest(build.basePath));
});