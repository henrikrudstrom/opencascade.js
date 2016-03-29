var camelCase = require('camel-case');
module.exports.configure = function(cls, name, type) {
  return { cls, type, name };
};
module.exports.renderSwig = function(moduleName, config) {
  return config.property.map(function(obj) {
    const newName = camelCase(obj.name);
    const set = `Set${obj.name}`;
    return `%attribute(${obj.cls}, ${obj.type}, ${newName}, ${obj.name}, ${set});`;
  }).join('\n');
};
