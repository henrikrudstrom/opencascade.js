const gulp = require('gulp');
const requireDir = require('require-dir');
const jasmine = require('gulp-jasmine');
const dir = requireDir('./tasks');

gulp.task('test-gen', function() {
  gulp.src('spec/querySpec.js')
    .pipe(jasmine())
    .on('error', function(e) {
      console.log(e.err.stack);
    });
});


gulp.task('test', function() {
  gulp.src('spec/basicSpec.js').pipe(jasmine())
});
