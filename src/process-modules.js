
var configs = require("./wrap/config.js")

function config(name){
  var config = configs(name);
  var mod = require("./wrap/modules/"+name+".js");
  console.log("MOD", mod)
  console.log(config.configure(mod));



}

config("gp");
