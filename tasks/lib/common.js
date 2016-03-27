'use-strict';
var runSequence = require('run-sequence');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var hashFiles = require('hash-files');

var argv = require('yargs').argv;

global.SETTINGS = {
  oce_include: '/home/henrik/OCE/include/oce',
  force: argv.force,
  modules: JSON.parse(fs.readFileSync('config/modules.json')),
  depends: JSON.parse(fs.readFileSync('config/depends.json'))
};

module.exports.match = function(exp, name) {
  var exp = new RegExp('^' + exp.replace('*', '.*') + '$');
  return exp.test(name);
};

module.exports.runIfChanged = function(files, name, cb) {
  var hashPath = `tmp/hash/${name}.hash`
  var hashValue = undefined;

  function hasChanged(hasChanged) {
    var currentHash;
    if (SETTINGS.force) return hasChanged(false, true);
    if (!files.every(fs.existsSync)) return hasChanged(false, true);

    if (!fs.existsSync(hashPath)) return hasChanged(false, true);
    currentHash = fs.readFileSync(hashPath);
    hashFiles({
      files: files,
      noGlob: true
    }, function(error, hash) {
      if (error) return hasChanged(error, false);
      hashValue = hash;
      if (hash.toString() !== currentHash.toString()) {
        hasChanged(false, true);
      } else {
        hasChanged(false, false);
      }
      return null;
    });
    return null;
  }

  function runTaskAndHash() {
    return runSequence(name, function(error) {
      if (error) return cb(error);
      mkdirp.sync('tmp/hash');
      fs.writeFile(hashPath, hashValue, function(error) {
        if (error) return cb(error);
        return cb();
      });
      return null;
    });
  }

  hasChanged(function(error, run) {
    if (error) return cb(error);
    if (!run) {
      return cb();
    }
    runTaskAndHash()
  });
}
