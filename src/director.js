const glob = require('glob');
const path = require('path');
const loadConfig = require('./config.js');
const loadTree = require('./tree.js');
const settings = require('../tasks/lib/setings.js');
const paths = settings.paths;

const directives = glob(`${__dirname}/directives/*.js`)
  .map((path) => {
    module: require(path.replace(__dirname, '.')),
    name: path.basename(path).replace(".js", "")
  });











module.exports = function(moduleName) {
  var tree = loadTree(`${paths.headerCacheDest}/${moduleName}.json`);
  var config = loadConfig(`build/config/${moduleName}.json`);

  this.configure = function() {
    directives.filter((dir) => dir.configure !== undefined)
      .forEach((dir) => {
        dir.configure(moduleName, config, tree);
      });
  };




  const loadTree = require('./tree.js');
  this.configure = function configure(file, treePath) {
    global.$$.data = {
      ignore: [],
      rename: []
    };
    directives.filter((dir) => dir.configure !== undefined)
      .forEach((dir) => {
        dir.configure(moduleName, config, tree);
      });


    global.$$.tree = loadTree(treePath);
    require(`../../${file}`);
    var data = global.$$.data;
    delete global.$$.data;
    delete global.$$.tree;
    return data;
  };







  this.renderSwig = function() {
    directives.filter((dir) => dir.renderSwig !== undefined)
      .forEach((dir) => {
        dir.renderSwig(moduleName, config, tree);
      });
    return undefined;
  };

  this.renderJS = function() {
    directives.filter((dir) => dir.renderJS !== undefined)
      .forEach((dir) => {
        dir.renderSwig(moduleName, config, tree);
      });
  };
};
