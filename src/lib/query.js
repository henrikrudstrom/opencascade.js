const fs = require('fs');

function match(exp, name) {
  exp = new RegExp('^' + exp.replace('*', '.*') + '$');
  return exp.test(name);
}

// function tag(config, name, cls, member) {
//   return config[name].reverse() // Last entry to the list is valid
//     .find(function(obj) {
//       match.apply(null, members.split('::'));
//     });
// }

function tag(config, name, cls, member) {


  if (true) {

    ////console.log("config", config)
    //console.log("name", name)
    //console.log(cls, member)
  }

  return config[name].reverse() // Last entry to the list is valid
    .find(function(obj) {
      var found = false;

      if (obj.parent)
        return match(obj.parent, cls) && match(obj.name, member)
      return match(obj.name, cls)

    });
}

function ignore(config, cls, member) {
  const obj = tag(config, 'ignore', cls, member);


  if (obj) {
    if (!obj.enabled)
      return obj.enabled;
  }

  return false;
}

module.exports.match = match;
// module.exports.ignore = ignore;
// // module.exports.select = {
// //   ignore(config, cls) {
// //     return function(obj) {
// //       if (cls !== undefined)
// //         return !ignore(config, cls.name, obj.name);
// //       return !ignore(config, obj.name);
// //     };
// //   }
// // };
//
// module.exports.select = {
//   ignore(config, cls) {
//     return function(obj) {
//       if (cls !== undefined)
//         return !ignore(config, cls, obj);
//       return !ignore(config, obj);
//     };
//   }
// };

function get(name) {
  return this.find((m) => m.name === name);
}

function initMember(conf, cls, mem) {
  mem.tag = function(name) {
    return tag(conf, name, cls, mem);
  };
  // mem.ignore = function() {
  //   return mem.tag('ignore') && mem.tag('ignore').enabled;
  // }
}

function initType(conf, cls) {
  cls.tag = function(name) {
    return tag(conf, name, cls.name);
  };

  if (!cls.constructors) cls.constructors = [];
  if (!cls.members) cls.members = [];
  cls.constructors.concat(cls.members).forEach((mem) => initMember(conf, cls, mem));
  cls.constructors.get = get.bind(cls.constructors);
  cls.members.get = get.bind(cls.members);

  cls.include = function(c) {
    if (c.tag('ignore')) {
      return !c.tag('ignore').enabled;
    }
    return true;
  }
  return cls;
}


module.exports.loadModule = function(moduleName, config) {
  const tree = JSON.parse(fs.readFileSync(`cache/tree/${moduleName}.json`));
  if (config === undefined)
    config = JSON.parse(fs.readFileSync(`build/config/${moduleName}.json`));
  tree.types = [tree.typedefs, tree.enums, tree.classes].reduce((a, b) => a.concat(b));
  tree.types.forEach((cls) => initType(config, cls));

  tree.memberDepends = function(mem) {
    return [mem.returnType].concat(mem.arguments.map((a) => a.type))
      .filter((t, index, array) => array.indexOf(t) === index);
  };

  tree.classDepends = function(cls) {
    return [cls.name]
      .concat(cls.bases.map(tree.classDepends))
      .concat(cls.members.filter((m) => ignore(config, m)))
      .filter((t, index, array) => array.indexOf(t) === index);
  };
  tree.types.get = get.bind(tree.types);
  tree.typedefs.get = get.bind(tree.typedefs);
  tree.classes.get = get.bind(tree.classes);

  tree.include = function(cls) {
    if (cls.tag('ignore')) {
      return !cls.tag('ignore').enabled;
    }
    return true;
  }

  return tree;
};
