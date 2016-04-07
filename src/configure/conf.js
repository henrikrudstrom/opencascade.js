const extend = require('extend');
const headers = require('./headers.js');
const common = require('./common.js');

function matcher(exp, matchValue) {
  if (matchValue === undefined)
    matchValue = true;
  return function(obj) {
    var key = obj.key || obj.name;
    return common.match(exp, key) ? matchValue : !matchValue;
  };
}

function cleanTypeName(ret) {
  ret = ret.replace(/&|\*/, '');
  ret = ret.replace('const', '');
  ret = ret.trim();
  return ret;
}


function Conf(decl, parent) {
  require('./features/rename.js');
  if (decl) {
    extend(true, this, decl)
    this.key = decl.name;
    this.parent = parent;
  }
  //} else {
    this.declarations = [];
  //}

  // include nothing by default

  this.stacks = {
    include: [],
    transform: []
  }
}

Conf.prototype = {
  name(name) {
    this.name = name
  },
  
  find(expr) {
    var res = wrapDeclarations(common.find(this, expr, matcher)); // TODO. search by key not name

    return res;
  },

  get(name) {
    return common.get(this, name, matcher);
  },

  include(expr) {
    if (this.cls && (this.cls === 'class'|| this.cls === 'enum'))
      expr = `${this.key}::${expr}`;
    
    // query parsed headers for declaration
    var res = headers.find(expr)
      .map((decl) => {
        if (decl.declarations)
          return new Conf(decl, this.name);
        decl.key = decl.name;
        return extend(true, {}, decl);

      });
    
    this.declarations = this.declarations.concat(
      // dont add existing declarations
      res.filter((decl) => !this.declarations.some((d) => d.key === decl.key))
    );
    return this;
  },
  exclude(expr) {
    this.declarations = this.declarations.filter(matcher(expr, false));
  },
  transform(expr, fn) {
    this.stacks.transform.push(() => {
      this.find(expr).forEach(fn);
    });
  },

  process(stackName) {
    if (stackName === undefined) {
      this.process('include');
      this.process('transform');
      return;
    }
    if (this.declarations) {
      this.declarations
        .filter((decl) => decl.declarations)
        .forEach((decl) => decl.process(stackName));
    }
    this.stacks[stackName].forEach((fn) => fn());
    this.stacks[stackName] = [];
  }
};

function MultiConf(declarations) {}
MultiConf.prototype = new Array();
MultiConf.prototype.include = function(expr) {
  return this.map((decl) => decl.include(expr));
};
MultiConf.prototype.exclude = function(expr) {
  return this.map((decl) => decl.exclude(expr));
};

function wrapDeclarations(decls) {
  decls.__proto__ = new MultiConf();
  return decls;
}
module.exports = {
  Conf,
  wrapDeclarations
}
