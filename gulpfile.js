var gulp = require('gulp');
var runSequence = require('run-sequence');
// var concat = require('gulp-concat');
// var rename = require('gulp-rename');
// var changed = require('gulp-changed');
var path = require('path');
var shell = require('gulp-shell')
var through     = require('through2');
var fs = require('fs');
var mkdirp = require('mkdirp');

const jasmine = require('gulp-jasmine');

// var cmd = "../../swig/swig -javascript -O -w302,401,314,509,512 -DCSFDB -DHAVE_CONFIG_H -DOCC_CONVERT_SIGNALS -node -c++
// -outdir Unix/x86_64-MinSizeRel-64 -c++ -I/home/henrik/Development/pythonocc-core -I/usr/include/node
// -I/home/henrik/OCE/include/oce -o Unix/x86_64-MinSizeRel-64/gpJAVASCRIPT_wrap.cxx /home/henrik/Development/pythonocc-core/src/SWIG_files/wrapper/gp.i"


var swig = "swig"
var flags = "-javascript -node -c++"
var other_flags = "-w302,401,314,509,512 -DCSFDB -DHAVE_CONFIG_H -DOCC_CONVERT_SIGNALS" //TODO:
var include = ["-I/usr/include/node", "-I/home/henrik/OCE/include/oce"]
var swig_output = "build-swig"


function execCmd(cmd, done){
  var exec = require('child_process').exec;
  exec(cmd, function(error, stdout, stderr) {
    if(error){
      console.log(stderr)
      throw new Error(error.toString())
      done()
    }
    console.log(stdout)
    done();
  });
}

function swigFile(file, done){
  var cmd = swig + " " + flags + " " + other_flags
  cmd += " " + include.join(" ")
  cmd += " -o " + path.join(swig_output, path.basename(file).replace(".i", "_wrap.cxx"))
  cmd += " " + file
  console.log(cmd);
  execCmd(cmd, done);
}

function pythonTask(task, args, done){
  var cmd = "python "+task+" "+args.join(" ");
  console.log(cmd)
  execCmd(cmd, done);
}




gulp.task('init', function(){
  mkdirp(swig_output)
})
var modules = ["gp", "Geom2d", "Standard"]


gulp.task('load-data', function(done){
  pythonTask("scripts/load-data.py", ["generator/src/", "config"], function(){
    done()
  })
})

modules.forEach(function(moduleName){
  gulp.task('swig-generate:'+moduleName, function(done){
    pythonTask("scripts/generate_swig.py", [moduleName, "src/swig/gen"], done)
  });

  gulp.task('swig-build:'+moduleName, function (done) {
    swigFile('src/swig/wrap/'+moduleName+'.i', done);
  });
  gulp.task('swig:'+moduleName, function(done){
     runSequence('swig-generate:'+moduleName, 'swig-build:'+moduleName, done);
   });
});

gulp.task('swig-generate', modules.map(function(module){ return 'swig-generate:'+module}));
gulp.task('swig-build', modules.map(function(module){ return 'swig-build:'+module}));
gulp.task('swig', function(done){
  runSequence('swig-generate', 'swig-build', done);
});

gulp.task('gyp-clean', function (done) {
  execCmd('node-gyp clean', done)
});

gulp.task('gyp-configure', ['gyp-clean'], function (done) {
  execCmd('node-gyp configure', done)
});

gulp.task('gyp-build', ['gyp-configure'], function (done) {
  execCmd('node-gyp build', done)
});

gulp.task('gyp-rebuild', ['gyp-configure', 'swig'], function (done) {
  execCmd('node-gyp build', done)
});

gulp.task('build', ['gyp-build']);


gulp.task('test', function(){
	gulp.src('spec/basicSpec.js').pipe(jasmine())
});
