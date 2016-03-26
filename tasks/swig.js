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

var loadConfig = require("./lib/config.js")
var loadTree = require("./lib/tree.js")
var loadRenderer = require("./lib/render.js")
var common = require("./lib/common.js");

var swig = "swig"
var flags = "-javascript -node -c++ -DSWIG_TYPE_TABLE=occ.js" //var Geom = require("../lib/occ/Geom2d.node");
var other_flags = "-w302,401,314,509,512 -DCSFDB -DHAVE_CONFIG_H -DOCC_CONVERT_SIGNALS" //TODO:
var include = ["-I/usr/include/node", `-I${SETTINGS.oce_include}`]
var swig_output = "build-swig"




SETTINGS.modules.forEach(function(moduleName){
  function mTask(name) {
    if (Array.isArray(name)) {
      return name.map(task_name);
    }
    return name + ":" + moduleName
  }
  gulp.task(mTask('parse-dependencies'), function(done){
    var tree = loadTree(`data/tree/${moduleName}.json`);
    var deps = {}
    var depFile = "data/dependencies.json";
    if(fs.existsSync(depFile))
      deps = JSON.parse(fs.readFileSync(depFile));

    deps[moduleName] = tree.readDependencies(moduleName);
    fs.writeFile(depFile, JSON.stringify(deps), done);
  });

  gulp.task(mTask('parse-headers'), function () {
    mkdirp.sync('data/tree')
    return run(`python scripts/write_headers.py ${moduleName} data/tree/${moduleName}.json`).exec()
  });

  gulp.task(mTask("parse"), function(){
    return runSequence(mTask('parse-headers'), mTask('parse-dependencies'))
  });
})







gulp.task('configure-wrapper', function(){
  var config = loadConfig("./data/config/gp.json");
  var tree = loadTree("./data/tree/gp.json");
  var func = require("../src/wrap/modules/gp.js");
  var conf = config.configure(func, tree);
  mkdirp.sync("data/config/")
  fs.writeFileSync("data/config/gp.json", JSON.stringify(conf, null, 2));
});

gulp.task("render", function(){
  var r = new loadRenderer("gp")
  r.renderClasses();
  r.renderRenames();
  r.renderHeaders();
  r.renderModule();
});

gulp.task('swig', function () {
  var moduleName = "gp"
  var output = path.join(`build/cxx/${moduleName}.cxx`)
  var input = path.join(`build/swig/${moduleName}/module.i`)
  var includes = include.join(" ");
  var cmd = `${swig} ${flags} ${other_flags} ${includes} -o ${output} ${input}`
  return run(cmd).exec();
});




gulp.task('task1', function (done) {
  fs.writeFile('test.txt', 200, done)
});

gulp.task('task2', ['task1'],function (done) {
  common.runIfChanged(['test.txt'], 'task3', done);
});

gulp.task('task3', function () {
  return run("echo task3").exec();
});
