'use-strict';
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const glob = require('glob');

const gulp = require('gulp');
const runSequence = require('run-sequence');
const run = require('gulp-run');
const gutil = require('gulp-util');

const settings = require('./lib/settings.js');
const paths = settings.paths;
const jasmine = require('gulp-jasmine');

settings.modules.forEach(function(moduleName) {
  const buildPath = `${paths.gyp}/${moduleName}`;

  gulp.task('test:' + moduleName, function() {
    gulp.src(`spec/${moduleName}Spec.js`).pipe(jasmine())
  });

});
