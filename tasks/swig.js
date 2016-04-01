'use-strict';
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const glob = require('glob');

const gulp = require('gulp');
const runSequence = require('run-sequence');
const run = require('gulp-run');
const gutil = require('gulp-util');

const render = require('../src/renderSwig.js');
const configure = require('../src/configure.js');
const settings = require('../src/settings.js');
const common = require('./lib/common.js');
const paths = settings.paths;

//const swig = 'swig';
const flags = '-javascript -node -c++ -DSWIG_TYPE_TABLE=occ.js';
const otherFlags = '-w302,401,314,509,512 -DCSFDB -DHAVE_CONFIG_H -DOCC_CONVERT_SIGNALS'; // TODO:
const include = ['-I/usr/include/node', `-I${settings.oce_include}`];

// Copy hand written swig .i files from src/swig to build/...
gulp.task('copy-user-swig', function(done) {
  // TODO: cmd is completed after task is complete
  return run(`rm -rf ${paths.userSwigDest}`).exec((error) => {
    if (error) return done(error);
    mkdirp.sync(paths.userSwigDest);
    return run(`cp -r ${paths.userSwigSrc}/* ${paths.userSwigDest}`).exec(done);
  });
});

settings.modules.forEach(function(moduleName) {
  const configPath = `${paths.configDest}/${moduleName}.json`;
  var depends = settings.depends[moduleName] || [];


  function mTask(name, mName) {
    if (mName === undefined)
      mName = moduleName;
    return common.moduleTask(name, mName);
  }

  gulp.task(mTask('swig-configure'), [mTask('parse')], function(done) {
    run(`rm -f ${configPath}`).exec((error) => {
      if (error) return done(error);
      var data = configure(moduleName);
      common.writeJSON(configPath, data);
      return done();
    });
  });

  gulp.task(mTask('swig-post-configure'), mTask('swig-render-deps', depends), function(done) {
    var data = configure.post(moduleName);
    common.writeJSON(configPath, data);
    return done()
  });

  function renderSwig(done) {
    run(`rm -rf ${paths.swigDest}/${moduleName}`).exec(function(error) {
      if (error) return done(error);
      render(moduleName);
      return done();
    });
  }

  gulp.task(mTask('swig-render'), [mTask('swig-post-configure'), 'copy-user-swig'],
    function(done) {
      renderSwig(done);
    });

  const swigDepTasks = [mTask('swig-configure')].concat(mTask('swig-render-deps', depends));
  gulp.task(mTask('swig-render-deps'), swigDepTasks, function(done) {
    renderSwig(done);
  });


  gulp.task(mTask('swig-only'), function(done) {
    const output = path.join(paths.cxxDest, `${moduleName}_wrap.cxx`);
    const input = path.join(paths.swigDest, `${moduleName}/module.i`);
    const includes = include.join(' ');
    mkdirp.sync(path.dirname(output));
    const cmd = `${settings.swig} ${flags} ${otherFlags} ${includes} -o ${output} ${input}`;
    return run(cmd).exec(done);
  });


  gulp.task(mTask('swig'), [mTask('swig-render-deps'), mTask('swig-render')], function(done) {
    return runSequence(mTask('swig-only'), done);
  });
});
