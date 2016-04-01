const fs = require('fs');
const path = require('path');
const glob = require('glob');
const yargs = require('yargs');
const arrify = require('arrify');
var directives = require('./directives.js');

const settings = require('./settings.js');
const query = require('./query.js');
const depend = require('./depend.js');
const paths = settings.paths;


function registerDirectives(data, conf) {
  conf = conf || {}
  directives
    .filter((dir) => dir.module.configure !== undefined)
    .forEach((dir) => {
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

  if (!fs.existsSync(`${settings.paths.wrapper}/modules/${moduleName}.js`))
    return data;
  // register directives
  var conf = registerDirectives(data);


  var q = query.loadModule(moduleName, data);
  // custom module conf function (mostly for testing)
  if (moduleConf) {
    moduleConf(moduleName, conf, q);
    return data;
  }


  const commonConf = require(`${settings.paths.wrapper}/before.js`);
  commonConf(moduleName, conf, q);

  moduleConf = require(`./wrapper/modules/${moduleName}.js`);
  moduleConf(moduleName, conf, q);


  //if (yargs.argv.debug && fs.existsSync(`${settings.paths.wrapper}/debug.js`)) {
  const debugConf = require(`${settings.paths.wrapper}/after.js`);
  debugConf(moduleName, conf, q);
  //}

  return data;
}

function modName(name) {
  var matchRes = name.match(/(?:Handle_)*(\w+?)_\w+/)
  if (!matchRes) return name;
  return matchRes[1];
}

function unique(t, index, array) {
  return array.indexOf(t) === index
}

function configureMissing() {

  var reader = depend.reader();
  var modules = glob.sync(`src/wrapper/modules/*.js`)
    .map((file) =>
      path.basename(file)
      .replace('.js', '')
    );
  var classes = modules.map((mod) => {
    var q = query.loadModule(mod);
    return q.classes.filter(q.include);
  }).reduce((a, b) => a.concat(b));
  var missing = reader.missingClasses(classes.map((cls) => cls.name));
  missing
    .map(modName)
    .filter(unique)
    .forEach((mod) => {
      var file = `${settings.paths.build}/config/${mod}.json`;
      var data = {};
      if (fs.exists(file))
        data = JSON.parse(fs.readFileSync(file));
      else
        registerDirectives(data);
      missing.filter((cls) => modName(cls) === mod)
        .forEach((cls) => {
          data.ignore.push({ name: cls, enabled: false, auto: true });
        });
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
    });
};

function postConfigure(moduleName) {
  var q = query.loadModule(moduleName);
  var data = q.config;

  directives
    .filter((dir) => dir.module.postConfigure !== undefined)
    .forEach((dir) => {
      var res = dir.module.postConfigure(moduleName, q);
      data[dir.name] = data[dir.name].concat(arrify(res))
    });
  //console.log("=============")
  ////console.log(data)
  //console.log("=============")
  return data;
}

module.exports = configure;
module.exports.post = postConfigure;
module.exports.configureMissing = configureMissing;
