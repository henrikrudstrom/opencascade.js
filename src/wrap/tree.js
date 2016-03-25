function match(str) {
  var field = "name"
  var split = str.split("=")
  //console.log("split", split)
  if (split.length == 2) {
    field = split[0]
    str = split[1]
  }

  var exp = new RegExp("^" + str.replace("*", ".*") + "$");

  function m(obj) {
    var value = obj[field]
    if (value === undefined) return false;
    return exp.test(value)
  }
  return m;
}

Array.prototype.select = function(expr, fn) {
  if (this.length < 1) return this;
  if (typeof expr !== "function") expr = match(expr)
  if(fn === undefined) fn = function(v){ return v; };
  if (!Array.isArray(this[0])){
    return this.filter(expr).map(function(item){
      fn(item);
      return item
    });
  }

  return this.map(function(arr) {
    return arr.select(expr, fn)
  }).reduce(function(a, b) {
    return a.concat(b);
  });
}
Array.prototype.members = function(expr, fn) {
  if (this.length < 1) return [];
  if(!this[0].members) return null;
  return this.map(function(m){
    return m.members
  }).select(expr, fn)
}
//
// Array.prototype.rename = function(name) {
//   if (this.length < 1) return [];
//
//   return this.map(function(m){
//     m.$rename = { orig: m.name }
//     m.name = name;
//     return m;
//   })
// }

// console.log("hello")
// console.log(configData.classes.select("gp_Pnt*").members("*X"))

function load(file){
  //console.log(file)
  var fs = require("fs");
  var config = JSON.parse(fs.readFileSync(file));
  config.types = function(expr, fn){
    return [config.classes, config.typedefs, config.enums].select(expr, fn);
  }

  return config;

}

module.exports = function(module){
  var config = load(`config/${module}_tree.json`)
  console.log(config.classes.length)
  return config
}
