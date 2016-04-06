
const conf = require('../conf.js');
const camelCase = require('camel-case');
function rename(expr, name) {
  var nameFunc = name;
  if (typeof nameFunc !== 'function')
    nameFunc = () => name;
  return this.transform(expr, (obj) => {
    if(obj.cls === 'constructor') return;
    obj.rename = true;
    obj.name = nameFunc(obj.name, obj);
    
    //rename parent property of child declarations
    if(!obj.declarations) return;
    obj.declarations.forEach((decl) => {
      decl.parent = obj.name;
      if(decl.cls === 'constructor')
        decl.name = obj.name;
    });
    
  });
};

conf.Conf.prototype.rename = rename;

function renameCamelCase(expr){
  return this.rename(expr, camelCase);
}

conf.Conf.prototype.camelCase = renameCamelCase;

function removePrefix(expr){
  return this.rename(expr, (name) => {
    var match = name.match(/^((?:Handle_)*)([a-z|A-Z|0-9]+_?)(\w+)$/);
    if(!match) return name;
    return match[1] + match[3];
  });
}
conf.Conf.prototype.removePrefix = removePrefix;

//TODO implement as function called inside configuration
module.exports.renderSwig = function(moduleName, config, q) {
  var prefix = `${moduleName}_`;
  return q.classes
    .filter((cls) => cls.name.startsWith(prefix))
    .filter(q.include)
    .map((cls) => `%rename("${cls.name.replace(prefix, '')}") ${cls.name};`)
    .join('\n');
};

module.exports.render = function(mod) {
  return {
    part: 'rename',
    src: mod.declarations
      .filter((decl) => decl.rename)
      .map((decl) => `%rename("${decl.name}") ${decl.key};`)
      .join('\n')
  };
};
