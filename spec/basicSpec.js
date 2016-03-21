var gp = require("../build/Release/gp.node");

describe("module gp", function() {

  it("can load", function() {
    expect(gp).not.toBe(undefined)
  });
});
