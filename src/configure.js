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


function registerDirectives(data, conf) {
  conf = conf || {}
  directives
    .filter((dir) => dir.module.configure !== undefined)
    .forEach((dir) => {

      if (!data.hasOwnProperty(dir.name))
        data[dir.name] = [];

      var methods = dir.module.configure;
      if (typeof methods === 'function') {
        methods = {};
        methods[dir.name] = dir.module.configure;
      }

      Object.keys(methods)
        .forEach((m) => {
          conf[m] = function() {
            var res = methods[m].apply(null, arguments);
            ////console.log("res", res, arrify(res));
            // var args = [].slice.call(arguments, 1);
            data[dir.name] = data[dir.name].concat(arrify(res));
          };
        });
    });

  return conf;
}

function configure(moduleName, data, moduleConf) {

  data = data || {};
  var confPath = `${settings.paths.wrapper}/modules/${moduleName}.js`;
  var beforePath = `${settings.paths.wrapper}/before.js`;
  var afterPath = `${settings.paths.wrapper}/after.js`;


  // register directives
  var conf = registerDirectives(data);


  var q = query.loadModule(moduleName, data);

  // custom module conf function (mostly for testing)
  if (moduleConf) {
    moduleConf(moduleName, conf, q);
    return data;
  }
  //console.log(before.beforePath)
  if (fs.existsSync(beforePath)) {
    const commonConf = require(beforePath);
    commonConf(moduleName, conf, q);
  }

  if (fs.existsSync(confPath)) {
    moduleConf = require(confPath);
    moduleConf(moduleName, conf, q);
  }


  if (fs.existsSync(afterPath)) {
    const debugConf = require(afterPath);
    debugConf(moduleName, conf, q);
  }


  return data;
}

function process(config, directive, objects) {



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

function processConfig(moduleName) {
  const data = JSON.parse(fs.readFileSync(`${settings.paths.headerCacheDest}/${moduleName}.json`));
  const config = JSON.parse(fs.readFileSync(`${settings.paths.build}/config/${moduleName}.json`));
  directives
    .filter((dir) => dir.module.process !== undefined)
    .forEach((dir) => {

      data.classes = process(config, dir, data.classes);
      data.classes.forEach((cls) => {

        cls.constructors = process(config, dir, cls.constructors);
        cls.members = process(config, dir, cls.members);
      });
    });
  fs.writeFileSync(`${settings.paths.build}/config/${moduleName}_wrap.json`,
    JSON.stringify(data, null, 2));
}

function modName(name) {
  var matchRes = name.match(/(?:Handle_)*(\w+?)_\w+/)
  if (!matchRes) return name;
  return matchRes[1];
}

function unique(t, index, array) {
  return array.indexOf(t) === index;
}

function configureMissing() {
  var reader = depend.reader();

  var modules = glob.sync(`${settings.paths.wrapper}/modules/*.js`)
    .map((file) =>
      path.basename(file)
      .replace('.js', '')
    );
  var classes = modules.map((mod) => {
    var q = query.loadModule(mod);
    return q.classes.filter(q.include);
  }).reduce((a, b) => a.concat(b), []);

  var missing = reader.missingClasses(classes.map((cls) => cls.name));
  console.log("MISSING==============")
  console.log(missing);
  console.log("MISSING==============")
  missing
    .map(modName)
    .filter(unique)
    .forEach((mod) => {
      var file = `${settings.paths.build}/config/${mod}.json`;

      var data = {};


      if (fs.existsSync(file)) {
        data = JSON.parse(fs.readFileSync(file));
      } else {
        registerDirectives(data);
      }


      missing.filter((cls) => modName(cls) === mod)
        .forEach((cls) => {
          console.log("add", mod, cls)
          data.ignore.push({ name: cls, enabled: false, auto: true });
        });
      console.log(file)
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
    });
}

function write(moduleName, data) {
  const dest = `${settings.paths.build}/config/${moduleName}.json`;
  mkdirp.sync(path.dirname(dest));

  var src = JSON.stringify(data, null, 2);
  return fs.writeFileSync(dest, src);
}

function clean(moduleName) {
  const cmd = `rm -rf ${settings.paths.build}/config/`;
  execSync(cmd);
}
module.exports = configure;
module.exports.configureMissing = configureMissing;
module.exports.write = write;
module.exports.clean = clean;
module.exports.processConfig = processConfig;
