const common = require('./common.js');

module.exports = function(moduleName, conf, q) {
  conf.ignore('*');
  common.noClassPrefix(moduleName, conf, q);
  // conf.include('Geom_SphericalSurface');
};
