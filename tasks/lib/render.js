'use-strict';
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');


const loadConfig = require('./config.js');
const loadTree = require('./tree.js');
const settings = require('./settings.js');
const paths = settings.paths;
const camelCase = require('camel-case');


function ignoreClass(config) {
  return function(obj) {
    return !config.ignore(obj.name);
  };
}

function ignoreMember(cls, config) {
  return function(obj) {
    return !config.ignore(cls.name, obj.name);
  }
}

function isClass(name) {
  return function(member) {
    return member.cls !== name;
  }
}


function renderArg(arg) {
  var res = arg.decl + ' ' + arg.name;
  if (arg.default) {
    res += '=' + arg.default;
  }
  return res;
}

function renderFunction(func) {
  var args = func.arguments.map(renderArg).join(', ');

  var stat = func.static ? 'static ' : '';
  var cons = func.const ? ' const' : '';

  return `
    %feature("compactdefaultargs") ${func.name};
    ${stat}${func.returnType + ' '}${func.name}(${args})${cons};`;
}

function renderClass(cls, config) {
  var functions = cls.members
    .filter(isClass('calldef'))
    .filter(ignoreMember(cls, config))
    .map(renderFunction).join('');
  var base = '';
  if (cls.bases.length > 0) {
    base = ' : ' + cls.bases[0].access + ' ' + cls.bases[0].name;
  }
  const constructors = cls.constructors
    .filter(ignoreMember(cls, config))
    .map(renderFunction).join('');
  return `\
%nodefaultctor ${cls.name};
class ${cls.name}${base} {
	public:
    /* Constructors */
    ${constructors}
    /* Member functions */
    ${functions}
};
`;
}

function renderTypedef(td) {
  return `typedef ${td.type} ${td.name};`;
}

function renderEnum(en) {
  var values = en.values.map(function(v) {
    return `  ${v[0]} = ${v[1]}`;
  }).join(',\n');
  return `enum ${en.name} {\n${values}\n};`;
}

module.exports = function(moduleName, swigPath) {
  var tree = loadTree(`${paths.headerCacheDest}/${moduleName}.json`);
  var config = loadConfig(`build/config/${moduleName}.json`);
  var basePath = path.join(swigPath, moduleName);
  var depends = settings.depends[moduleName];

  function writeFile(dest, src) {
    var fullPath = path.join(basePath, dest);
    mkdirp.sync(path.dirname(fullPath));
    fs.writeFileSync(fullPath, src);
  }

  this.renderClasses = function() {
    tree.classes
      .filter(ignoreClass(config))
      .forEach(function(cls) {
        var src = renderClass(cls, config);
        writeFile(`/classes/${cls.name}.i`, src);
      });
  };

  this.renderHeaders = function() {
    var src = tree.headers.map(function(header) {
      // TODO: filter includes
      return `#include<${header}>`;
    }).join('\n');
    src = `%{\n${src}\n%}`;
    writeFile('headers.i', src);
  };

  this.renderRenames = function() {
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

  this.renderDefaultRenames = function() {
    var prefix = `${moduleName}_`;
    var classRenames = tree.classes
      .filter(ignoreClass(config))
      .filter((cls) => cls.name.startsWith(prefix))
      .map((cls) => rename(cls.name.replace(prefix, ''), cls.name));


    //      var camelCaseRenames = [];
    var camelCaseRenames = tree.classes
      .filter(ignoreClass(config))
      .map((cls) => cls.members.filter(ignoreMember(cls, config)))
      .reduce((a, b) => a.concat(b))
      .map((mem) => rename(camelCase(mem.name), mem.name));
    const src = classRenames.concat(camelCaseRenames).join('\n');
    writeFile('defaultRenames.i', src);
  };

  this.renderModule = function() {
    const dependencies = depends.map(function(dep) {
      return `%import "../${dep}/module.i";\n%include ../${dep}/headers.i`;
    }).join('\n');
    var custom = '';
    var typedefs, enums, classes;
    if (fs.exists(`${paths.userSwigDest}/${moduleName}.i`))
      custom = `\n%include ../user/${moduleName}.i\n`;

    typedefs = tree.typedefs
      .filter(ignoreClass(config))
      .map(renderTypedef)
      .join('\n');
    if (typedefs) typedefs += '\n';

    enums = tree.enums
      .filter(ignoreClass(config))
      .map(renderEnum)
      .join('\n');
    if (enums) enums += '\n';

    classes = tree.classes
      .filter(ignoreClass(config))
      .map((cls) => `%include classes/${cls.name}.i`)
      .join('\n');
    if (classes) classes += '\n';


    const src = `\
// Module ${moduleName}
%module(package="OCC") ${moduleName}
%include ../../user/common/ModuleHeader.i
%include headers.i

//dependencies
${dependencies}

%include defaultRenames.i
%include renames.i
${custom}


${typedefs}
${enums}
${classes}
`;
    writeFile('module.i', src);
  };
};
