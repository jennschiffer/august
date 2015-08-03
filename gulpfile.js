var jshint = require('gulp-jshint');
var jshintStylish = require('jshint-stylish');
var gulp = require('gulp');

gulp.task('default', function(){
  return gulp.src('./js/app/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(jshintStylish))
    .pipe(jshint.reporter('fail'));
});