const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const glob = require('glob');
const yargs = require('yargs');
const arrify = require('arrify');
const execSync = require('child_process').execSync;
var directives = require('./directives.js');

const settings = require('./settings.js');
const query = require('./query.js');
const depend = require('./depend.js');

function processDirective(config, directive, objects) {
  return objects.map((obj) => {
    // function getTag(name, o) {
    //   if (obj.parent) return query.getTag(config, name, obj.parent.name, obj.name);
    //   return query.getTag(config, name, o);
    // }
    var tag = query.getTag(config, directive.name, obj.name);

    // console.log(obj.name, tag)
    // if (!tag) return obj;
    return directive.module.process(obj, tag);
  }).filter((cls) => cls !== null);
}

function createTypeDictionary(modules) {
  var toWrapped = {};
  var toSource = {}
  Object.keys(modules).forEach((mod) => {
    console.log("dict", mod, modules[mod].name);
    modules[mod].classes.forEach((cls) => {
      var oldName = cls.oldName;
      if (cls.oldName) {
        toWrapped[oldName] = cls.name;
        toSource[cls.name] = oldName;
      }
    });
  });
  return { toWrapped, toSource };
}

function dictionary(data) {
  this.wrapped = function(name) {
    if (data.toWrapped.hasOwnProperty(name)){
      console.log("rename", name, data.toWrapped[name])
      return data.toWrapped[name];
    }
    return name;
  }


  this.source = function(name) {
    if (data.toSource.hasOwnProperty(name)){
      return data.toSource[name];
    }

    return name;
  }

  this.add = function add(source, wrapped){
    data.toWrapped[source] = wrapped;
    data.toSource[wrapped] = source;
  }
  return this;
}




function filterTypeName(ret) {
  ret = ret.replace(/&|\*/, '');
  ret = ret.replace('const', '');
  ret = ret.trim();
  return ret;
}




function processTypes(data, config) {
  function processTypeDirective(directive, objects) {
    return objects.map((obj) => {
      var tag = query.getTag(config, directive.name, obj.name);
      obj = directive.module.process(obj, tag);
      return obj;
    }).filter((cls) => cls !== null);
  }

  directives
    .filter((dir) => dir.module.process !== undefined)
    .forEach((dir) => {
      data.classes = processTypeDirective(dir, data.classes);
      data.typedefs = processTypeDirective(dir, data.typedefs);
      data.enums = processTypeDirective(dir, data.enums);
    })
}

function processMembers(dict, data, config) {
  function rename(objects){
    return objects.forEach((obj) => {
      //obj.parent = dict.wrapped(obj.parent);
      //console.log(obj.name, obj.returnType, dict.wrapped(obj.returnType))
      obj.returnType = dict.wrapped(filterTypeName(obj.returnType));
      console.log("args", obj.arguments)
      //obj.arguments = obj.arguments.map((arg) => arg.type).map(dict.wrapped);
      return obj;
    });
  }

  function processMemberDirective(directive, objects) {
    return objects.map((obj) => {
      var tag = query.getTag(config, directive.name, obj.parent, obj.name);
      obj = directive.module.process(obj, tag);
      return obj;
    }).filter((cls) => cls !== null);
  }


  directives
    .filter((dir) => dir.module.process !== undefined)
    .forEach((dir) => {
      data.classes.forEach((cls) => {
        console.log("class", cls.name, cls)
        cls.constructors = rename(processMemberDirective(dir, cls.constructors));

        cls.members = rename(processMemberDirective(dir, cls.members));
      });
    });
}



function writeModuleDefinition() {
  var modules = {};
  var configs = {};
  settings.buildModules.forEach((mod) => {
    console.log("write class", mod)
    modules[mod] = JSON.parse(
      fs.readFileSync(`${settings.paths.headerCacheDest}/${mod}.json`)
    );
    configs[mod] = JSON.parse(
      fs.readFileSync(`${settings.paths.build}/config/${mod}.json`)
    );
    processTypes(modules[mod], configs[mod]);
  });
  var dictdata = createTypeDictionary(modules);
  var dict = dictionary(dictdata);
  dict.add("Standard_Real", "double")
  dict.add("Standard_Boolean", "bool")
  dict.add("Standard_Integer", "int")
  var outpath = `${settings.paths.build}/data/`;
  mkdirp(outpath);
  settings.buildModules.forEach((mod) => {
    processMembers(dict, modules[mod], configs[mod]);

    fs.writeFileSync(outpath + mod + '.json', JSON.stringify(modules[mod], null, 2));
  });
  fs.writeFileSync(outpath + 'dictionary.json', JSON.stringify(dictdata, null, 2));
}

module.exports.writeModules = writeModuleDefinition;
