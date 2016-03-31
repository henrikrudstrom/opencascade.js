const query = require('./lib/query.js');

function pass() {
  return true;
}

function filterTypes(name) {
  ['']
}

function filterTypeName(ret) {
  ret = ret.replace(/&|\*/, "");
  ret = ret.replace("const", "");
  ret = ret.replace(" ", "");
  return ret;
  //return ret.replace(/(\*)|(\&)|(const)|( )/, '');
}

function memberDepends(mem) {
  //console.log("mem", mem);
  return [mem.returnType]
    .concat(mem.arguments.map((a) => a.type))
    .map(filterTypeName)
    .filter((t, index, array) => array.indexOf(t) === index)
    .filter((t) => t.match(/(\w+?)_\w+/));
}


function classDepends(cls, noFilter) {
  //console.log(cls)
  //console.log("cls", cls)
  return [cls.name]
    //.concat(cls.bases.map(classDepends))
    .concat(cls.members
      //.filter(noFilter ? pass : cls.include)
      .map(memberDepends)
      .reduce((a, b) => a.concat(b), [])
    )
    .filter((t, index, array) => array.indexOf(t) === index);
}




function moduleDepends(moduleName, noFilter) {
  const q = query.loadModule(moduleName);
  //console.log(q.classes)
  //console.log('q.classes')
  return q.classes
    //.filter(noFilter ? pass : q.include)
    .map(classDepends)
    .reduce((a, b) => a.concat(b), []);
}


module.exports.readModuleDependencies = function(moduleName) {
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
};
module.exports.memberDepends = memberDepends;
module.exports.classDepends = classDepends;
module.exports.moduleDepends = moduleDepends;

function modName(name) {
  return
}

module.exports.findDependentTypes = function findDependentTypes(types, config, res) {
  //console.log("find", types, types.forEach);
  if (res === undefined) res = {};
  types.forEach((name) => {
    if (res.hasOwnProperty(name)) return;
    res[name] = true;
    console.log("name", name)
    var matchRes = name.match(/(?:Handle_)*(\w+?)_\w+/)
    if (!matchRes) return;
    var moduleName = matchRes[1]
      //console.log(moduleName, name);
    var mod = query.loadModule(moduleName, config);
    var type = mod.types.get(name)
    if (type === undefined) return;
    var deps = classDepends(type)
    findDependentTypes(deps, config, res);
  })
  return res;
}


//
// module.exports.readDependencies = function(moduleName) {
//   const q = query.loadModule(moduleName);
//   q.classes.members.map(function(arg) {
//     var res = arg.type.match(/(\w+?)_\w+/);
//     if (res) return res[1];
//     return null;
//   });
//   var ret = q.classes.members.map(function(m) {
//     if (!m.returnType) return undefined;
//     return m.returnType.match(/(\w+?)_\w+/)[1];
//   });
//   var types = args.concat(ret);
//   types = types.filter(function(m, index) {
//     if (!m) return false;
//     if (m === 'Handle') return false;
//     if (m === moduleName) return false;
//     if ((types.indexOf(m)) === index) // only unique
//       return true;
//     return false;
//   });
//   return types;
// }
