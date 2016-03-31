var depend = require('../depend')
module.exports.configure = {
  ignore(name, parent) {
    console.log('ignore');
    return { name, parent, enabled: true };
  },
  include(name, parent) {
    console.log("include");
    return { name, parent, enabled: false };
  },
  includeDependencies(name, parent) {
    console.log("include");
    return { name, parent, enabled: false, deps: true };
  }
  // includeDependencies(moduleName, conf, name, parent) {
  //   var types = Object.keys(depend.findDependentTypes([name]));
  //   var res = types
  //     .filter((t) => t.startsWith(`${moduleName}_`))
  //     .map((t) => {
  //       return { name: t, enabled: false };
  //     });
  //   console.log("inc deps", res);
  //   return res;
  // }
  // includeWithDependencies(conf, name, parent) {
  //   console.log("include for", name)
  //   Object.keys(depend.findDependentTypes([name])).forEach((t) => {
  //     console.log("inclide", t)
  //     conf.include(t);
  //   });
  //   console.log("included")
  // }
};
module.exports.postConfigure = function(moduleName, q) {
  return q.config.ignore
    .filter((obj) => obj.deps)
    .map((obj) => Object.keys(depend.findDependentTypes([obj.name])))
    .reduce((a, b) => a.concat(b))
    .filter((type) => type.startsWith(`${moduleName}_`))
    .map(module.exports.configure.include);
};