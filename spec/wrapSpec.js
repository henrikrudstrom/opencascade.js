var fs = require('fs');
var gp = require('../dist/lib/gp.node');
var query = require('../src/query.js');
var settings = require('../src/settings.js');
//var Geom2d = require('../build/Release/Geom2d.node');
function typeOf(obj) {
  return obj.constructor.name.replace("_exports_", "");
}


function create(mod, cls){
  var res = "";

}

function testClass(mod, cls) {

  it('it can be loaded' + cls.name, function() {
    

  });
}



settings.modules.forEach(function(moduleName) {
  var modPath = `${settings.paths.dist}/lib/${moduleName}.node`
  if (!fs.existsSync(modPath))
    return;
  var q = query.loadModule(moduleName);

  var classes = q.classes.filter(q.include);
  if (classes.length < 1) return;
  describe('auto test ' + moduleName, function() {

    q.classes.filter(q.include).forEach(function(cls) {
      describe('class ' + cls.name, function() {
        testClass(require(modPath), cls);
      });
    });
  });
});




// describe('module gp', function() {
//   it('Quaternion', function() {
//     var q1 = new gp.Quaternion();
//     var q2 = new gp.Quaternion();
//     var q3 = q1.interpolateLinear(q2, 0.5);
//     expect(typeOf(q3)).toBe("Quaternion");
//     var q4 = q1.interpolateSpherical(q2, 0.5);
//     expect(typeOf(q3)).toBe("Quaternion");
//   });
// });
