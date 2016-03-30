var depend = require('../depend')
module.exports.configure = function(moduleName, conf, name, parent) {
  return Object.keys(depend.findDependentTypes([name])).forEach((t) => {
    console.log('inclide', t)
    conf.include(t);
  });
}
