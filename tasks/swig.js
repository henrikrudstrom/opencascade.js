'use-strict';
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const glob = require('glob');

const gulp = require('gulp');
const runSequence = require('run-sequence');
const run = require('gulp-run');
const gutil = require('gulp-util');
const lock = require('gulp-lock');

const loadConfig = require('./lib/config.js');
const configure = require('./lib/configure.js');
const loadTree = require('./lib/tree.js');
const Renderer = require('./lib/render.js');
const settings = require('./lib/settings.js');
const common = require('./lib/common.js');
const paths = settings.paths;

const swig = 'swig';
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

// Read dependencies from cached pygccxml output
gulp.task('parse-dependencies', function(done) {
  const depFile = 'config/depends.json';

  return run(`rm -rf ${depFile}`).exec((error) => {
    if (error) return done(error);
    var deps = {};
    glob.sync(`${paths.headerCacheDest}/*.json`).forEach((file) => {
      const tree = loadTree(file);
      const mod = path.basename(file).replace('.json', '');
      deps[mod] = tree.readDependencies(mod);
    });
    fs.writeFile(depFile, JSON.stringify(deps, null, 2), done);
  });
});

gulp.task('parse-all-headers', function(done) {
  common.limitExecution('parse-headers', settings.modules, done);
});


settings.modules.forEach(function(moduleName) {
  const treePath = `${paths.headerCacheDest}/${moduleName}.json`;
  const configPath = `${paths.configDest}/${moduleName}.json`;
  var depends = settings.depends[moduleName];


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
    return run(`python tasks/python/parse_headers.py ${moduleName} ${treePath}`).exec(done);
  });

  gulp.task(mTask('parse'), function(done) {
    return runSequence(mTask('parse-headers'), /*mTask('parse-depends'),*/ done);
  });

  gulp.task(mTask('swig-configure'), [mTask('parse')], function(done) {
    run(`rm -f ${configPath}`).exec(function(error) {
      if (error) return done(error);
      const moduleConfPath = `src/wrap/modules/${moduleName}.js`;
      if (!fs.existsSync(moduleConfPath)) {
        return done();
      }
      // const config = loadConfig(configPath);
      // const tree = loadTree(treePath);



      var data = configure(moduleConfPath, treePath);

      mkdirp.sync('build/config/');
      const src = JSON.stringify(data, null, 2);
      return fs.writeFile(configPath, src, done);
    });
  });


  function renderSwig(done) {

    run(`rm -rf ${paths.swigDest}/${moduleName}`).exec(function(error) {
      if (error) return done(error);
      var r = new Renderer(moduleName, paths.swigDest);
      r.renderClasses();
      r.renderRenames();
      r.renderHeaders();
      r.renderModule();
      r.renderDefaultRenames();
      done();
    });
  }

  gulp.task(mTask('swig-render'), [mTask('swig-configure'), 'copy-user-swig'],
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
    const cmd = `${swig} ${flags} ${otherFlags} ${includes} -o ${output} ${input}`;
    return run(cmd).exec(done);
  });


  gulp.task(mTask('swig'), [mTask('swig-render-deps'), mTask('swig-render')], function(done) {
    return runSequence(mTask('swig-only'), done);
  });
});
