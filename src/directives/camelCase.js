
var camelCase = require('camel-case');
var common = require('../lib/common.js');
var ignore = common.select.ignore;

module.exports.renderSwig = function(moduleName, config, tree) {
  return tree.classes
    .filter(ignore(config))
    .map((cls) => cls.members.filter(ignore(config, cls)))
    .reduce((a, b) => a.concat(b))
    .map((mem) => mem.name)
    .filter((mem, index, array) => array.indexOf(mem) === index)
    .map((name) => `%rename("${camelCase(name)}") ${name};`)
    .join('\n');
};
