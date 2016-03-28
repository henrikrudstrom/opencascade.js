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

module.exports.moveAsStatic = function(name, parent, newParent, newName) {
  if ($$.data.move === undefined)
    $$.data.move = [];
  $$.data.move.push({ name, parent, newParent, newName });
};

module.exports.renderStatic = function(moduleName, conf) {
  const src = `\
const ${conf.parent} = _${moduleName}.${conf.parent};
delete _gp.${conf.parent};
_${moduleName}.${conf.newParent}.__proto__.${conf.newName} = function(){
    return ${conf.parent}.${conf.name}.bind(this, arguments);
};`;
  return src;
};
