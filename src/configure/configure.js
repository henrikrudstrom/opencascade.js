const extend = require('extend');

function match(exp, name) {
  exp = new RegExp('^' + exp.replace('*', '.*') + '$');
  return exp.test(name);
}


function Class(cls) {
  extend(this, cls);
  this.members = this.constructors.concat(this.members);
  delete this.constructors;

}
Class.prototype = {
  applyConfig(expr, fn) {
    if (typeof expr === 'string')
      expr = (obj) => match(expr, obj.name);
    this.members.filter(expr).forEach(fn);
    return this;
  },
  include(expr, inc) {
    if (inc === undefined) inc = true;
    return this.applyConfig(expr, (mem) => mem.include = inc)
  },
  exclude(expr) {
    return include(expr, false);
  },
  rename(expr, name) {
    if (typeof name === 'string')
      name = (obj) => name;
    return this.applyConfig(expr, (mem) => mem.rename = name(mem.name))
  },
  camelCase(expr){
    return this.rename(expr, camelCase)
  }



}



var camelCase = require('cameCase');


var gp = new Module('gp')
gp.include('gp_Vec', 'Vector')
  .include('*')
  .exclude('_*')
  .rename('*', camelCase),
  include('gp_Quaternion', 'Quaternion')
  .include('*')
  .includeAsStatic('gp_QuaternionSLerp', )




}

}








var rename = {};
renameImpl = function(obj, name, newName) {
  return {
    fn: () => {
      obj.oldName = obj.name;
      obj.name = newName;
      return obj;
    }
  };
};

function applySelector(items, selector, fn) {
  var res = {};
  items.filter((item) => match(selector, item.name))
    .forEach((item) => {
      res[item.name] = fn;
    });
  return res;
}

function rename(selector) {
  var args = [].slice.call(arguments, 1);

}



function registerDirectives(data, conf) {
  conf = conf || {}
  directives
    .filter((dir) => dir.module.configure !== undefined)
    .forEach((dir) => {

      if (!data.hasOwnProperty(dir.name))
        data[dir.name] = [];

      var methods = dir.module.configure;
      if (typeof methods === 'function') {
        methods = {};
        methods[dir.name] = dir.module.configure;
      }

      Object.keys(methods)
        .forEach((m) => {
          conf[m] = function() {
            var res = methods[m].apply(null, arguments);
            ////console.log('res', res, arrify(res));
            // var args = [].slice.call(arguments, 1);
            data[dir.name] = data[dir.name].concat(arrify(res));
          };
        });
    });

  return conf;
}
