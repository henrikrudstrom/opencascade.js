// 'use-strict';
// const fs = require('fs');
// const path = require('path');
// const mkdirp = require('mkdirp');
// const glob = require('glob');
// const execSync = require('child_process').execSync;
//
// const gulp = require('gulp');
// const runSequence = require('run-sequence');
// const run = require('gulp-run');
// const gutil = require('gulp-util');
//
// const render = require('../src/renderSwig.js');
// const configure = require('../src/configure.js');
// const settings = require('../src/settings.js');
// const depend = require('../src/depend.js');
// const common = require('./lib/common.js');
// const paths = settings.paths;
//
// //const swig = 'swig';
// const flags = '-javascript -node -c++ -DSWIG_TYPE_TABLE=occ.js';
// const otherFlags = '-w302,401,314,509,512 -DCSFDB -DHAVE_CONFIG_H -DOCC_CONVERT_SIGNALS'; // TODO:
// const include = ['-I/usr/include/node', `-I${settings.oce_include}`];
//
// // Copy hand written swig .i files from src/swig to build/...
// gulp.task('copy-user-swig', function(done) {
//   // TODO: cmd is completed after task is complete
//   return run(`rm -rf ${paths.userSwigDest}`).exec((error) => {
//     if (error) return done(error);
//     mkdirp.sync(paths.userSwigDest);
//     return run(`cp -r ${paths.userSwigSrc}/* ${paths.userSwigDest}`).exec(done);
//   });
// });
//
//
// // Read dependencies from cached pygccxml output TODO: make it a module task
// gulp.task('parse-wrap-dependencies', function(done) {
//   const depFile = `${settings.paths.build}/config/depends.json`;
//
//   return run(`rm -rf ${depFile}`).exec((error) => {
//     if (error) return done(error);
//     var deps = {};
//     var reader = depend.reader();
//     glob.sync(`src/wrapper/modules/*.js`).forEach((file) => {
//       const mod = path.basename(file).replace('.js', '');
//       deps[mod] = reader.requiredModules(mod, true);
//     });
//     fs.writeFile(depFile, JSON.stringify(deps, null, 2), done);
//   });
// });
//
// gulp.task('swig-include-missing', function(done) {
//   configure.configureMissing();
//   done();
// });
//
// settings.modules.forEach(function(moduleName) {
//   const configPath = `${paths.configDest}/${moduleName}.json`;
//   var depends = settings.depends[moduleName] || [];
//
//
//   function mTask(name, mName) {
//     if (mName === undefined)
//       mName = moduleName;
//     return common.moduleTask(name, mName);
//   }
//
//   gulp.task(mTask('swig-configure'), ['init'], function(done) {
//     execSync(`rm -f ${configPath}`)
//       //run(`rm -f ${configPath}`).exec((error) => {
//       //if (error) return done(error);
//     var data = configure(moduleName);
//     common.writeJSON(configPath, data);
//     return done();
//     //});
//   });
//
//   function renderSwig(done) {
//     run(`rm -rf ${paths.swigDest}/${moduleName}`).exec(function(error) {
//       if (error) return done(error);
//       render(moduleName);
//       return done();
//     });
//   }
//
//   gulp.task(mTask('swig-render'),
//     function(done) {
//       renderSwig(done);
//     });
//
//   const swigDepTasks = [mTask('swig-configure')].concat(mTask('swig-render-deps', depends));
//   gulp.task(mTask('swig-render-deps'), swigDepTasks, function(done) {
//     renderSwig(done);
//   });
//
//
//   gulp.task(mTask('swig-only'), function(done) {
//     const output = path.join(paths.cxxDest, `${moduleName}_wrap.cxx`);
//     const input = path.join(paths.swigDest, `${moduleName}/module.i`);
//     const includes = include.join(' ');
//     mkdirp.sync(path.dirname(output));
//     const cmd = `${settings.swig} ${flags} ${otherFlags} ${includes} -o ${output} ${input}`;
//     return run(cmd).exec(done);
//   });
//
//
//
//
//
//   gulp.task(mTask('swig'), function(done) {
//     var confTasks = mTask('swig-configure', [moduleName].concat(depends));
//     var renderTasks = mTask('swig-render', [moduleName].concat(depends));
//     return runSequence('configure',
//       'swig-include-missing', 'copy-user-swig', renderTasks, mTask('swig-only'), done);
//   });
//   // gulp.task(mTask('swig'), [mTask('swig-render-deps'), mTask('swig-render')], function(done) {
//   //   return runSequence(mTask('swig-only'), done);
//   // });
// });
