module.exports.configure = {
  ignore(name, parent) {
    return { name, parent, enabled: true };
  },
  include(name, parent) {
    return { name, parent, enabled: false };
  }
};
