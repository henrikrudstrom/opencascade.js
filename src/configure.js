const fs = require('fs');
const yargs = require('yargs');
const arrify = require('arrify');
var directives = require('./directives.js');
const loadTree = require('./lib/tree.js');
const settings = require('./lib/settings.js');
const query = require('./lib/query.js');
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
          console.log("res", res, arrify(res));
          // var args = [].slice.call(arguments, 1);
          data[dir.name] = data[dir.name].concat(arrify(res));
        };
      });

    });

  var q = query.loadModule(moduleName, data);
  if (!moduleConf) {
    var commonConf = require(`./config/common.js`);
    commonConf(moduleName, conf, q);
    if (fs.existsSync(`src/config/modules/${moduleName}.js`))
      moduleConf = require(`./config/modules/${moduleName}.js`);
  }
  console.log("data", data);
  //////console.log(conf)

  if (moduleConf) moduleConf(moduleName, conf, q);

  if (yargs.argv.debug) {
    if (fs.existsSync('src/config/debug.js'))
      moduleConf = require(`./config/debug.js`);
  }

  return data;
}

module.exports = configure;
