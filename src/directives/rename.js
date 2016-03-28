module.exports.configure = function(list) {
  return function(name, parent, newName) {
    if (!newName)
      return list.push({ name, newName: parent });
    return list.push({ name, parent, newName });
  };
};
module.exports.renderSwig = function() {
  var renames = [];
  config.data.rename.forEach(function(rename) {
    var target = rename.name;
    if (rename.parent)
      target = `${rename.parent}::${target}`;
    renames.push(`%rename(${rename.newName}) ${target};`);
  });
  const src = renames.join('\n');
  writeFile('renames.i', src);
};

function rename(name, target) {
  return `%rename("${name}") ${target};`;
}
};
