module.exports.configure = function(name, parent, newName) {
  if (newName === undefined)
    return { name, newName: parent };
  return { name, parent, newName };
};
module.exports.renderSwig = function(moduleName, config) {
  var renames = config.rename.map(function(obj) {
    var target = obj.name;
    if (obj.parent)
      target = `${obj.parent}::${target}`;
    return `%rename("${obj.newName}") ${target};`;
  });
  return renames.join('\n');
};
module.exports.process = function process(obj, tag) {
  if (tag) {
    obj.name = tag.newName;
    obj.oldName = tag.name;
  }
  return obj;
}
