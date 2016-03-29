const gulp = require('gulp');
const requireDir = require('require-dir');
const jasmine = require('gulp-jasmine');
const dir = requireDir('./tasks');
const yargs = require('yargs');

gulp.task('test-gen', function() {
  gulp.src('spec/querySpec.js')
    .pipe(jasmine())
    .on('error', function(e) {
      //console.log(e.err.stack);
    });
});


gulp.task('test', function() {
  gulp.src(['spec/wrapSpec.js', 'spec/buildSpec.js'])
    .pipe(jasmine({ verbose: true, includeStackTrace: yargs.argv.verbose }));
});
