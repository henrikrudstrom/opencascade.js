const fs = require('fs');
const settings = require('./settings');
function match(exp, name) {
  exp = new RegExp('^' + exp.replace('*', '.*') + '$');
  return exp.test(name);
}

function tag(config, name, cls, member) {
  if (Object.keys(config).indexOf(name) === -1) {
    return undefined;
  }

  var tags = config[name]
    .filter(function(obj) {
      if (obj.parent)
        return match(obj.parent, cls) && match(obj.name, member);
      return match(obj.name, cls);
    });
  if (tags.length < 1) return null;
  // the last match overrides the earlier ones.
  return tags[tags.length - 1];
}


module.exports.match = match;

function get(name) {
  return this.find((m) => m.name === name);
}

function initMember(conf, cls, mem) {
  mem.tag = function(name) {
    return tag(conf, name, cls.name, mem.name);
  };
}

function initType(conf, cls) {
  cls.tag = function(name) {
    ////console.log("tyoetag", conf, name);
    return tag(conf, name, cls.name);
  };

  if (!cls.constructors) cls.constructors = [];
  if (!cls.members) cls.members = [];
  cls.calldefs = cls.constructors.concat(cls.members);
  cls.calldefs.forEach((mem) => initMember(conf, cls, mem));
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

//var moduleCache = {};
module.exports.loadModule = function loadModule(moduleName, opts) {
  opts = opts || {};
  // if (moduleCache.hasOwnProperty(moduleName) && opts.cache){
  //   //console.log("cahced")
  //   return moduleCache[moduleName];
  // }
  const tree = JSON.parse(fs.readFileSync(`${settings.paths.headerCacheDest}/${moduleName}.json`));
  const configPath = `${settings.paths.build}/config/${moduleName}.json`
  var config = opts.config || {};
  if (opts.config === undefined && fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath));
  }
  tree.config = config;
  //config = JSON.parse(fs.readFileSync(configPath));
  tree.types = [tree.typedefs, tree.enums, tree.classes].reduce((a, b) => a.concat(b));
  tree.types.forEach((cls) => initType(config, cls));

  tree.types.get = get.bind(tree.types);
  tree.typedefs.get = get.bind(tree.typedefs);
  tree.classes.get = get.bind(tree.classes);
  tree.classes.calldefs = function() {
    return tree.classes.calldefs
      .map((mem) => mem.calldefs)
      .reduce((a, b) => a.concat(b));
  }
  tree.include = function(cls) {
    ////console.log("include", cls.name, cls.tag('ignore'));
    if (cls.tag('ignore')) {
      ////console.log("tagged", cls.name, cls.tag('ignore'))
      return !cls.tag('ignore').enabled;
    };

    return true;
  };
  //moduleCache[moduleName] = tree;
  return tree;
};

module.exports.getTag = tag;
