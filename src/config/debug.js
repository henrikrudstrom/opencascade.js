module.exports = function(moduleName, conf, tree) {
  conf.ignore('*');
  conf.includeDependencies(moduleName, conf, 'Geom_SphericalSurface');
};
