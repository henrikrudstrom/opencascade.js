require('./features/rename.js');

const fs = require('fs');
const mkdirp = require('mkdirp');
const glob = require('glob');
const path = require('path');
const settings = require('../settings.js');
var conf = require('./conf.js');
var createTypeDict = require('./typedict.js')




function configureModule(file){
  var file = file.replace("src/configure/", "./");
  var configure = require(file);
  
  var mod = new conf.Module();
  configure(mod);
  mod.process();
  return mod;
}

function configure(){
  
  var mods = glob.sync('src/configure/modules/*.js').map(configureModule)
  console.log(mods)
  var typedict = createTypeDict(mods);
  mods.forEach((mod) => {
    var members = mod.declarations.map(
      (decl) => decl.declarations ? decl.declarations : []
    ).reduce((a,b) => a.concat(b));
    console.log(members)
    members.forEach(
      (mem) => {
        mem.returnType = typedict(mem.returnType);
        mem.arguments.forEach((arg) => {
          delete arg.decl;
          arg.type = typedict(arg.type);
        })
      }
    )
    
  })
  
  
  
  mods.forEach((mod) => {
    var destFile = `${settings.paths.build}/${mod.name}.js`;
    mkdirp(path.dirname(destFile));
    fs.writeFileSync(destFile, JSON.stringify(mod, null, 2));  
  })
  
}

module.exports = configure();