const conf = require('../conf.js');

conf.Conf.prototype.property = function(getter, setter, name) {
  this.transform(getter, (getMethod) => {
    if(getMethod.cls === 'constructor') return;
    if(typeof setter === 'string'){
      var setterStr = setter;
      setter = () => setterStr;
    }
    console.log("============================")
    var setMethod = this.get(setter(getter));
    console.log("FIND", setter(getter), this.find(setter(getter)))
    console.log(getMethod)
    console.log("============================")
    var property = {
      name: name || getMethod.name.replace(/^Get/, ""),
      key: getMethod.key,
      cls: 'property',
      type: getMethod.returnType,
      typeDecl: getMethod.returnTypeDecl,
      getter: getMethod.name,
      getterKey: getMethod.key,
      setter: setMethod ? setMethod.name : undefined,
      setterKey: setMethod ? setMethod.key : undefined
    };
    
    this.exclude(getMethod.key);
    this.exclude(setMethod.key);
    this.declarations.push(property);
    return property;
  });
  return this;
};


// module.exports.renderSwig = function(moduleName, config) {
//   return config.property.map(function(obj) {
//     const newName = camelCase(obj.name);
//     const set = `Set${obj.name}`;
//     return `%attribute(${obj.cls}, ${obj.type}, ${newName}, ${obj.name}, ${set});`;
//   }).join('\n');
// };