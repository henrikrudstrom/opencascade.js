  var common = require('../lib/common.js');
  var ignore = common.select.ignore;

  module.exports.renderSwig = function(moduleName, config, tree) {
    var src = tree.headers.map((header) => `#include<${header}>`).join('\n');
    return `%{\n${src}\n%}`;
  };
