'use-strict';
const fs = require('fs');
const common = require('./common.js');
const match = common.match;

module.exports = function(path) {
  var data = { ignore: [], rename: [] };

  if (fs.existsSync(path)) {
    data = JSON.parse(fs.readFileSync(path));
  }


  function push(msg, value) {
    if (!data.hasOwnProperty(msg))
      data[msg] = [];
    data[msg].push(value);
  }

  function flag(msg, fn) {
    if (fn === undefined) fn = function(v) {
      return v;
    };
    return function(obj) {
      push(msg, fn(obj));
    };
  }

  function defaultData(obj) {
    var r = {
      name: obj.name
    };
    if (obj.parent)
      r.parent = obj.parent;
    return r;
  }

  function rename(expr) {
    return flag('rename', function(obj) {
      var props = defaultData(obj);
      props.newName = expr;
      if (typeof expr === 'function')
        props.newName = expr(obj.name);
      return props;
    });
  }

  function ignore() {
    return flag('ignore', function(obj) {
      return defaultData(obj);
    });
  }

  return {
    configure: function(fn, tree) {
      fn(tree, flag, rename, ignore);
      return data;
    },
    ignore: function(cls, member) {
      return data.ignore.some(function(ign) {
        if (member) {
          if (ign.parent && cls !== ign.parent) return false;
          return match(ign.name, member); // === ign.name;
        }
        if(cls.startsWith("gp_Vector"))
          console.log("IGNORE", cls, ign.name)
        return match(ign.name, cls);
      });
    },
    data: data,
  }


}
