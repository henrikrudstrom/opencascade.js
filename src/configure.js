const fs = require('fs');

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
          // var args = [].slice.call(arguments, 1);
          d.push(methods[m].apply(null, arguments));
        };
      });
    });
  if (!moduleConf && fs.existsSync(`src/config/modules/${moduleName}.js`)) {

    moduleConf = require(`./config/modules/${moduleName}.js`);
  }
  ////console.log(conf)
  var q = query.loadModule(moduleName, data);
  if (moduleConf) moduleConf(moduleName, conf, q);
  return data;
}

module.exports = configure;
