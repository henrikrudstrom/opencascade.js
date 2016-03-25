var fs = require("fs")
var configData = JSON.parse(fs.readFileSync("config/gp.json"))
var camelCase = require('camel-case');
var query = require('json-query');


function match(str){
  var field = "name"
  var split = str.split("=")
  if(split.length == 2){
      field = split[0]
      str = split[1]
    }

  var exp = new RegExp("^"+str.replace("*", ".*")+"$");

  function m(obj){
    var value = obj[field]
    if(value === undefined) return false;
    return exp.test(value)
  }
  return m;
}

function Query(obj){
  if(obj === undefined) return function(){ return [] };
  var f = function(exp){
    //console.log("q: " + obj)
    return obj.filter(match(exp))
  }
  console.log("data", obj)
  f.classes = new Query(obj.classes);
  return f
}
var q = new Query(configData)


Array.prototype.select = function(exp){
  return this.filter(match("exp"))
}

configData.classes.select("abstract=true").map()

var funcs = configData.classes.filter(match("abstract=true"))
console.log(funcs.length)
//
// Array.prototype.select(q){
//     if(typeof q === "string")
//       q = bySig(q)
//     for(var i in data.classes){
//       cls = data.classes[i]
//       if (q(cls)){
//         console.log("found")
//         yield cls
//       }
//     }
// }
//
// data.classes.select("sdfs", rename("32"))
//
// fs.writeFile("config/gp_proc.json", JSON.stringify(configData, null, 2))
