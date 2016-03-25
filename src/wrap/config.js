module.exports = function(moduleName){
  var config = {};
  this.tree = require("./tree.js")(moduleName);
  console.log("TREE", tree.classes.length)

  function push(msg, value){
    if(!config.hasOwnProperty(msg))
      config[msg] = []
    //console.log("push", msg, value)
    config[msg].push(value);
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

  function defaultData(obj){
    //console.log("data")
    var r = { name: obj.name }
    if(obj.parent)
      r.parent = obj.parent;
    return r;
  }

  function rename(expr){
    return flag("rename", function(obj){
      //console.log("Rename");
      var data = defaultData(obj);
      data.newName = expr;
      if(typeof expr === "function")
        data.newName = expr(obj.name);
      return data;
    })
  }
  function ignore(expr){
    //console.log("IGNORE")
    return flag("ignore", function(obj){
      //console.log("Ignore it!")
      return defaultData(obj)
    });
  }








  this.configure = function(fn){
    fn(tree, flag, rename, ignore);
    return config;
  }
  return this;
}
