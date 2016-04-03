const query = require('./query.js');
const settings = require('./settings.js');

function filterTypeName(ret) {
  ret = ret.replace(/&|\*/, '');
  ret = ret.replace('const', '');
  ret = ret.trim();
  return ret;
}

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

function dependencyReader() {
  var visited = {};
  var visitedCls = {};
  var modules = {};
  // return the type names that class member depends on
  function memberDepends(mem) {
    //console.log(mem.name, mem.cls)
    return [mem.returnType]
      .concat(mem.arguments.map((a) => a.type))
      .map(filterTypeName)
      .filter((t, index, array) => array.indexOf(t) === index)
      .filter(isModule)
      //.filter((t) => t.match(/(\w+?)_\w+/));
  }

  // return the type names that this class depends on
  function classDepends(cls, wrapped, contructorsOnly) {
    if (visitedCls.hasOwnProperty(cls.name)) {
      return [];
    }
    console.log("Class", cls.name)
    visitedCls[cls.name] = true;
    const filter = wrapped ? cls.include : function() {
      return true
    };

    var members = contructorsOnly ? cls.constructors :
      cls.members.concat(cls.constructors)
    var res = members
      .filter(filter)
      .map(memberDepends)
      .reduce((a, b) => a.concat(b), [])
      .filter(unique);

    return res;
  }


  // return the type names that this module depends on
  function moduleDepends(moduleName, wrapped) {
    const q = query.loadModule(moduleName);
    const filter = wrapped ? q.include : function() {
      return true;
    };
    return q.classes
      .filter(filter)
      .filter((cls) => cls.name !== moduleName)
      .map((cls) => classDepends(cls, wrapped))
      .reduce((a, b) => a.concat(b), [])
      .filter(unique);
  }

  this.requiredTypes = function requiredTypes(moduleName, wrapped) {
    //if (visited === undefined) visited = {}
    if (wrapped === undefined) wrapped = true;
    if (!isModule(moduleName)) return [];
    if (visited.hasOwnProperty(moduleName)) {
      //console.log("visited", moduleName)
      return visited[moduleName];
    }


    var types = moduleDepends(moduleName, wrapped);
    var modules = types
      .map(modName)
      .filter(unique)
      .filter((m) => m !== moduleName)
      //.filter((m) => !visited[m]);
    var moduleTypes = modules
      .map((m) => requiredTypes(m, wrapped, visited))
      .reduce((a, b) => a.concat(b), []);


    var res = types.concat(moduleTypes).filter(unique).filter(isModule);
    visited[moduleName] = res;
    return res;
  }

  this.requiredModules = function requiredModules(moduleName, wrapped, visited) {
    //if (wrapped === undefined) wrapped = true;
    var types = this.requiredTypes(moduleName, wrapped, {});
    //console.log("TYPES: ", moduleName, types)
    return types
      .map(modName)
      .filter(unique)
      .filter((m) => m !== moduleName);
  }

  function getModule(name) {
    name = modName(name)
    if (modules.hasOwnProperty(name)) {
      return modules[name];
    }
    var q = query.loadModule(name);
    modules[name] = q;
    return q;
  }

  this.missingClasses = function missingClasses(types, wrapped, constructorsOnly) {
    //console.log("missingClasses",[types], constructorsOnly)
    wrapped = false;
    if (wrapped === undefined) wrapped = true;
    return types
      //.filter(isModule)
      .filter(unique)
      .filter((cls) => visitedCls[cls] === undefined)
      .map((clsName) => {
        var cls = getModule(clsName).classes.get(clsName);
        if (!cls) return [];
        if (cls && cls.cls !== "class") return [];
        //console.log(cls)
        var deps = classDepends(cls, wrapped, constructorsOnly)
          //.filter((cls) => visitedCls[cls] === undefined)
        console.log(cls.name, deps)
        var depdeps = missingClasses(deps, wrapped, true);
        return deps.concat(depdeps)
          //.filter((c) => !types.some((t) => t == c));
          //return deps;

      }).reduce((a, b) => a.concat(b), [])
      .filter(unique);


  }
  return this;
}





// used by parser, no filtering
function readModuleDependencies(moduleName) {
  return moduleDepends(moduleName, true)
    .map((name) => {
      var res = name.match(/(\w+?)_\w+/);
      if (res) return res[1];
      return null;
    })
    .filter(function(m, index, array) {
      if (!m) return false;
      if (m === 'Handle') return false;
      if (m === moduleName) return false;
      if ((array.indexOf(m)) === index) // only unique
        return true;
      return false;
    });
}


// finds all types that are used by a class, looks at all member arguments and types.
module.exports.findDependentTypes = function findDependentTypes(types, config, res) {
  if (res === undefined) res = {};
  types.forEach((name) => {
    if (res.hasOwnProperty(name)) return;
    res[name] = true;
    var matchRes = name.match(/(?:Handle_)*(\w+?)_\w+/)
    if (!matchRes) return;
    var moduleName = matchRes[1]
    var mod = query.loadModule(moduleName, config);
    var type = mod.types.get(name)
    if (type === undefined) return;
    var deps = classDepends(type)
    findDependentTypes(deps, config, res);
  })
  return res;
}

var fs = require('fs');
const toolkits = JSON.parse(fs.readFileSync('config/toolkits.json'));
module.exports.toolkitDepends = function(moduleName) {
  var modules = dependencyReader().requiredModules(moduleName).concat([moduleName]);
  var res = toolkits.filter((tk) => {
    return tk.modules.some(
      (m1) => modules.some((m2) => m1 === m2)
    );
  });
  //console.log('res', res)
  return res.map((tk) => tk.name);
};

module.exports.reader = dependencyReader;
module.exports.readModuleDependencies = readModuleDependencies;
// module.exports.memberDepends = memberDepends;
// module.exports.classDepends = classDepends;
// module.exports.moduleDepends = moduleDepends;
