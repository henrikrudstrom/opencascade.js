'use-strict';
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const glob = require('glob');

const gulp = require('gulp');
const runSequence = require('run-sequence');
const run = require('gulp-run');
const gutil = require('gulp-util');

const loadConfig = require('./lib/config.js');
const loadTree = require('./lib/tree.js');
const Renderer = require('./lib/render.js');
const common = require('./lib/common.js');

const swig = 'swig';
const flags = '-javascript -node -c++ -DSWIG_TYPE_TABLE=occ.js';
const otherFlags = '-w302,401,314,509,512 -DCSFDB -DHAVE_CONFIG_H -DOCC_CONVERT_SIGNALS'; // TODO:
const include = ['-I/usr/include/node', `-I${SETTINGS.oce_include}`];

function moduleTask(name, mName) {

  if (Array.isArray(mName)) {
    return mName.map((m) => moduleTask(name, m));
  }
  if (Array.isArray(name)) {
    return name.map((n) => moduleTask(n, mName));
  }
  return name + ':' + mName;
}


gulp.task('copy-user-swig', function(done) {
  // TODO: cmd is completed after task is complete
  return run('rm -rf build/swig/user').exec((error) => {
    if (error) return done(error);
    mkdirp.sync('build/swig/user');
    return run('cp -r src/swig/* build/swig/user').exec(done);
  });
});

gulp.task('parse-dependencies', function(done) {
  const depFile = 'config/depends.json';

  return run(`rm -rf ${depFile}`).exec((error) => {
    var deps = {};
    glob.sync("cache/tree/*.json").forEach((file) => {
      const tree = loadTree(file);
      const mod = path.basename(file).replace(".json", "");
      deps[mod] = tree.readDependencies(mod);
    });
    fs.writeFileSync(depFile, JSON.stringify(deps, null, 2));
  });
});

gulp.task('parse-all-headers', moduleTask('parse-headers', SETTINGS.modules), function() {

});




SETTINGS.modules.forEach(function(moduleName) {
  const treePath = `cache/tree/${moduleName}.json`;
  const configPath = `./build/config/${moduleName}.json`;
  var depends = SETTINGS.depends[moduleName];


  function mTask(name, mName) {
    if (mName === undefined)
      mName = moduleName;
    return moduleTask(name, mName);
  }


  gulp.task(mTask('parse-headers'), function(done) {
    if (fs.existsSync(treePath)) {
      gutil.log('Skipping, headers already parsed', gutil.colors.magenta(treePath));
      return done();
    }
    mkdirp.sync('cache/tree/');
    return run(`python scripts/write_headers.py ${moduleName} ${treePath}`).exec(done);
  });

  gulp.task(mTask('parse'), function(done) {
    return runSequence(mTask('parse-headers'), /*mTask('parse-depends'),*/ done);
  });

  gulp.task(mTask('configure-wrapper'), [mTask('parse')], function(done) {
    run(`rm -f ${configPath}`).exec(function(error) {
      if (error) return done(error);
      const config = loadConfig(configPath);
      const tree = loadTree(treePath);
      const moduleConfPath = `src/wrap/modules/${moduleName}.js`;

      if (fs.existsSync(moduleConfPath)) {
        config.configure(require(`../${moduleConfPath}`), tree);
      }

      mkdirp.sync('build/config/');
      const src = JSON.stringify(config.data, null, 2);
      return fs.writeFile(configPath, src, done);
    });
  });


  function renderSwig(done) {
    var r = new Renderer(moduleName, 'build/swig/gen');
    r.renderClasses();
    r.renderRenames();
    r.renderHeaders();
    r.renderModule();
    done();
  }

  gulp.task(mTask('render-swig'), [mTask('configure-wrapper'), 'copy-user-swig'],
    function(done) {
      renderSwig(done);
    });
  // console.log("DEPS")
  // console.log(depends)
  // console.log(mTask('render-swig-deps', depends));
  //
  // const renderTasks = [mTask('render-swig')].concat(mTask('render-swig-deps', depends));
  // console.log("DEPS")
  // console.log(renderTasks);
  const swigDepTasks = [mTask('configure-wrapper')].concat(mTask('render-swig-deps', depends));
  gulp.task(mTask('render-swig-deps'), swigDepTasks, function(done) {
    renderSwig(done);
  });


  gulp.task(mTask('swig-only'), function(done) {
    const output = path.join(`build/cxx/${moduleName}.cxx`);
    const input = path.join(`build/swig/gen/${moduleName}/module.i`);
    const includes = include.join(' ');
    mkdirp.sync(path.dirname(output));
    const cmd = `${swig} ${flags} ${otherFlags} ${includes} -o ${output} ${input}`;
    return run(cmd).exec(done);
  });


  gulp.task(mTask('swig'), [mTask('render-swig-deps'), mTask('render-swig')], function(done) {
    return runSequence(mTask('swig-only'), done);
  });
});
