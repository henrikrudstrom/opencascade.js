var depend = require('../depend')
module.exports.configure = {
  ignore(name, parent) {
    console.log('ignore');
    return { name, parent, enabled: true };
  },
  include(name, parent) {
    return { name, parent, enabled: false };
  },
  // includeWithDependencies(conf, name, parent) {
  //   console.log("include for", name)
  //   Object.keys(depend.findDependentTypes([name])).forEach((t) => {
  //     console.log("inclide", t)
  //     conf.include(t);
  //   });
  //   console.log("included")
  // }
};
