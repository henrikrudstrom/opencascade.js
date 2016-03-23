var gp = require("../build/Release/gp.node");
var Geom2d = require("../build/Release/Geom2d.node");

describe("module gp", function() {

  it("Geom.Point2d", function(){
    var pt = new gp.Point2d(100.0, 200.0)
    var gpt = new Geom2d.Point2d(pt)
    expect(gpt.X()).toBe(100)
  })

  it("can load Geom", function(){
    expect(Geom2d).not.toBe(undefined)
    var p1 = new gp.Point2d(1.0,2.0)
    var gp1 = new Geom2d.Point2d(p1)
  })

  it("can load gp", function() {
    expect(gp).not.toBe(undefined)
    var p1 = new gp.XY()
    var p2 = new gp.XY(p1)
    expect(p2).not.toBe(undefined)
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
