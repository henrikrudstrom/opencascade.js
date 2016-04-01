module.exports = function(moduleName, conf, tree) {
  conf.ignore('*');
  conf.includeDependencies("BRepBuilderAPI_MakeFace")
};
