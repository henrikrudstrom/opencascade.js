var settings = require('../tasks/lib/settings.js')
var gp = require("../dist/lib/gp.node");

//var Geom2d = require("../build/Release/Geom2d.node");

describe("module gp", function() {

  // it("Geom.Point2d", function(){
  //   var pt = new gp.Pnt2d(100.0, 200.0)
  //   var gpt = new Geom2d.Point2d(pt)
  //   expect(gpt.X()).toBe(100)
  // })

  it("gp.XY default constructor", function(){
    var xy = new gp.XY()
    expect(typeof xy).toBe("object")
    expect(xy.constructor.name).toBe("XY")
    //expect(xy.Coord).toBe(undefined)
  })

  it("gp.XY arithmetics", function(){
    var xy = new gp.XY(10, 20)
    expect(xy.x()).toBe(10)
    expect(xy.y()).toBe(20)
    xy.setX(25)
    expect(xy.x()).toBe(25)
    yx = new gp.XY(100,200)
    xyx = xy.added(yx)
    expect(xyx.x()).toBe(125)
  })

  it("can load gp", function() {
    expect(gp).not.toBe(undefined)
    var p1 = new gp.XY()
    var p2 = new gp.XY(p1)
    expect(p2).not.toBe(undefined)
  });

  it("Quaternion", function(){


  });
  //
  // it("can handle Standard_Real", function() {
  //   expect(gp).not.toBe(undefined)
  //   var p1 = new gp.XY(1.0, 2.0)
  // });


  // it("can load Standard", function() {
  //   expect(Standard).not.toBe(undefined)
  //   expect(new Standard.Standard_GUID()).not.toBe(undefined)
  //
  // });
});
