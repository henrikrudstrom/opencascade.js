//const settings = require('./settings.js');

function unique(t, index, array) {
  return array.indexOf(t) === index
}


function modName(name) {
  var matchRes = name.match(/(?:Handle_)*(\w+?)_\w+/);
  if (!matchRes) return name;
  return matchRes[1];
}

function dependencyReader(mods) {
  var visited = {};
  var visitedCls = {};
  // return the type names that class member depends on
  function memberDepends(mem) {
    return [mem.returnType]
      .concat(mem.arguments.map((a) => a.type))
      .filter((t, index, array) => array.indexOf(t) === index);
  }

  // return the type names that this class depends on
  function classDepends(cls, recursive, constructorsOnly) {
    if (visitedCls.hasOwnProperty(cls.name)) {
      return visitedCls[cls.name];
    }
    var res = cls.declarations
      .filter((mem) => !constructorsOnly || mem.cls === 'constructor')
      .map(memberDepends)
      .reduce((a, b) => a.concat(b), [])
      .filter(unique)
      .filter((name) => name);

    if (recursive)
      res = res.concat(
        res.map((name) => mods.get(name))
        .filter((c) => c === null)
        .map((c) => classDepends(c, recursive, constructorsOnly))
        .reduce((a, b) => a.concat(b), [])
      ).filter(unique);

    visitedCls[cls.name] = res;
    return res;
  }
  return classDepends;
}
module.exports = dependencyReader;
