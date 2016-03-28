module.exports.tree = $$.tree;
module.exports.ignore = function(name, parent) {
  $$.data.ignore.push({
    name,
    parent
  });
};
module.exports.rename = function(name, parent, newName) {
  if (!newName)
    $$.data.rename.push({
      name,
      newName: parent
    });
  else
    $$.data.rename.push({
      name,
      parent,
      newName
    });
};
