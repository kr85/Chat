var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var concatCss = require('gulp-concat-css');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');

gulp.task('css', function () {
  gulp.src('sass/main.scss')
    .pipe(sass())
    .pipe(autoprefixer('last 50 versions'))
    .pipe(concatCss('all.css'))
    .pipe(minifyCss({keepBreaks: false}))
    .pipe(gulp.dest('assets/css'))
});

gulp.task('scripts', function () {
  gulp.src([
    'js/lib/jquery-1.11.2.js',
    'js/lib/jquery.uriAnchor.js',
    'js/app.js',
    'js/app.shell.js'
  ])
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(gulp.dest('assets/js'))
});

gulp.task('watch', function () {
  gulp.watch('sass/**/*.scss', ['css'])
  gulp.watch('js/**/*.js', ['scripts'])
});

gulp.task('default', ['css', 'scripts']);