
// //TODO implement as function called inside configuration
// module.exports.renderSwig = function(moduleName, config, q) {
//   var prefix = `${moduleName}_`;
//   return q.classes
//     .filter((cls) => cls.name.startsWith(prefix))
//     .filter(q.include)
//     .map((cls) => `%rename("${cls.name.replace(prefix, '')}") ${cls.name};`)
//     .join('\n');
// };
