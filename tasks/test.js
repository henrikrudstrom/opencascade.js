const gulp = require('gulp');
const jasmine = require('gulp-jasmine');

const settings = require('../src/lib/settings.js');

settings.modules.forEach(function(moduleName) {
  gulp.task('test:' + moduleName, function() {
    gulp.src(`spec/${moduleName}Spec.js`).pipe(jasmine());
  });
});
