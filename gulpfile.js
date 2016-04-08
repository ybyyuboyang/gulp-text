var gulp = require('gulp'),
	sass = require('gulp-sass'),
	nocache = require('gulp-nocache'),
	gulpSequence = require('gulp-sequence'),
    browserSync = require('browser-sync').create(),
    path = require('path'),
    routerMapping = require('./app/routerMapping'),
    _ = require('underscore'),
	clean = require('del');

var mockPath = './mock',
    ftlReg = /.*(ftl)$/g,
    jsonReg = /.*(json)$/g;

// 编译sass
gulp.task('sass', function(){
	return gulp.src('app/sass/**/*.scss')
	.pipe(sass().on('error', sass.logError))
	.pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({stream:true}));
})

// 模拟请求
gulp.task('webserver', function() {
    gulp.watch('app/**/*.scss', ['sass']);
    browserSync.init({
        server: {
            baseDir: "./",
            middleware:function handle(req, res, next){
                var router = _.findKey(routerMapping, function(val, key){
                    var keyReg = new RegExp(key);
                    return keyReg.test(req.url);
                });

                if(!router){
                    next();
                    return;
                }
                var jsonPath = routerMapping[router];

                res.setHeader("Content-Type", "application/json;charset=utf-8");
                res.write(JSON.stringify(require(path.join(__dirname, jsonPath))));
                res.end();
            }
        },
        files: "**",
        open: false,
    });
});

// build img
gulp.task('build_image', function() {
    return gulp.src('app/**/*.jpg')
        .pipe(nocache({
            type: 'media', // 可选取值：media/css/js/tpl
            dest: './build/[path][name].[hash:6].[ext]',
            sourceContext: './app',
            outputContext: './build'
        }))
        // 保存文件到nocache返回的路径中
        .pipe(gulp.dest(function(file) {return file.base}));
});

// build css
gulp.task('build_css', ['build_image'], function() {
    return gulp.src('app/**/*.css')
        .pipe(nocache({
            type: 'css',
            dest: './build/[path][name].[hash:6].[ext]',
            sourceContext: './app',
            outputContext: './build'
        }))
        .pipe(gulp.dest(function(file) {return file.base}));
});

// build js
gulp.task('build_js', ['build_image'], function() {
    return gulp.src('app/**/*.js')
        .pipe(nocache({
            type: 'js',
            dest: './build/[path][name].[hash:6].[ext]',
            sourceContext: './app',
            outputContext: './build'
        }))
        .pipe(gulp.dest(function(file) {return file.base}));
});

// 替换模板中的路径
gulp.task('build_tpl', ['build_css', 'build_js'], function() {
    return gulp.src('app/**/*.html')
        .pipe(nocache({
            type: 'tpl',
            dest: './build/[path][name].[ext]',
            sourceContext: './app',
            outputContext: './build'
        }))
        .pipe(gulp.dest(function(file) {return file.base}));
});

// 清理build目录
gulp.task('clean', function(){
	clean('build/')
})

gulp.task('server', gulpSequence('webserver'));
gulp.task('build', gulpSequence('clean', 'build_tpl'));









