/*
 * Gulp config
 */

// Load plugins
var gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    concat       = require('gulp-concat'),
    concatCss    = require('gulp-concat-css'),
    minifyCss    = require('gulp-minify-css'),
    uglify       = require('gulp-uglify'),
    jshint       = require('gulp-jshint'),
    imagemin     = require('gulp-imagemin'),
    rename       = require('gulp-rename'),
    notify       = require('gulp-notify'),
    cache        = require('gulp-cache'),
    livereload   = require('gulp-livereload'),
    del          = require('del');

// Styles
gulp.task('css', function () {
  return gulp.src('src/client/sass/main.scss')
    .pipe(sass({ style : 'expanded' }))
    .pipe(autoprefixer({
      browsers : ['last 40 versions'],
      cascade  : false
    }))
    .pipe(gulp.dest('public/css'))
    .pipe(concatCss('all.css'))
    .pipe(rename({ suffix : '.min' }))
    .pipe(minifyCss({
      keepBreaks          : false,
      keepSpecialComments : 0
    }))
    .pipe(gulp.dest('public/css'))
    .pipe(notify({ message : 'CSS task complete.' }));
});

// Scripts
gulp.task('scripts', function () {
  return gulp.src([
    'src/client/js/lib/taffy.js',
    'src/client/js/lib/jquery-1.11.2.js',
    'src/client/js/lib/jquery.uriAnchor.js',
    'src/client/js/lib/jquery.event.gevent.js',
    'src/client/js/lib/jquery.event.ue.js',
    'src/client/js/app.js',
    'src/client/js/app.util.js',
    'src/client/js/app.data.js',
    'src/client/js/app.fake.js',
    'src/client/js/app.model.js',
    'src/client/js/app.util_browser.js',
    'src/client/js/app.shell.js',
    'src/client/js/app.chat.js',
    'src/client/js/app.avatar.js'
  ])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(concat('all.js'))
    .pipe(gulp.dest('public/js'))
    .pipe(rename({ suffix : '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest('public/js'))
    .pipe(notify({ message : 'Scripts task complete.' }));
});

// Images
gulp.task('images', function () {
  return gulp.src('src/client/images/**/*')
    .pipe(cache(imagemin({
      optimizationLevel : 3,
      progressive       : true,
      interlaced        : true })))
    .pipe(gulp.dest('public/images'))
    .pipe(notify({ message : 'Images task complete.' }));
});

// Clean
gulp.task('clean', function (callback) {
  del(['public/css', 'public/js', 'public/images'], callback);
});

// Watch
gulp.task('watch', function () {
  // Watch .scss files
  gulp.watch('src/client/sass/**/*.scss', ['css']);
  // Watch .js files
  gulp.watch('src/client/js/**/*.js', ['scripts']);
  // Watch image files
  gulp.watch('src/client/images/**/*', ['images']);
  // Create LiveReload server
  livereload.listen();
  // Watch any files in public/, reload on change
  gulp.watch(['public/**']).on('change', livereload.changed);
});

// Default task
gulp.task('default', ['clean'], function () {
  gulp.start('css', 'scripts', 'images');
});