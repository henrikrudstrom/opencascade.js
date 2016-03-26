var common = require('./common.js');


function matchExpr(exp){
    var field = "name"
    var split = exp.split("=")
      //console.log("split", split)
    if (split.length == 2) {
      field = split[0]
      exp = split[1]
    }

    function m(obj) {
      var value = obj[field]
      if (value === undefined) return false;
      return common.match(exp, value)
    }
    return m;
}

function filterType(type, expr) {
  if (typeof expr !== "function") expr = matchExpr(expr)
  return function filterType(obj) {

    return obj.cls === type && expr(obj);

  }
}

Array.prototype.select = function(expr, fn) {
  if (this.length < 1) return this;
  if (typeof expr !== "function") expr = matchExpr(expr)
  if (fn === undefined) fn = function(v) {
    return v;
  };
  if (!Array.isArray(this[0])) {
    return this.filter(expr).map(function(item) {
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
  return config;
}
function readDependencies(moduleName){
  //var tree = trees.loadFromPath(`data/tree/${moduleName}.json`);
  args = this.types("*").members("*").args("*").map(function(arg){
    var res = arg.type.match(/(\w+?)_\w+/)
    if(res) return res[1];
  })
  var ret = this.types("*").members("*").map(function(m){
    if(!m.return_type) return;
    return m.return_type.match(/(\w+?)_\w+/)[1]
  })
  var types = args.concat(ret)
  types = types.filter(function(m, index){
    if(!m) return false;
    if(m === "Handle") return false;
    if(m === moduleName) return false;
    if((types.indexOf(m)) === index) //only unique
    return true;
  });
  return types;
}

module.exports = function(path) {
  var fs = require("fs");
  var config = load(fs.readFileSync(path))

  config.save = function(done) {
    fs.writeFile(path, JSON.stringify(config, null, 2), done)
  }
  config.readDependencies = readDependencies.bind(config);
  return config
}