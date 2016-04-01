const gulp = require('gulp');
const jasmine = require('gulp-jasmine');
const yargs = require('yargs');


var Reporter = require('jasmine-terminal-reporter');
var reporter = new Reporter({ isVerbose: true });
var oldSpecDone = reporter.specDone;

//show line number of spec that failed
reporter.specDone = function(result) {
  oldSpecDone(result);
  for (var i = 0; i < result.failedExpectations.length; i++) {
    console.log('\n' + result.failedExpectations[i].stack)
      .split('\n')
      .filter((l) => !l.includes('node_modules'))
      .join('\n');
  }
}
module.exports.reporter = reporter;




const settings = require('../src/settings.js');

settings.modules.forEach(function(moduleName) {
  gulp.task('test:' + moduleName, function() {
    gulp.src(`spec/${moduleName}Spec.js`).pipe(jasmine());
  });
});
gulp.task('test-auto', function() {
  gulp.src('spec/wrapSpec.js').pipe(jasmine({
    verbose: yargs.argv.verbose,
    includeStackTrace:
    reporter
  }));
});
