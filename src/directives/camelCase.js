var camelCase = require('camel-case');
module.exports.renderSwig = function(moduleName, config, q) {
  return q.classes
    .filter(q.include)
    .map((cls) => cls.members.filter(cls.include))
    .reduce((a, b) => a.concat(b))
    .map((mem) => mem.name)
    .filter((mem, index, array) => array.indexOf(mem) === index)
    .map((name) => `%rename("${camelCase(name)}") ${name};`)
    .join('\n');
};
