var configs = require("../src/wrap/config.js")
var trees = require("../src/wrap/tree.js")
var camelCase = require('camel-case');
describe("query object", function() {

  it("can find classes by name", function() {
    config = trees("gp");
    expect(config.types("gp_Pnt").length).toBe(1)
    expect(config.types("gp_Pnt2d").length).toBe(1)
    expect(config.types("gp_Pnt*").length).toBe(2)
    expect(config.types("gp_Pnt").members("*X").length).toBe(2)
    expect(config.types("gp_Pnt*").members("*X").length).toBe(4)


  });


  it("can rename classes", function() {

    var config = configs("gp");

    output = config.configure(function(tree, flag, rename, ignore){
      tree.types("gp_Pnt", rename("Point"));
      tree.types("gp_Pnt2d").members("*", rename(camelCase));
      tree.types("gp_Pnt", ignore());
    });
    var members = config.tree.types("gp_Pnt2d").members("*").length;
    expect(output.rename.length).toBe(members + 1);
    expect(output.ignore.length).toBe(1);


  });
});
