//TODO implement as function called inside configuration
module.exports.noClassPrefix = function(moduleName, conf, q) {
  var prefix = `${moduleName}_`;
  return q.classes
    .filter((cls) => cls.name.startsWith(prefix))
    .filter(q.include)
    .forEach((cls) => conf.rename(cls.name, cls.name.replace(prefix, '')))
};
