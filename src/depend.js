const query = require('./query.js');
const settings = require('./settings.js');

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
  ////console.log("mem", mem);
  return [mem.returnType]
    .concat(mem.arguments.map((a) => a.type))
    .map(filterTypeName)
    .filter((t, index, array) => array.indexOf(t) === index)
    .filter((t) => t.match(/(\w+?)_\w+/));
}


function classDepends(cls, noFilter) {
  ////console.log(cls)
  ////console.log("cls", cls)
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
  ////console.log(q.classes)
  ////console.log('q.classes')
  return q.classes
    //.filter(noFilter ? pass : q.include)
    .map(classDepends)
    .reduce((a, b) => a.concat(b), []);
}


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
};
module.exports.readModuleDependencies = readModuleDependencies
module.exports.memberDepends = memberDepends;
module.exports.classDepends = classDepends;
module.exports.moduleDepends = moduleDepends;

function modName(name) {
  return
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


// function toolkitDeps(moduleName) {
//   var modules = settings.depends[moduleName].concat([moduleName]);
//   var toolkits = settings.toolkits.map(getToolkit);
//   //console.log(toolkits)
//   return toolkits
//     .filter((m, index) => toolkits.indexOf(m) === index)
//     .map((s) => `      "-l${s}"`).join(',\n');
// }
//
var fs = require('fs');
const toolkits = JSON.parse(fs.readFileSync('config/toolkits.json'));
module.exports.toolkitDepends = function(moduleName) {
  var modules = readModuleDependencies(moduleName).concat([moduleName]);
  //console.log("MODS", modules)
  var res = Object.keys(toolkits).filter((tk) => {
    //console.log("TK", tk)
    return toolkits[tk].some(
      (m1) => modules.some((m2) => m1 === m2)
    );
  });
  //console.log("res", res)
  return res;
};

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
