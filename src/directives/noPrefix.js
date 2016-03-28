var common = require('../lib/common.js');
var ignore = common.select.ignore;

module.exports.renderSwig = function(moduleName, config, tree) {
  var prefix = `${moduleName}_`;
  return tree.classes
    .filter((cls) => cls.name.startsWith(prefix))
    .filter(ignore(config))
    .map((cls) => `%rename("${cls.name.replace(prefix, '')}") ${cls.name};`)
    .join('\n');
};
