const gulp = require('gulp');
const jasmine = require('gulp-jasmine');
const gutil = require('gulp-util');
const yargs = require('yargs');

const settings = require('../src/settings.js');

var Reporter = require('jasmine-terminal-reporter');
var reporter = new Reporter({ isVerbose: true });
var oldSpecDone = reporter.specDone;

// show line number of spec that failed
reporter.specDone = function(result) {
  oldSpecDone(result);
  for (var i = 0; i < result.failedExpectations.length; i++) {
    gutil.log('\n' + result.failedExpectations[i].stack
      .split('\n')
      .filter((l) => !l.includes('node_modules'))
      .join('\n')
    );
  }
};
module.exports.reporter = reporter;



settings.modules.forEach(function(moduleName) {
  gulp.task('test:' + moduleName, function() {
    gulp.src(`spec/${moduleName}Spec.js`).pipe(jasmine());
  });
});

gulp.task('test-auto', function() {
  gulp.src('spec/wrapSpec.js').pipe(jasmine({
    verbose: yargs.argv.verbose,
    includeStackTrace: reporter
  }));
});

gulp.task('test', function() {
  gulp.src(['spec/wrapSpec.js'])
    .pipe(jasmine({
      verbose: true,
      includeStackTrace: yargs.argv.verbose,
      reporter
    }));
});
gulp.task('test-build', function() {
  gulp.src(['spec/buildSpec.js'])
    .pipe(jasmine({
      verbose: true,
      includeStackTrace: yargs.argv.verbose,
      reporter
    }));
});
gulp.task('test-conf', function() {
  gulp.src(['spec/confSpec.js'])
    .pipe(jasmine({
      verbose: true,
      includeStackTrace: yargs.argv.verbose,
      reporter
    }));
});
