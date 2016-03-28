const glob = require('glob');
const path = require('path');
const mkdirp = require('mkdirp');
const fs = require('fs');
const loadConfig = require('../tasks/lib/config.js');
const loadTree = require('../tasks/lib/tree.js');
const settings = require('../tasks/lib/settings.js');
const paths = settings.paths;

const directives = require('./directives.js')

module.exports = function(moduleName) {
  var tree = loadTree(`${paths.headerCacheDest}/${moduleName}.json`);
  var config = JSON.parse(fs.readFileSync(`build/config/${moduleName}.json`));

  function write(name, src) {

    var dest = `${paths.swigDest}/${moduleName}/${name}.i`;
    mkdirp.sync(path.dirname(dest));
    console.log("write", dest)
    fs.writeFileSync(dest, src);
  }


  directives
    .filter((dir) => dir.module.renderSwig !== undefined)
    .forEach((dir) => {
      var res = dir.module.renderSwig(moduleName, config, tree);
      console.log(res)
      if (typeof res === 'string')
        return write(dir.name, res);
      Object.keys(res).forEach((part) =>
        write(`${dir.name}/${part}`, res[part])
      );
    });
};
