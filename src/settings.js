const argv = require('yargs').argv;
const fs = require('fs');
const path = require('path');
const extend = require('extend');



function readConfig(name) {
  return JSON.parse(fs.readFileSync(`config/${name}`));
}
const toolkits = readConfig('toolkits.json');
const cannotParse = readConfig('cannot-parse.json');
var depends = readConfig('depends.json');
// var dep = depends['Adaptor3d']
// dep.constructor.name;
// console.log(dep, dep.constructor.name)
// Array.prototype.filter.apply(dep, cannotParse.some)
// for(var i in depends){
//   console.log(i, depends[i].constructor.name, Array.filter)
//   var deps = depends[i];
//   console.log(deps.filter(cannotParse.some));
// }

// Object.keys(depends).forEach(function(d) {
//   console.log(depends[d])
//   var deps = depends[d];
//   console.log("dep", deps, typeof deps)
//   depends[d] = deps.filter(cannotParse.some);
///});

// function flatten(obj) {
//   function toArray(o) {
//     if (typeof o === 'string')
//       return [o];
//     if (!Array.isArray(o)) {
//       var a = [];
//       for (var i in o)
//         if (Array.isArray(o[i]))
//           a.push(o[i]);
//       return a;
//     }
//     return o;
//   }
//   return obj.reduce((a, b) =>
//     toArray(a).concat(toArray(b)), []
//   );
// }

var defaultSettings = {

  force: argv.force,
  toolkits: ['TKG3d', 'TKernel', 'TKMath', 'TKAdvTools',
    'TKGeomBase', 'TKBRep', 'TKGeomAlgo', 'TKTopAlgo'
  ],
  depends,
  buildPath: 'build',
  distPath: 'dist',
  wrapperPath: 'src/wrapper',
  swig: 'swig'
};

function prefixPath(prefix) {
  return function(p) {
    return path.join(prefix, p);
  }
}
// initialize paths and modules
function init(file, options) {
  //console.log(file)
  file = file || 'settings.json';
  options = options || {};
  var settings = {};
  extend(settings, defaultSettings);
  if (fs.existsSync(file))
    extend(settings, JSON.parse(fs.readFileSync(file)));
  extend(settings, options);
  settings.modules = settings.toolkits
    .map((tkName) => toolkits.find((tk) => tk.name === tkName).modules)

  .reduce((a, b) => a.concat(b))
    .filter((mod) => cannotParse.modules.indexOf(mod) === -1);
  console.log(settings.modules)
    //settings.modules = flatten(settings.toolkits)
    //  .filter((mod) => cannotParse.modules.indexOf(mod) === -1);
  console.log(settings.modules)
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
