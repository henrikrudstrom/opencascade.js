// const glob = require('glob');
// const path = require('path');
// const loadConfig = require('../tasks/lib/config.js');
// const loadTree = require('../tasks/lib/tree.js');
// const settings = require('../tasks/lib/settings.js');
// const paths = settings.paths;
//
// const directives = glob.sync(`${__dirname}/directives/*.js`)
//   .map((dirPath) => {
//     return {
//       module: require(dirPath.replace(__dirname, '.')),
//       name: path.basename(dirPath).replace('.js', '')
//     };
//   });
// console.log("Directives", directives.count)
//
// module.exports = function(moduleName) {
//   var tree = loadTree(`${paths.headerCacheDest}/${moduleName}.json`);
//   var config = loadConfig(`build/config/${moduleName}.json`);
//
//   this.configure = function configure() {
//     var data = {};
//     var conf = {};
//     directives.filter((dir) => dir.module.configure !== undefined)
//       .forEach((dir) => {
//         var d = data[dir.name] = [];
//         conf[dir.name] = function() {
//           var args = [].slice.call(arguments, 1);
//           d.push(dir.module.configure.apply(null, arguments));
//         };
//       });
//
//     var directive = require(`./config/modules/${moduleName}.js`);
//     directive(conf, tree);
//     return data;
//   };
//
//   this.renderSwig = function(name) {
//     console.log("Directives", directives)
//     var dir = directives.find((d) => d.name === name);
//     //console.log(config)
//     return dir.module.renderSwig(moduleName, config.data, tree)
//       // directives.filter((dir) => dir.renderSwig !== undefined)
//       //   .forEach((dir) => {
//       //     dir.renderSwig(moduleName, config, tree);
//       //   });
//
//   };
//
//   this.renderJS = function() {
//     directives.filter((dir) => dir.renderJS !== undefined)
//       .forEach((dir) => {
//         dir.renderSwig(moduleName, config, tree);
//       });
//   };
// };
