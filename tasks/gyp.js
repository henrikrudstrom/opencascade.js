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
const common = require('./lib/common.js');

function getToolkit(moduleName) {
  return Object.keys(settings.toolkits).filter((tk) =>
    settings.toolkits[tk].indexOf(moduleName) >= 0
  )[0];
}

function toolkitDeps(moduleName) {
  var modules = settings.depends[moduleName].concat([moduleName]);
  var toolkits = modules.map(getToolkit);
  return toolkits
    .filter((m, index) => toolkits.indexOf(m) === index)
    .map((s) => `      "-l${s}"`).join(',\n');
}

function writeConfig(moduleName, buildPath) {
  var src = `{
  "targets": [{
    "target_name":"${moduleName}",
    "sources": ["../../src/${moduleName}_wrap.cxx"],
    "include_dirs": ["${settings.oce_include}"],
    "libraries": [
      "-L${settings.oce_lib}",
${toolkitDeps(moduleName)}
    ],
    "cflags": [
      "-DCSFDB", "-DHAVE_CONFIG_H", "-DOCC_CONVERT_SIGNALS",
      "-D_OCC64", "-Dgp_EXPORTS", "-Os", "-DNDEBUG", "-fPIC",
      "-fpermissive",
      "-DSWIG_TYPE_TABLE=occ.js"
    ],
    "cflags!": ["-fno-exceptions"],
    "cflags_cc!": ["-fno-exceptions"]
  }]
}`
  mkdirp.sync(buildPath);
  const file = `${buildPath}/binding.gyp`
  fs.writeFileSync(`${buildPath}/binding.gyp`, src);
}

settings.modules.forEach(function(moduleName) {
  const buildPath = `${paths.gyp}/${moduleName}`;

  function mTask(name, mName) {
    if (mName === undefined)
      mName = moduleName;
    return common.moduleTask(name, mName);
  }


  gulp.task(mTask('gyp-clean'), function(done) {
    if (!fs.existsSync(buildPath)) return done();
    else run(`rm -rf ${buildPath}`).exec(done);
    console.log("CLEAN!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  });

  gulp.task(mTask('gyp-configure'), function(done) {
    writeConfig(moduleName, buildPath);
    run('node-gyp configure', {
      cwd: buildPath,
      verbosity: 2
    }).exec(done);
  });

  gulp.task(mTask('gyp-build'), [mTask('gyp-configure')], function(done) {
    run('node-gyp build', {
      cwd: buildPath,
      verbosity: 2
    }).exec(done);
  });

  gulp.task(mTask('gyp-dist'), function(done) {
    mkdirp.sync(`${paths.dist}/lib/`);
    var cmd = `cp ${buildPath}/build/Release/${moduleName}.node ${paths.dist}/lib/`;
    run(cmd).exec(done);
  });

  gulp.task(mTask('gyp'), function(done) {
    runSequence(mTask('gyp-build'), mTask('gyp-dist'), done);
  });
});
