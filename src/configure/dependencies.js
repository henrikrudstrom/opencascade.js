//const settings = require('./settings.js');

function unique(t, index, array) {
  return array.indexOf(t) === index
}

function modName(name) {
  var matchRes = name.match(/(?:Handle_)*(\w+?)_\w+/);
  if (!matchRes) return name;
  return matchRes[1];
}

function isModule(name) {
  //console.log(name)
  name = modName(name) || name;
  return settings.modules.some((mod) => mod === name);
}

function dependencyReader(mods) {
  var visited = {};
  var visitedCls = {};
  // return the type names that class member depends on
  function memberDepends(mem) {
    //console.log(mem.name, mem.cls)
    return [mem.returnType]
      .concat(mem.arguments.map((a) => a.type))
      .filter((t, index, array) => array.indexOf(t) === index)
      //.filter(isModule)
      //.filter((t) => t.match(/(\w+?)_\w+/));
  }

  // return the type names that this class depends on
  function classDepends(cls, recursive, constructorsOnly) {
    if (visitedCls.hasOwnProperty(cls.name)) {
      return visitedCls[cls.name];
    }
    console.log("Class", cls.name)
    
    
    var res = cls.declarations
      .filter((mem) => !constructorsOnly || mem.cls === 'constructor')
      .map(memberDepends)
      .reduce((a, b) => a.concat(b), [])
      .filter(unique);
      
    if(recursive)
      res = res.concat(
        res.map((name) => mods.get(name))
          .filter((cls) => cls === null)
          .map((cls) => classDepends(cls, recursive, constructorsOnly))
          .reduce((a, b) => a.concat(b), [])
        ).filter(unique);
    
    visitedCls[cls.name] = res;
    return res;
  }
  return classDepends;
}
module.exports = dependencyReader;
