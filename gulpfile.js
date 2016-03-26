var gulp = require('gulp');
var runSequence = require('run-sequence');
// var concat = require('gulp-concat');
// var rename = require('gulp-rename');
// var changed = require('gulp-changed');
var path = require('path');
var shell = require('gulp-shell')
var through = require('through2');
var fs = require('fs');
var mkdirp = require('mkdirp');
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
const jasmine = require('gulp-jasmine');

// var cmd = "../../swig/swig -javascript -O -w302,401,314,509,512 -DCSFDB -DHAVE_CONFIG_H -DOCC_CONVERT_SIGNALS -node -c++
// -outdir Unix/x86_64-MinSizeRel-64 -c++ -I/home/henrik/Development/pythonocc-core -I/usr/include/node
// -I/home/henrik/OCE/include/oce -o Unix/x86_64-MinSizeRel-64/gpJAVASCRIPT_wrap.cxx /home/henrik/Development/pythonocc-core/src/SWIG_files/wrapper/gp.i"


var swig = "swig"
var flags = "-javascript -node -c++ -DSWIG_TYPE_TABLE=occ.js" //var Geom = require("../lib/occ/Geom2d.node");
var other_flags = "-w302,401,314,509,512 -DCSFDB -DHAVE_CONFIG_H -DOCC_CONVERT_SIGNALS" //TODO:
var include = ["-I/usr/include/node", "-I/home/henrik/OCE/include/oce"]
var swig_output = "build-swig"




var argv = require('yargs').argv;
console.log(argv)
var force = argv.force




function execCmd(cmd, cwd, done) {
  options = {}
  if (typeof cwd === "function")
    done = cwd
  else
    options.cwd = cwd
  console.log("START: " + cmd)
  exec(cmd, options, function(error, stdout, stderr) {
    if (error) {
      console.log("ERROR:" + error)
      //throw new Error(error.toString())
      done(false)
      return
    }
    console.log("DONE: " + cmd)
    console.log(stdout)
    done();
  });
}

function swigFile(file, done) {
  var cmd = swig + " " + flags + " " + other_flags
  cmd += " " + include.join(" ")
  cmd += " -o " + path.join(swig_output, path.basename(file).replace(".i", "_wrap.cxx"))
  cmd += " " + file
  execCmd(cmd, done);
}

function pythonTask(task, args, done) {
  var cmd = "python " + task + " " + args.join(" ");
  execCmd(cmd, done);
}

function buildConfiguration(moduleName) {
  var gyp = fs.readFileSync("binding_base.gyp", 'utf8');
  var base = JSON.parse(gyp);
  var target = base.targets[0];
  target.sources = ['../../build-swig/' + moduleName + '_wrap.cxx'];
  target.target_name = moduleName;
  var dest = path.join("build", moduleName)
  mkdirp.sync(dest)
  var gyp = JSON.stringify(base, null, ' ');
  fs.writeFileSync(path.join(dest, "binding.gyp"), gyp);
}

function hashFile(file, done) {
  var fs = require('fs');
  var crypto = require('crypto');
  console.log(file)
    // the file you want to get the hash
  var src = fs.readFileSync(file);
  var hash = crypto.createHash('sha1');
  hash.setEncoding('hex');
  hash.write(src)
  hash.end()
  return hash.read()
}




gulp.task('init', function() {
  mkdirp(swig_output)
})
var modules = ["gp", "Geom2d", "GCE2d", "Standard"]


gulp.task('load-data', function(done) {
  pythonTask("scripts/load-data.py", ["generator/src/", "config"], function() {
    done()
  })
})

modules.forEach(function(moduleName) {
  function task_name(name) {
    if (Array.isArray(name)) {
      return name.map(task_name);
    }
    return name + ":" + moduleName
  }
  var build_output = path.join("build", moduleName, "build/Release")
  var wrapper = path.join("src/swig/wrap/", moduleName + ".i")
  var wrap_cxx = path.join(swig_output, moduleName + "_wrap.cxx")
  var hash_swig = path.join(swig_output, "hash", moduleName + ".hash")
  var hash_compiled = path.join("build", "hash", moduleName + ".hash")
  var target_path = "lib/occ"
  var target_file = path.join(target_path, moduleName + ".node")

  //SWIG
  gulp.task(task_name('swig-generate'), function(done) {
    pythonTask("scripts/generate_swig.py", [moduleName, "src/swig/gen"], done)
  });

  gulp.task(task_name('swig-build'), function(done) {
    if (fs.exists(wrap_cxx))
      execSync("rm " + wrap_cxx);

    swigFile(wrapper, function() {
      var hash = hashFile(wrap_cxx)
      mkdirp.sync(swig_output + "/hash")
      fs.writeFile(hash_swig, hash, done)
    });
  });

  gulp.task(task_name('swig'), function(done) {
    runSequence(task_name('swig-generate'), task_name('swig-build'), done);
  });



  //GYP
  var buildPath = path.join("build", moduleName)

  gulp.task(task_name('gyp-clean'), function(done) {
    if (!fs.exists(buildPath)) done()
    else execCmd('node-gyp clean', buildPath, done)
  });

  gulp.task(task_name('gyp-configure'), function(done) {
    buildConfiguration(moduleName)
    execCmd('node-gyp configure', buildPath, function(){
      console.log("Configure done")
      done()
    });
  });

  gulp.task(task_name('gyp-build'), function(done) {
    execCmd('node-gyp build', buildPath, done);
  });

  gulp.task(task_name('gyp-dist'), function(done) {
    mkdirp.sync("lib/occ")
    execCmd("cp " + build_output + "/" + moduleName + ".node " + target_path, done)
  });

  gulp.task(task_name('build'), [task_name('swig')], function(done) {

  });

  function shouldCompile() {
    if (force) return true;

    if (!fs.existsSync(target_file)) return true;

    if (!fs.existsSync(hash_swig)) return true;
    var src_hash = fs.readFileSync(hash_swig);

    if (!fs.existsSync(hash_compiled)) return true;
    var compiled_hash = fs.readFileSync(hash_compiled);

    return src_hash.toString() !== compiled_hash.toString()
  }

  gulp.task(task_name('build'), [task_name('swig-build')], function(done) {
    if (!shouldCompile()) {
      console.log(moduleName + " was already compiled with current source.")
      return done()
    }
    //delete hash before compile
    if (fs.exists(hash_compiled))
      execSync("rm " + compiled_hash)

    runSequence(['gyp-clean', 'gyp-configure', 'gyp-build'].map(task_name), function(error) {
      if (error) {
        console.log("Error compiling " + moduleName);
        done(false);
        return;
      }
      gulp.start(task_name("gyp-dist"), function(){
        //copy hash to compile directory on successful compile
        mkdirp.sync(path.dirname(hash_compiled))
        execSync("cp " + hash_swig + " " + hash_compiled)
        console.log("Successfully compiled")
        done()
      })

    })

  });


  gulp.task(task_name('test'), function() {
    gulp.src('spec/' + moduleName + 'Spec.js').pipe(jasmine())
  });



});

function module_task_name(taskName) {
  return function(module) {
    return taskName + ":" + module;
  }
}

gulp.task('swig-generate', modules.map(module_task_name("swig-generate")));
gulp.task('swig-build', modules.map(module_task_name("swig-build")));
gulp.task('swig', modules.map(module_task_name("swig")));
gulp.task('build', modules.map(module_task_name("build")));

gulp.task('swig', function(done) {
  runSequence('swig-generate', 'swig-build', done);
});




// gulp.task('gyp-clean', function (done) {
//   execCmd('node-gyp clean', done)
// });
//
// gulp.task('gyp-configure', ['gyp-clean'], function (done) {
//   execCmd('node-gyp configure', done)
// });
//
// gulp.task('gyp-build', ['gyp-configure'], function (done) {
//   execCmd('node-gyp build', done)
// });
//
// gulp.task('gyp-rebuild', ['gyp-configure', 'swig'], function (done) {
//   execCmd('node-gyp build', done)
// });
//
// gulp.task('build', ['gyp-build']);

gulp.task('test-gen', function() {
  gulp.src('spec/querySpec.js')
    .pipe(jasmine())
    .on('error', function(e) { console.log(e.err.stack); });
});


gulp.task('test', function() {
  gulp.src('spec/basicSpec.js').pipe(jasmine())
});




var requireDir = require('require-dir');
var dir = requireDir('./tasks');

gulp.task('testtest', function() {
  gulp.src('config/gp.json')
    .pipe(testpipe)
    .on('error', function(e) { throw e; });
});
