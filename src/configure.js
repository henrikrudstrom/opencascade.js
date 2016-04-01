const fs = require('fs');
const yargs = require('yargs');
const arrify = require('arrify');
var directives = require('./directives.js');

const settings = require('./settings.js');
const query = require('./query.js');
const paths = settings.paths;


function configure(moduleName, data, moduleConf) {

  data = data || {};
  var conf = {};
  directives
    .filter((dir) => dir.module.configure !== undefined)
    .forEach((dir) => {
      var d = data[dir.name] = [];
      var methods = dir.module.configure;
      if (typeof methods === 'function') {
        methods = {};
        methods[dir.name] = dir.module.configure;
      }

      Object.keys(methods).forEach((m) => {
        conf[m] = function() {
          var res = methods[m].apply(null, arguments);
          ////console.log("res", res, arrify(res));
          // var args = [].slice.call(arguments, 1);
          data[dir.name] = data[dir.name].concat(arrify(res));
        };
      });

    });

  var q = query.loadModule(moduleName, data);
  if (moduleConf) {
    moduleConf(moduleName, conf, q);
    return data;
  }
  //console.log(settings.paths.wrapper, process.cwd())
  var commonConf = require(`${settings.paths.wrapper}/common.js`);
  commonConf(moduleName, conf, q);

  if (fs.existsSync(`${settings.paths.wrapper}/modules/${moduleName}.js`)) {
    moduleConf = require(`./wrapper/modules/${moduleName}.js`);
    moduleConf(moduleName, conf, q);
  }

  if (yargs.argv.debug && fs.existsSync(`${settings.paths.wrapper}/debug.js`)) {
    const debugConf = require(`${settings.paths.wrapper}/debug.js`);
    debugConf(moduleName, conf, q);
  }

  return data;
}

function postConfigure(moduleName) {
  var q = query.loadModule(moduleName);
  var data = q.config;

  directives
    .filter((dir) => dir.module.postConfigure !== undefined)
    .forEach((dir) => {
      var res = dir.module.postConfigure(moduleName, q);
      data[dir.name] = data[dir.name].concat(arrify(res))
    });
  //console.log("=============")
  ////console.log(data)
  //console.log("=============")
  return data;
}

module.exports = configure;
module.exports.post = postConfigure;
