var gp = require("../lib/occ/gp.node");
var Geom = require("../lib/occ/Geom2d.node");
var gce = require("../lib/occ/GCE2d.node");

describe("module GCE2d", function() {
  it("Geom.Point2d default constructor", function(){
    var p1 = new gp.Point2d(0,0)
    var p2 = new gp.Point2d(100, 0)
    var line = new gce.MakeLine(p1, p2)
    var value = line.value()

    expect(typeof value).toBe("object")
    ////console.log(value.constructor.name)
    expect(value.constructor.name).not.toBe("SwigProxy")

    //expect(geomP.constructor.name).toBe("Point2d")
  })
});
