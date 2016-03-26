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

function filterType(type, expr) {
  if (typeof expr !== "function") expr = match(expr)
  return function filterType(obj) {

    return obj.cls === type && expr(obj);

  }
}

Array.prototype.select = function(expr, fn) {
  if (this.length < 1) return this;
  if (typeof expr !== "function") expr = match(expr)
  if (fn === undefined) fn = function(v) {
    return v;
  };
  if (!Array.isArray(this[0])) {
    return this.filter(expr).map(function(item) {
      fn(item);
      return item
    });
  }
  //console.log("this")
  //console.log(this);
  return this.map(function(arr) {
    return arr.select(expr, fn)
  }).reduce(function(a, b) {
    return a.concat(b);
  });
}
Array.prototype.members = function(expr, fn) {
  if (this.length < 1) return [];
  if (!this[0].members) return [];
  return this.map(function(m) {
    return m.members
  }).select(expr, fn)
}

Array.prototype.members.functions = function(expr, fn) {
  return this.members(filterType("memfun", expr), fn);
}

Array.prototype.args = function(expr, fn) {
  if (this.length < 1) return [];
  if (!this[0].arguments) return [];
  return this.map(function(m) {
    return m.arguments;
  }).select(expr, fn)
}


function load(src) {
  console.log(src)
  var config = JSON.parse(src);
  config.types = function(expr, fn) {
    return [config.classes].select(expr, fn);
  }
  // config.types.classes = function(expr, fn) {
  //   return config.types(filterType("class", expr), fn);
  // }

  return config;
}

module.exports.loadFromPath = function(path) {
  var fs = require("fs");
  var config = load(fs.readFileSync(path))
  
  config.save = function(done) {
    fs.writeFile(path, JSON.stringify(config, null, 2), done)
  }
  return config
}
module.exports.load = function(src) {
  var config = load(src)
  console.log(config.classes.length)
  return config
}
