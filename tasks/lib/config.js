module.exports = function(path) {
  this.data = {};
  this.tree = require("./tree.js").loadFromPath(path);


  function push(msg, value) {
    if (!this.data.hasOwnProperty(msg))
      data[msg] = []
      //console.log("push", msg, value)
    data[msg].push(value);
  }

  function flag(msg, fn) {
    //console.log("flag", fn)
    if (fn === undefined) fn = function(v) {
      return v
    };
    return function(obj) {
      push(msg, fn(obj));
    }
  }

  function defaultData(obj) {
    //console.log("data")
    var r = {
      name: obj.name
    }
    if (obj.parent)
      r.parent = obj.parent;
    return r;
  }

  function rename(expr) {
    return flag("rename", function(obj) {
      console.log("Rename");
      var data = defaultData(obj);
      data.newName = expr;
      if (typeof expr === "function")
        data.newName = expr(obj.name);
      return data;
    })
  }

  function ignore(expr) {
    //console.log("IGNORE")
    return flag("ignore", function(obj) {
      console.log("Ignore it!")
      return defaultData(obj)
    });
  }
  return {
    configure: function(fn) {
      fn(tree, flag, rename, ignore);
      return this.data;
    },
    ignore: function(name, cls) {
      if (cls === undefined) {
        if (data.ignore.find(function(obj) {
            return obj.name === name
          })) {

          return false;
        }
      }
      return true;
    },
    data: this.data,
    tree: this.tree
  }
}
