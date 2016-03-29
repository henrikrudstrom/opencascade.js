// module.exports.configure = function(name, parent, newParent, newName) {
//   return { name, parent, newParent, newName };
// };
//
// module.exports.renderJS = function(moduleName, conf) {
//   const src = `\
// const ${conf.parent} = _${moduleName}.${conf.parent};
// delete _${moduleName}.${conf.parent};
// _${moduleName}.${conf.newParent}.__proto__.${conf.newName} = function(){
//     return ${conf.parent}.${conf.name}.bind(this, arguments);
// };`;
//   return src;
// };
//
// //header
//
// function header(moduleName){
//   const src = `\
// const _${moduleName} = require('${moduleName}.node');
//   `
// }
