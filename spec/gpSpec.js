//var settings = require('./settings.js')
var gp = require('../dist/lib/gp.node');

//var Geom2d = require('../build/Release/Geom2d.node');
function typeOf(obj){
  return obj.constructor.name.replace("_exports_", "");
}
describe('module gp', function() {

  // it('Geom.Point2d', function(){
  //   var pt = new gp.Pnt2d(100.0, 200.0)
  //   var gpt = new Geom2d.Point2d(pt)
  //   expect(gpt.X()).toBe(100)
  // })

  it('gp.XY constructor', function() {
    var xy = new gp.XY(1, 2);
    expect(typeof xy).toBe('object');
    expect(xy.constructor.name).toBe('XY');
  });

  it('gp.XY default constructor', function() {
    var xy = new gp.XY();
    expect(typeof xy).toBe('object');
    expect(xy.constructor.name).toBe('XY');
    // var xy2 = xy.add(xy);
    // expect(typeof xy2).toBe('object');
    // expect(xy2.constructor.name).toBe('XY');
    //expect(xy.Coord).toBe(undefined)
  })

  it('gp.XY arithmetics', function() {
    var xy = new gp.XY(10, 20)
    expect(xy.x()).toBe(10)
    expect(xy.y()).toBe(20)
    xy.setX(25)
    expect(xy.x()).toBe(25)
    yx = new gp.XY(100, 200)
    xyx = xy.added(yx)
    expect(xyx.x()).toBe(125)
  })

  it('can load gp', function() {
    expect(gp).not.toBe(undefined)
    var p1 = new gp.XY()
    var p2 = new gp.XY(p1)
    expect(p2).not.toBe(undefined)
  });

  it('Quaternion', function() {
    var q1 = new gp.Quaternion();
    var q2 = new gp.Quaternion();
    var q3 = gp.Quaternion.sphericalInterpolation(q1, q2, 0.5);
    expect(typeOf(q3)).toBe("Quaternion");

  });

  it('gp.Point', function() {
    var pnt = new gp.Point(1, 2, 4);
    var xyz = pnt.xyz();
    expect(typeof xyz).toBe('object');

    //expect(xyz.constructor.name).toBe('XYZ');
  });

it('gp.Sphere', function() {
  var pnt = new gp.Point(1, 2, 4);
  var dir = new gp.Dir(1,0,0);
  var ax3 = new gp.Ax3(pnt, dir);
  var sphere = new gp.Sphere(ax3, 10.0)
  expect(typeof sphere).toBe('object');

  //expect(xyz.constructor.name).toBe('XYZ');
});

it('gp.Point', function() {
  var pnt = new gp.Point(1, 2, 4);
  var xyz = pnt.xyz();
  expect(typeof xyz).toBe('object');

  //expect(xyz.constructor.name).toBe('XYZ');
});



  //
  // it('can handle Standard_Real', function() {
  //   expect(gp).not.toBe(undefined)
  //   var p1 = new gp.XY(1.0, 2.0)
  // });


  // it('can load Standard', function() {
  //   expect(Standard).not.toBe(undefined)
  //   expect(new Standard.Standard_GUID()).not.toBe(undefined)
  //
  // });
});
