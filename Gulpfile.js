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
  return gulp.src('sass/main.scss')
    .pipe(sass({ style : 'expanded' }))
    .pipe(autoprefixer({
      browsers : ['last 40 versions'],
      cascade  : false
    }))
    .pipe(gulp.dest('assets/css'))
    .pipe(concatCss('all.css'))
    .pipe(rename({ suffix : '.min' }))
    .pipe(minifyCss({
      keepBreaks          : false,
      keepSpecialComments : 0
    }))
    .pipe(gulp.dest('assets/css'))
    .pipe(notify({ message : 'CSS task complete.' }));
});

// Scripts
gulp.task('scripts', function () {
  return gulp.src([
    'js/lib/taffy.js',
    'js/lib/jquery-1.11.2.js',
    'js/lib/jquery.uriAnchor.js',
    'js/lib/jquery.event.gevent.js',
    'js/lib/jquery.event.ue.js',
    'js/app.js',
    'js/app.util.js',
    'js/app.data.js',
    'js/app.fake.js',
    'js/app.model.js',
    'js/app.util_browser.js',
    'js/app.shell.js',
    'js/app.chat.js',
    'js/app.avatar.js'
  ])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(concat('all.js'))
    .pipe(gulp.dest('assets/js'))
    .pipe(rename({ suffix : '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest('assets/js'))
    .pipe(notify({ message : 'Scripts task complete.' }));
});

// Images
gulp.task('images', function () {
  return gulp.src('images/**/*')
    .pipe(cache(imagemin({
      optimizationLevel : 3,
      progressive       : true,
      interlaced        : true })))
    .pipe(gulp.dest('assets/images'))
    .pipe(notify({ message : 'Images task complete.' }));
});

// Clean
gulp.task('clean', function (callback) {
  del(['assets/css', 'assets/js', 'assets/images'], callback);
});

// Watch
gulp.task('watch', function () {
  // Watch .scss files
  gulp.watch('sass/**/*.scss', ['css']);
  // Watch .js files
  gulp.watch('js/**/*.js', ['scripts']);
  // Watch image files
  gulp.watch('images/**/*', ['images']);
  // Create LiveReload server
  livereload.listen();
  // Watch any files in assets/, reload on change
  gulp.watch(['assets/**']).on('change', livereload.changed);
});

// Default task
gulp.task('default', ['clean'], function () {
  gulp.start('css', 'scripts', 'images');
});