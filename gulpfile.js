var gulp = require('gulp');
// var concat = require('gulp-concat');
// var rename = require('gulp-rename');
// var changed = require('gulp-changed');
var path = require('path');
var shell = require('gulp-shell')
var through     = require('through2');
var fs = require('fs');
var mkdirp = require('mkdirp');

// var cmd = "../../swig/swig -javascript -O -w302,401,314,509,512 -DCSFDB -DHAVE_CONFIG_H -DOCC_CONVERT_SIGNALS -node -c++
// -outdir Unix/x86_64-MinSizeRel-64 -c++ -I/home/henrik/Development/pythonocc-core -I/usr/include/node
// -I/home/henrik/OCE/include/oce -o Unix/x86_64-MinSizeRel-64/gpJAVASCRIPT_wrap.cxx /home/henrik/Development/pythonocc-core/src/SWIG_files/wrapper/gp.i"


var swig = "swig"
var flags = "-javascript -node -c++"
var other_flags = "-w302,401,314,509,512 -DCSFDB -DHAVE_CONFIG_H -DOCC_CONVERT_SIGNALS" //TODO:
var include = ["-I/usr/include/node", "-I/home/henrik/OCE/include/oce"]
var swig_output = "build/swig"

function swigFile(file, encoding, done){
  var cmd = swig + " " + flags + " " + other_flags
  cmd += " " + include.join(" ")
  cmd += " -o " + path.join(swig_output, path.basename(file.path).replace(".i", "_wrap.cxx"))
  cmd += " " + file.path
  console.log(cmd);
  var exec = require('child_process').exec;
  exec(cmd, function(error, stdout, stderr) {
    if(error){
      console.log(error)
      console.log(stderr)
      done()
    }
    console.log(stdout)
    done();
  });
}



gulp.task('init', function(){
  mkdirp("build/swig")
})

gulp.task('swig', ['init'], function () {
  return gulp.src('src/swig/occ/*.i', {read: false})
    .pipe(through.obj(swigFile))
});
