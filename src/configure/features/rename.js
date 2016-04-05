const conf = require('../conf.js');

conf.Module.prototype.rename = function rename(expr, name) {

  var nameFunc = name;
  if (typeof nameFunc !== 'function')
    nameFunc = () => name;
  return this.transform(expr, (obj) => {
    obj.rename = true;
    obj.name = nameFunc(obj.name, obj);
  });
};

// conf.Module.prototype.includeAs = function includeAs(expr, name) {
//   this.include(expr);
//   this.rename(name);
// }
module.exports.render = function(mod) {

  return {
    part: 'rename',
    src: mod.declarations
      .filter((decl) => decl.rename)
      .map((decl) => `%rename("${decl.name}") ${decl.key};`)
      .join('\n')
  };
};
