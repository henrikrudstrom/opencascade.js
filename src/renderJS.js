const path = require('path');
const mkdirp = require('mkdirp');
const fs = require('fs');

const query = require('./query.js');
const settings = require('./settings.js');
const paths = settings.paths;
const directives = require('./directives.js');



module.exports = function(moduleName) {
  var q = query.loadModule(moduleName);
  var config = JSON.parse(fs.readFileSync(`${settings.paths.configDest}/${moduleName}.json`));

  function write(name, src) {
    var dest = `${paths.swigDest}/${moduleName}/${name}.i`;
    mkdirp.sync(path.dirname(dest));
    fs.writeFileSync(dest, src);
  }

  function renderSwig(dir) {
    if(dir.module.renderSwig !== undefined)
      return
    var res = dir.module.renderSwig(moduleName, config, q);
    if (typeof res === 'string')
      return write(dir.name, res);
    Object.keys(res).forEach((part) =>
      write(`${dir.name}/${part}`, res[part])
    );
  }
  function renderJS(dir) {
    if(dir.module.renderSwig !== undefined)
      return
    var res = dir.module.renderSwig(moduleName, config, q);
    if (typeof res === 'string')
      return write(dir.name, res);
    Object.keys(res).forEach((part) =>
      write(`${dir.name}/${part}`, res[part])
    );
  }

  directives
    .filter((dir) => )
    .forEach(renderSwig)
    //.forEach(renderJS)
};
