const gulp = require('gulp');
const requireDir = require('require-dir');
requireDir('./tasks');
const jasmine = require('gulp-jasmine');

const yargs = require('yargs');
const settings = require('./src/settings.js');
const test = require('./tasks/test.js');

console.log(settings.modules)
gulp.task('test-gen', function() {
  gulp.src('spec/querySpec.js')
    .pipe(jasmine({ reporter: test.reporter }))
    .on('error', function(e) {
      //console.log(e.err.stack);
    });
});


gulp.task('test', function() {
  gulp.src(['spec/wrapSpec.js', 'spec/buildSpec.js'])
    .pipe(jasmine({ verbose: true, includeStackTrace: yargs.argv.verbose, reporter: test.reporter}));
});
