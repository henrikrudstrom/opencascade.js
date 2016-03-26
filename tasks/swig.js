var gulp = require('gulp');
var runSequence = require('run-sequence');
var rename = require("gulp-rename");
var run = require('gulp-run');
var through = require('through2');

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;

var configs = require("./lib/config.js")
var trees = require("./lib/tree.js")
var render = require("./lib/render.js")
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function readDependencies(path, done){
  var tree = trees.loadFromPath(path);
  args = tree.types("*").members("*").args("*").map(function(arg){
    return arg.type.match(/(\w+?)_\w+/)[1]
  })
  ret = tree.types("*").members("*").map(function(m){
    if(!m.return_type) return;
    return m.return_type.match(/(\w+?)_\w+/)[1]
  })
  var types = args.concat(ret).filter(onlyUnique).filter(function(m){
    if(!m) return false;
    if(m === "Handle") return false;
    return true;
  });
  tree.dependencies = types;
  tree.save();
}
gulp.task('read-dependencies', function(done){
  var deps = readDependencies("data/tree/gp.json", done);
});

gulp.task('read-headers', function () {
  var module = "gp"
  var dest = "data/tree/"
  mkdirp.sync(dest)
  run(`python scripts/write_headers.py ${module} ${dest}${module}.json`).exec()
});

gulp.task('configure-wrapper', function(){
  var config = configs("./data/tree/gp.json");
  var func = require("../src/wrap/modules/gp.js");
  var conf = config.configure(func);
  mkdirp.sync("data/config/")
  fs.writeFileSync("data/config/gp.json", JSON.stringify(conf, null, 2));
});

gulp.task("render", function(){
  render.renderClasses("gp");
  render.renderRenames("gp");
  render.renderHeaders("gp");
});
