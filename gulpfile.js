const gulp = require('gulp');
const requireDir = require('require-dir');
const jasmine = require('gulp-jasmine');
const runSequence = require('run-sequence');
const yargs = require('yargs');


const settings = require('./src/settings.js');
const test = require('./tasks/test.js');

requireDir('./tasks');

// initialize project (parse headers/dependencies etc) run once
gulp.task('init', function(done) {
  runSequence('parse-headers', 'init-dependencies', done);
});
