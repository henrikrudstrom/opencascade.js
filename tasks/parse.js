'use-strict';
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const glob = require('glob');

const gulp = require('gulp');
const runSequence = require('run-sequence');
const run = require('gulp-run');
const gutil = require('gulp-util');

const depend = require('../src/depend.js');
const settings = require('../src/settings.js');
const common = require('./lib/common.js');
const paths = settings.paths;





// Copy hand written swig .i files from src/swig to build/...
gulp.task('copy-user-swig', function(done) {
  // TODO: cmd is completed after task is complete
  return run(`rm -rf ${paths.userSwigDest}`).exec((error) => {
    if (error) return done(error);
    mkdirp.sync(paths.userSwigDest);
    return run(`cp -r ${paths.userSwigSrc}/* ${paths.userSwigDest}`).exec(done);
  });
});


// Read dependencies from cached pygccxml output TODO: make it a module task
gulp.task('parse-dep-types', function(done) {
  var res = {}
  depend.findDependentTypes(['BRepBuilderAPI_MakeFace'], res)
  console.log("=======================================")
  console.log(Object.keys(res));
});


// Read dependencies from cached pygccxml output TODO: make it a module task
gulp.task('parse-dependencies', function(done) {
  const depFile = 'config/depends.json';

  return run(`rm -rf ${depFile}`).exec((error) => {
    if (error) return done(error);
    var deps = {};
    var reader = depend.reader();
    glob.sync(`${paths.headerCacheDest}/*.json`).forEach((file) => {
      const mod = path.basename(file).replace('.json', '');
      deps[mod] = reader.requiredModules(mod, false);
    });
    fs.writeFile(depFile, JSON.stringify(deps, null, 2), done);
  });
});

gulp.task('parse-all-headers', function(done) {
  common.limitExecution('parse-headers', settings.modules, done);
});
gulp.task('parse', function(done) {
  runSequence('parse-all-headers', 'parse-dependencies', done)
});


settings.modules.forEach(function(moduleName) {
  const treePath = `${paths.headerCacheDest}/${moduleName}.json`;

  function mTask(name, mName) {
    if (mName === undefined)
      mName = moduleName;
    return common.moduleTask(name, mName);
  }

  gulp.task(mTask('parse-headers'), function(done) {
    if (fs.existsSync(treePath) && !settings.force) {
      gutil.log('Skipping, headers already parsed', gutil.colors.magenta(treePath));
      return done();
    }
    mkdirp.sync(paths.headerCacheDest);
    return run(`python tasks/python/parse_headers.py ${moduleName} ${settings.oce_include} ${treePath}`).exec(done);
  });

  gulp.task(mTask('parse'), function(done) {
    return runSequence(mTask('parse-headers'), done);
  });
});
