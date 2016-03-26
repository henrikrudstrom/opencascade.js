var fs = require("fs");
var mkdirp = require('mkdirp');
var path = require('path');
var data = JSON.parse(fs.readFileSync("config/gp_proc.json"))

function render(template, data) {
  template = template.toString()
  console.log(data)
  for (var key in data) {

    template = template.replace(new RegExp("<#" + key + ">", "g"), data[key])
  }
  return template;
}

t_class =
  `%nodefaultctor <#name>;

class <#name><#base_class>{
	public:
    /* Constructors */
    <#constructors>
    /* Member functions */
    <#functions>
};
`


t_rename = "%rename(${new_name}) ${name};"

t_includes =
  `/* includes for module: <#name> */
%{
<#includes>
%}
`


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
    ${stat}${func.returnType + " "}${func.name}${cons}(${args});
    `
}

function isClass(name) {
  return function(member) {
    return member.cls !== name;
  }
}

function renderSwigClass(cls, config) {
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

function renderTypedef(td){
  
}

function renderEnum(enum){
  var values = enum.values.map(function(v){
    return `  ${v[0]} = ${v[1]}`;
  }).join("\n");
  return `enum ${enum.name} {
    ${values};
  }`
}

function ignoreMember(cls, config) {
  return function(obj) {
    return !config.ignore.some(function(ign) {
      if (!ign.parent) return false;
      if (cls.name != ign.parent) return false;
      return obj.name === ign.name;
    });
  }
}
function ignoreClass(config) {

  return function(obj) {
    var ignore = !config.ignore.some(function(ign) {
      return obj.name === ign.name;
    });
    if(!ignore) console.log("IGNORE", obj.name)
    return ignore;
  }

}



module.exports.renderClasses = function(moduleName) {
  var tree = require("./tree.js").loadFromPath(`data/tree/${moduleName}.json`);
  var config = JSON.parse(fs.readFileSync(`data/config/${moduleName}.json`));

  console.log("render" + module, tree.classes.length)
  var classes = tree.classes.filter(ignoreClass(config));
  console.log(classes.length)
  classes.forEach(function(cls) {
    var src = renderSwigClass(cls, config);
    var file = `build/swig/${moduleName}/classes/${cls.name}.i`;
    mkdirp.sync(path.dirname(file));
    fs.writeFileSync(file, src);
  });
}

module.exports.renderHeaders = function(moduleName) {
  var tree = require("./tree.js").loadFromPath(`data/tree/${moduleName}.json`);
  console.log("HEADERSS")
  console.log(tree.headers)
  var src = tree.headers.map(function(header){
    return `#include<${header}>`;
  }).join("\n")
  src = `%{\n${src}\n%}`
  var file = `build/swig/${moduleName}/headers.i`;
  mkdirp.sync(path.dirname(file));
  fs.writeFileSync(file, src);
}

module.exports.renderRenames = function(moduleName) {
  var config = JSON.parse(fs.readFileSync(`data/config/${moduleName}.json`));
  var renames = []

  console.log(config.data)
  config.rename.forEach(function(rename) {
    var target = rename.name;
    if (rename.parent)
      target = `${rename.parent}::${target}`;
    renames.push(`%rename(${rename.newName}) ${target};`)
  });
  var src = renames.join("\n");
  var file = `build/swig/${moduleName}/renames.i`;
  mkdirp.sync(path.dirname(file));
  fs.writeFileSync(file, src);
}

module.exports.renderModule = function(moduleName) {
  var tree = require("./tree.js").loadFromPath(`data/tree/${moduleName}.json`);
  var config = JSON.parse(fs.readFileSync(`data/config/${moduleName}.json`));

  var dependencies = tree.dependencies.map(function(dep){
    return `%import ${dep}.i;\n%include ../${dep}/headers.i`
  }).join("\n");
  var custom = "";
  if(fs.exists(`src/swig//custom/${moduleName}.i`))
    custom = `\n%include ../custom/${moduleName}.i\n`;

  var typedefs = tree.typedefs
    .filter(ignoreClass(config))
    .map(renderTypedef)
    .join("\n")

  var enums = tree.enums
    .filter(ignoreClass(config))
    .map(renderEnum)
    .join("\n")

  var classes = tree.classes
    .filter(ignoreClass(config))
    .map(function(cls){ return `%include classes/${cls.name}.i`})
    .join("\n");


  src = `
  %include ../common/ModuleHeader.i
  %include ../gen/${moduleName}/headers.i

  ${dependencies}

  %include ../gen/${moduleName}/renames.i
  ${custom}
  %module (package="OCC") ${moduleName}
  ${typedefs}
  ${enums}
  ${classes}
  `

}
