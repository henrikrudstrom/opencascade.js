var gp = require("../build/Release/gp.node");
var Standard = require("../build/Release/Standard.node");

describe("module gp", function() {

  it("can load gp", function() {
    expect(gp).not.toBe(undefined)
    var p1 = new gp.gp_XY()
    var p2 = new gp.gp_XY(p1)
    expect(p2).not.toBe(undefined)
  });

  it("can handle Standard_Real", function() {
    expect(gp).not.toBe(undefined)
    var p1 = new gp.gp_XY(1.0, 2.0)
  });


  // it("can load Standard", function() {
  //   expect(Standard).not.toBe(undefined)
  //   expect(new Standard.Standard_GUID()).not.toBe(undefined)
  //
  // });
});
