const conf = require('../conf.js');
const camelCase = require('camel-case');
function rename(expr, name) {
  var nameFunc = name;
  if (typeof nameFunc !== 'function')
    nameFunc = () => name;
  return this.transform(expr, (obj) => {
    obj.rename = true;
    obj.name = nameFunc(obj.name, obj);
  });
};
conf.Module.prototype.rename = rename;
conf.Class.prototype.rename = rename;

function renameCamelCase(expr){
  return this.rename(expr, camelCase);
}
conf.Class.prototype.camelCase = renameCamelCase;


module.exports.render = function(mod) {

  return {
    part: 'rename',
    src: mod.declarations
      .filter((decl) => decl.rename)
      .map((decl) => `%rename("${decl.name}") ${decl.key};`)
      .join('\n')
  };
};
