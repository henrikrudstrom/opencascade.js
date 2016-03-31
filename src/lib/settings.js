const argv = require('yargs').argv;
const fs = require('fs');

function readConfig(name) {
  return JSON.parse(fs.readFileSync(`config/${name}`));
}

const toolkits = readConfig('toolkits.json');
const cannotParse = readConfig('cannot-parse.json');

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

const modules = flatten([
  toolkits.TKG3d, toolkits.TKernel, toolkits.TKMath, toolkits.TKAdvTools
]).filter((mod) => cannotParse.modules.indexOf(mod) === -1);
const depends = fs.existsSync('config/depends.json') ?
  JSON.parse(fs.readFileSync('config/depends.json')) : {};
var settings = {
  oce_include: '/home/henrik/OCE/include/oce',
  oce_lib: '/home/henrik/OCE/lib',
  force: argv.force,
  modules,
  toolkits,
  depends,

  paths: {
    configDest: 'build/config',
    swigDest: 'build/swig/gen',
    userSwigSrc: 'src/swig',
    userSwigDest: 'build/swig/user',
    cxxDest: 'build/src',
    headerCacheDest: 'cache/tree',
    gyp: 'build/gyp',
    dist: 'dist'
  }
};

process.env['LD_LIBRARY_PATH'] = settings.oce_lib;

module.exports = settings;