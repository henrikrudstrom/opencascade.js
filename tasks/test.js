const gulp = require('gulp');
const jasmine = require('gulp-jasmine');

// module.exports.myReporter = {
//   jasmineStarted(suiteInfo) {
//     console.log(suiteInfo)
//     console.log('Running suite with ' + suiteInfo.totalSpecsDefined);
//   },
//
//   suiteStarted(result) {
//     console.log('Suite started: ' + result.description + ' whose full description is: ' + result.fullName);
//   },
//
//   specStarted(result) {
//     console.log('Spec started: ' + result.description + ' whose full description is: ' + result.fullName);
//   },
//
//   specDone(result) {
//     console.log('Spec: ' + result.description + ' was ' + result.status);
//     for (var i = 0; i < result.failedExpectations.length; i++) {
//       console.log('Failure: ' + result.failedExpectations[i].message);
//       console.log(result.failedExpectations[i].stack.split('\n').filter((l) => !l.includes('node_modules')).join('\n'));
//     }
//     //console.log(result)
//     console.log(result.passedExpectations.length);
//   },
//
//   suiteDone(result) {
//     console.log('Suite: ' + result.description + ' was ' + result.status);
//     for (var i = 0; i < result.failedExpectations.length; i++) {
//       console.log('AfterAll ' + result.failedExpectations[i].message);
//       console.log(result.failedExpectations[i].stack);
//     }
//   },
//
//   jasmineDone() {
//     console.log('Finished suite');
//   }
// };

var Reporter = require('jasmine-terminal-reporter');
var reporter = new Reporter({isVerbose: true});
var oldSpecDone = reporter.specDone;
reporter.specDone = function(result) {
  oldSpecDone(result);
  for (var i = 0; i < result.failedExpectations.length; i++) {
    console.log('\n'+result.failedExpectations[i].stack
      .split('\n')
      .filter((l) => !l.includes('node_modules'))
      .join('\n'));
  }
}
module.exports.reporter = reporter;





const settings = require('../src/lib/settings.js');

settings.modules.forEach(function(moduleName) {
  gulp.task('test:' + moduleName, function() {
    gulp.src(`spec/${moduleName}Spec.js`).pipe(jasmine());
  });
});
