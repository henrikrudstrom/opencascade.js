var gp = require("../lib/occ/gp.node");
var Geom = require("../lib/occ/Geom2d.node");
var moduleName = "Geom2d"

function instantiationTest(cls){
    it("can instantiate " + cls, function(){
      var obj = new Geom[cls]()
      expect(typeof obj).toBe("object")
      expect(geomP.constructor.name).toBe(cls)
    })
}




describe("module gp", function() {
  it("Geom.Point2d default constructor", function(){
    var gpP = new gp.Point2d(1,2)
    var geomP = new Geom.Point2d(gpP)
    expect(typeof geomP).toBe("object")
    expect(geomP.constructor.name).toBe("Point2d")
  })
});
