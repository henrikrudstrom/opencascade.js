
var camelCase = require('camel-case');

//module.export = function(tree, flag) {
module.exports = function(tree, flag, rename, ignore) {
  //console.log(tree.types("gp_Pnt", flag("rename", "Point")));
  tree.types("gp_Pnt", rename("Point"));
  tree.types("gp_Pnt2d").members("*", rename(camelCase));
  tree.types("gp_Vec*", ignore);
};
