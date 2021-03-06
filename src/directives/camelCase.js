var camelCase = require('camel-case');
module.exports.renderSwig = function(moduleName, config, q) {
  return q.classes
    .filter(q.include)
    .map((cls) => cls.members.filter(cls.include))
    .reduce((a, b) => a.concat(b), [])
    .map((mem) => mem.name)
    .filter((mem, index, array) => array.indexOf(mem) === index)
    .map((name) => `%rename("${camelCase(name)}") ${name};`)
    .join('\n');
};


module.exports.process = function(obj) {
  if (obj.cls !== 'member') return obj;
  obj.oldName = obj.name;
  obj.name = camelCase(name);
  return name;
};

module.exports.dictionary = function(config, obj) {
  if (obj.cls !== 'member') return null;
  return camelCase(obj.name);
};
