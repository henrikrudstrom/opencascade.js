const extend = require('extend');
const headers = require('./headers.js');
const common = require('./common.js');
const util = require('util');

function matcher(exp, matchValue) {
  if (matchValue === undefined)
    matchValue = true;
  return function(obj) {
    var key = obj.key || obj.name;
    return common.match(exp, key) ? matchValue : !matchValue;
  }
}



function Module() {
  require('./features/rename.js')
  this.declarations = [];
  this.stacks = {
    include: [],
    transform: []
  }
}
Module.prototype = {
  name(name) {
    this.name = name
  },
  find(expr) {
    return common.find(this, expr, matcher); // TODO. search by key not name
  },
  get(name) {
    return common.get(this, name, matcher);
  },
  include(expr) {
    headers.find(expr)
      .forEach((decl) => {
        var cls = new Class(decl);
        this.declarations.push(cls);
      });
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
      this.declarations.forEach((decl) => decl.process(stackName));
    }
    this.stacks[stackName].forEach((fn) => fn());
    this.stacks[stackName] = [];

  }
};


function Class(decl) {
  extend(true, this, decl)
  this.key = decl.name;
  this.stacks = {
    include: [],
    transform: []
  }
}
Class.prototype = extend({}, Module.prototype)
Class.prototype.include = function include(expr) {
  expr = `${this.key}::${expr}`;
  headers.find(expr)
    .forEach((decl) => {
      var cls = new Class(decl);
      this.declarations.push(cls);
    });
};
Class.prototype.process = function process(stackName) {
  if (stackName === undefined) {
    this.process('include');
    this.process('transform');
    return;
  }
  this.stacks[stackName].forEach((fn) => fn());
  this.stacks[stackName] = [];

}


module.exports = {
  Module,
  Class
}
