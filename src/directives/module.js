const fs = require('fs');

const settings = require('../lib/settings.js');
const paths = settings.paths;
const common = require('../lib/common.js');
const ignore = common.select.ignore;

function renderTypedef(td) {
  return `typedef ${td.type} ${td.name};`;
}

function renderEnum(en) {
  var values = en.values.map(function(v) {
    return `  ${v[0]} = ${v[1]}`;
  }).join(',\n');
  return `enum ${en.name} {\n${values}\n};`;
}

module.exports.renderSwig = function(moduleName, config, tree) {
  const depends = settings.depends[moduleName];
  const dependantModules = depends.map(function(dep) {
    return `%import "build/swig/gen/${dep}/module.i";`;
  }).join('\n');
  const dependantHeaders = depends.map(function(dep) {
    return `%include build/swig/gen/${dep}/headers.i`;
  }).join('\n');

  var custom = '';
  var typedefs, enums, classes;
  if (fs.existsSync(`src/swig/${moduleName}.i`))
    custom = `\n%include ../../user/${moduleName}.i\n`;

  typedefs = tree.typedefs
    .filter(ignore(config))
    .map(renderTypedef)
    .join('\n');
  if (typedefs) typedefs += '\n';

  enums = tree.enums
    .filter(ignore(config))
    .map(renderEnum)
    .join('\n');
  if (enums) enums += '\n';

  classes = tree.classes
    .filter(ignore(config))
    .map((cls) => `%include classes/${cls.name}.i`)
    .join('\n');
  if (classes) classes += '\n';


  const src = `\
// Module ${moduleName}
//dependencies
${dependantModules}
${dependantHeaders}

%module(package="OCC") ${moduleName}
%include ../../user/common/ModuleHeader.i
%include headers.i

%include camelCase.i
%include noPrefix.i
%include rename.i
%include property.i
${custom}


${typedefs}
${enums}
${classes}
`;
  return src;
};
