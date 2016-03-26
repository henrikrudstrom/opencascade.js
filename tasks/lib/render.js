var fs = require("fs");
var mkdirp = require('mkdirp');
var path = require('path');
//var data = JSON.parse(fs.readFileSync("config/gp_proc.json"))

var loadConfig = require("./config.js")
var loadTree = require("./tree.js")

function ignoreClass(config) {
  return function(obj) {
    return !config.ignore(obj.name)
  }
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
  res = arg.decl + " " + arg.name
  if (arg.default) {
    res += "=" + arg.default
  }
  return res;
}

function renderFunction(func) {
  var args = func.arguments.map(renderArg).join(", ");

  var stat = func.static ? "static " : ""
  var cons = func.const ? " const" : ""

  return `
    %feature("compactdefaultargs") ${func.name};
    ${stat}${func.returnType + " "}${func.name}${cons}(${args});`
}

function renderClass(cls, config) {
  var functions = cls.members
    .filter(isClass("calldef"))
    .filter(ignoreMember(cls, config))
    .map(renderFunction).join("");
  var base = ""
  if (cls.bases.length > 0) {
    base = " : " + cls.bases[0].access + " " + cls.bases[0].name;
  }
  var constructors = cls.constructors
    .filter(ignoreMember(cls, config))
    .map(renderFunction).join("");
  return `\
%nodefaultctor <#name>;
class ${cls.name}${base} {
	public:
    /* Constructors */
    ${constructors}
    /* Member functions */
    ${functions}
};
`
}

function renderTypedef(td) {

}

function renderEnum(en) {
  var values = en.values.map(function(v) {
    return `  ${v[0]} = ${v[1]}`;
  }).join("\n");
  return `enum ${en.name} {\n${values};\n}`
}

module.exports = function(moduleName) {
  var tree = loadTree(`data/tree/${moduleName}.json`);
  var config = loadConfig(`data/config/${moduleName}.json`)
  var basePath = `build/swig/${moduleName}`

  function writeFile(dest, src) {
    var fullPath = path.join(basePath, dest);
    mkdirp.sync(path.dirname(fullPath));
    fs.writeFileSync(fullPath, src);
  }

  this.renderClasses = function(moduleName) {
    var classes = tree.classes.filter(ignoreClass(config));

    classes.forEach(function(cls) {
      var src = renderClass(cls, config);
      writeFile(`/classes/${cls.name}.i`, src)
    });
  }

  this.renderHeaders = function(moduleName) {
    var src = tree.headers.map(function(header) {
      return `#include<${header}>`;
    }).join("\n")
    src = `%{\n${src}\n%}`
    writeFile("headers.i", src)
  }

  this.renderRenames = function(moduleName) {
    var renames = []
    config.data.rename.forEach(function(rename) {
      var target = rename.name;
      if (rename.parent)
        target = `${rename.parent}::${target}`;
      renames.push(`%rename(${rename.newName}) ${target};`)
    });
    var src = renames.join("\n");
    writeFile("renames.i", src)
  }

  this.renderModule = function(moduleName) {
    var dependencies = tree.dependencies.map(function(dep) {
      return `%import ../${dep}/module.i;\n%include ../${dep}/headers.i`
    }).join("\n");
    var custom = "";
    if (fs.exists(`src/swig//custom/${moduleName}.i`))
      custom = `\n%include ../custom/${moduleName}.i\n`;

    var typedefs = tree.typedefs
      .filter(ignoreClass(config))
      .map(renderTypedef)
      .join("\n")
    if (typedefs) typedefs += "\n"

    var enums = tree.enums
      .filter(ignoreClass(config))
      .map(renderEnum)
      .join("\n")
    if (enums) enums += "\n"

    var classes = tree.classes
      .filter(ignoreClass(config))
      .map(function(cls) {
        return `%include classes/${cls.name}.i`
      })
      .join("\n");
    if (classes) classes += "\n"


    src = `\
// Module ${moduleName}
%include ../common/ModuleHeader.i
%include headers.i

//dependencies
${dependencies}

%include renames.i
${custom}
%module (package="OCC") ${moduleName}
${typedefs}
${enums}
${classes}
`
    writeFile("module.i", src)
  }
}
