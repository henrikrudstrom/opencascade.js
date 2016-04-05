const settings = require('../settings.js');
const common = require('./common.js');
const fs = require('fs');

function matcher(exp, matchValue) {
  if (matchValue === undefined)
    matchValue = true;
  return function(obj) {
    return common.match(exp, obj.name) ? matchValue : !matchValue;
  };
}
function processType(type) {
  type.declarations = [];
  if (type.cls !== 'class') return type;
  type.declarations = type.constructors.concat(type.members);
  delete type.constructors;
  delete type.members;
  return type;
}

function loadModule(mod) {
  var data = JSON.parse(fs.readFileSync(`${settings.paths.headerCacheDest}/${mod}.json`));
  data.declarations = data.typedefs
    .concat(data.enums)
    .concat(data.classes)
    .map(processType);
  delete data.typedefs;
  delete data.enums;
  delete data.classes;
  return data;
}

var modules = {}

function getModule(mod) {
  if (modules[mod] === undefined)
    modules[mod] = loadModule(mod);
  return modules[mod];
}

function children(type) {
  if (type.cls === 'class')
    return type.declarations;
  //TODO: enums
  return [];
}

function find(expr) {
  var mod = expr.replace('Handle_', '').split('_')[0];
  return common.find(getModule(mod), expr, matcher)
}

function get(name) {
  var res = find(name);
  if (res.length === 0) return null;
  if (res.length === 1) return res[0];
  throw new Error('headers.get expected one result, got multiple');
}

module.exports.find = find;
module.exports.get = get;
