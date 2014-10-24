var gulp = require('gulp'),
  gutil = require('gulp-util'),
  merge = require('merge-stream'),
  concat = require('gulp-concat'),
  clean = require('gulp-clean'),
  less = require('gulp-less'),
  browserify = require('gulp-browserify'),
  minifyCSS = require('gulp-minify-css'),
  minifyJS = require('gulp-uglify'),
  minifyHTML = require('gulp-minify-html'),
  ngAnnotate = require('gulp-ng-annotate'),
  bowerMainFiles = require('main-bower-files'),
  bowerInstall = require('gulp-install'),
  angularTemplates = require('gulp-angular-templatecache');

// TODO: add livereload & sourcemaps
// TODO: troubleshoot `--type production` not working right

gulp.task('bowerInstall', function() {
  return gulp.src(['./bower.json'])
    .pipe(bowerInstall());
});

gulp.task('bower', ['bowerInstall'], function() {
  return merge(
    gulp.src(bowerMainFiles({filter:/.+\.js$/}))
      .pipe(concat('vendor.js'))
      .pipe(gutil.env.type === 'production' ? minifyJS() : gutil.noop())
      .pipe(gulp.dest('public/')),
    
    gulp.src(bowerMainFiles({filter:/.+\.css$/}))
      .pipe(concat('vendor.css'))
      .pipe(gutil.env.type === 'production' ? minifyCSS() : gutil.noop())
      .pipe(gulp.dest('public/'))
  );
});

gulp.task('templates', function(){
  gulp.src('app/templates/**/*.html')
    .pipe(gutil.env.type === 'production' ? minifyHTML() : gutil.noop())
    .pipe(angularTemplates({standalone: true}))
    .pipe(gulp.dest('public/'));
});

gulp.task('js', function() {
  return gulp.src('app/js/app.js')
    .pipe(browserify({ paths: [ 'app/js' ] }))
    .pipe(ngAnnotate())
    .pipe(gutil.env.type === 'production' ? minifyJS() : gutil.noop())
    .pipe(gulp.dest('public/'));
});

gulp.task('less', function() {
  return gulp.src('app/less/app.less')
    .pipe(less({ paths: [ 'app/less' ] }))
    .pipe(minifyCSS())
    .pipe(gulp.dest('public/'))
});

gulp.task('assets', function() {
  return merge(
    gulp.src('app/assets/**/*.html')
      .pipe(gutil.env.type === 'production' ? minifyHTML() : gutil.noop())
      .pipe(gulp.dest('public/')),
    
    gulp.src('app/assets/fonts/**/*')
      .pipe(gutil.env.type === 'production' ? minifyHTML() : gutil.noop())
      .pipe(gulp.dest('public/fonts/'))
  );
});

gulp.task('default', ['bower', 'assets', 'templates', 'js', 'less'], function() {});

gulp.task('clean', function() {
  return gulp.src(['bower_components/', 'public/'], {read: false})
    .pipe(clean());
});

var server;
var port = gutil.env.port || process.env.PORT || 8000;


gulp.task('serverStop', function() {
  if (server && server.close){
    server.close();
    for (i in require.cache){
      if (i.indexOf(__dirname + '/server/models/') === 0) continue;
      if (i.indexOf(__dirname + '/server/') === 0){
        delete require.cache[i];
      }
    }

    server = null;
  }
});

gulp.task('serverStart', function() {
  server = require('./server').listen(port);
});

gulp.task('watch', ['default'], function() {
  gulp.watch('bower.json', ['bower']);
  gulp.watch('app/**/*.js', ['js']);
  gulp.watch('app/**/*.html', ['templates']);
  gulp.watch('app/**/*.less', ['less']);
  gulp.watch('server/**/*', ['serverStop', 'serverStart']);
  gulp.watch('app/assets/**/*', ['assets']);
});

gulp.task('server', ['watch', 'serverStart'], function() {
  gutil.log('Listening on', gutil.colors.underline(gutil.colors.blue('http://0.0.0.0:' + port)));
});
