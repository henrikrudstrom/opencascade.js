
var camelCase = require('camel-case');
var renameModule = function(moduleName){
  return function(name){
    return name.replace(moduleName+"_", "")
  }
}

module.exports = function(tree, flag, rename, ignore) {


  tree.types("*").members("*", rename(camelCase));
  tree.types("*", rename(renameModule("gp")))
  tree.types("*").members("_*", ignore());

  tree.types("gp_Pnt", rename("Point"));
};
