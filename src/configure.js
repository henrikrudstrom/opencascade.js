const fs = require('fs');
const directives = require('./directives.js');
const loadTree = require('../tasks/lib/tree.js');
const settings = require('../tasks/lib/settings.js');
const paths = settings.paths;
module.exports = function configure(moduleName) {
  var tree = loadTree(`${paths.headerCacheDest}/${moduleName}.json`);
  var data = {};
  var conf = {};
  directives.filter((dir) => dir.module.configure !== undefined)
    .forEach((dir) => {
      var d = data[dir.name] = [];
      conf[dir.name] = function() {
        // var args = [].slice.call(arguments, 1);
        d.push(dir.module.configure.apply(null, arguments));
      };
    });
  if (fs.existsSync(`src/config/modules/${moduleName}.js`)) {
    var moduleConf = require(`./config/modules/${moduleName}.js`);
    moduleConf(conf, tree);
  }

  return data;
};
