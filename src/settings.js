const argv = require('yargs').argv;
const fs = require('fs');
const path = require('path');
const extend = require('extend');



function readConfig(name) {
  return JSON.parse(fs.readFileSync(`config/${name}`));
}
const toolkits = readConfig('toolkits.json');
const cannotParse = readConfig('cannot-parse.json');
const depends = readConfig('depends.json');

function flatten(obj) {
  function toArray(o) {
    if (typeof o === 'string')
      return [o];
    if (!Array.isArray(o)) {
      var a = [];
      for (var i in o)
        if (Array.isArray(o[i]))
          a.push(o[i]);
      return a;
    }
    return o;
  }
  return obj.reduce((a, b) =>
    toArray(a).concat(toArray(b)), []
  );
}

var defaultSettings = {
  oce_include: '/home/henrik/OCE/include/oce',
  oce_lib: '/home/henrik/OCE/lib',
  force: argv.force,
  toolkits: [toolkits.TKG3d, toolkits.TKernel, toolkits.TKMath, toolkits.TKAdvTools],
  depends,
  buildPath: 'build',
  distPath: 'dist',
  wrapperPath: 'src/wrapper'
};
function prefixPath(prefix){
  return function(p){
    return path.join(prefix, p);
  }
}
// initialize paths and modules
function init(file, options) {
  file = file || "config.json";
  options = options || {};
  var settings = {};
  extend(settings, defaultSettings);
  if (fs.existsSync(file))
    extend(settings, JSON.parse(fs.readFileSync(file)));
  extend(settings, options);

  settings.modules = flatten(settings.toolkits)
    .filter((mod) => cannotParse.modules.indexOf(mod) === -1);
  // settings.data.depends = fs.existsSync('config/depends.json') ?
  //   JSON.parse(fs.readFileSync('config/depends.json')) : {};
  const buildPath = settings.buildPath;
  var prefix = prefixPath(process.cwd());
  settings.paths = {
    build: prefix(settings.buildPath),
    wrapper: prefix(settings.wrapperPath),
    configDest: prefix(buildPath + '/config'),
    swigDest: prefix(buildPath + '/swig/gen'),
    userSwigSrc: prefix('src/wrapper/swig'),
    userSwigDest: prefix(buildPath + '/swig/user'),
    cxxDest: prefix(buildPath + '/src'),
    headerCacheDest: prefix('cache/tree'),
    gyp: prefix(buildPath + '/gyp'),
    dist: prefix(settings.distPath)
  };

  return settings;
}

module.exports = init()
module.exports.init = init


// process.env['LD_LIBRARY_PATH'] = settings.oce_lib;
//
// module.exports = settings;
