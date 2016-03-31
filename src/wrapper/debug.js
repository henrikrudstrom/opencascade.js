module.exports = function(moduleName, conf, tree) {
  conf.ignore('*');
  conf.includeDependencies('Geom_SphericalSurface');
};
