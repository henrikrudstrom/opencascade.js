module.exports.renderSwig = function(moduleName, config, tree) {
  var src = tree.headers.map((header) => `#include<${header}>`).join('\n');
  return `%{\n${src}\n%}`;
};
