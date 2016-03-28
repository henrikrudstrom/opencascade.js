
function match(exp, name) {
  exp = new RegExp('^' + exp.replace('*', '.*') + '$');
  return exp.test(name);
};
module.exports.match = match;

function ignore(config, cls, member) {
  //console.log(config)
  return config.ignore.some(function(obj) {
    if (member) {
      if (obj.parent && cls !== obj.parent) return false;
      return match(obj.name, member); // === ign.name;
    }
    return match(obj.name, cls);
  });
}
module.exports.ignore = ignore;

module.exports.select = {
  ignore(config, cls) {
    return function(obj) {
      if (cls !== undefined)
        return !ignore(config, cls.name, obj.name);
      return !ignore(config, obj.name);
    };
  }
};
