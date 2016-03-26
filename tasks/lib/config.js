var fs = require('fs');
var common = require("./common.js");

module.exports = function(path) {
  var data = {};

  if(fs.existsSync(path)){
    console.log("Load config")
    data = JSON.parse(fs.readFileSync(path));
  }


  function push(msg, value) {
    if (!data.hasOwnProperty(msg))
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
      //console.log("Rename");
      var props = defaultData(obj);
      props.newName = expr;
      if (typeof expr === "function")
        props.newName = expr(obj.name);
      return props;
    })
  }

  function ignore(expr) {
    //console.log("IGNORE")
    return flag("ignore", function(obj) {
      //console.log("Ignore it!")
      return defaultData(obj)
    });
  }

  return {
    configure: function(fn, tree) {
      fn(tree, flag, rename, ignore);
      return data;
    },
    ignore: function(cls, member) {
        // if(member === undefined){
        //   member = cls;
        //   cls = undefined;
        // }
        //console.log(data)
        return data.ignore.some(function(ign) {
          if(member){
              if (!ign.parent) return false;
              if (cls != ign.parent) return false;
              return member === ign.name;
          } else {
            return cls === ign.name;
          }

        });
    },
    data: data,
  }

  // function ignoreMember(cls, config) {
  //   return function(obj) {
  //     return !config.ignore.some(function(ign) {
  //       if (!ign.parent) return false;
  //       if (cls.name != ign.parent) return false;
  //       return obj.name === ign.name;
  //     });
  //   }
  // }
}
