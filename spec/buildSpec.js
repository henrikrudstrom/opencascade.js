describe('build', function() {
  var configure = require('../src/configure.js');
  var query = require('../src/lib/query.js');
  ///

  it('can query', function() {
    var q = query.loadModule('gp');
    expect(typeof q.classes.get('gp_Pnt')).toBe('object')
    expect(q.classes.get('gp_Pnt').name).toBe('gp_Pnt')
  });


  it('can ignore', function() {
    var config = {}

    configure('gp', config, function(conf) {
      //console.log("hmm")
      conf.ignore("gp_Pnt");
    });

    ////console.log(config);
    expect(config.ignore.length).toBe(1);
    expect(config.ignore[0].name).toBe('gp_Pnt');
    var q = query.loadModule('gp', config);

    expect(q.classes.get('gp_Pnt').tag('ignore').enabled).toBe(true);
    expect(q.classes.get('gp_Vec').ignore()).not.toBe(true);
    expect(q.classes.get('gp_Pnt').ignore()).not.toBe(undefined);
    expect(q.classes.get('gp_Pnt').ignore()).toBe(true);
  });

    it('can include', function() {
      var config = {}

      configure('gp', config, function(conf) {
        //console.log("hmm")
        conf.ignore("gp_*");
        conf.include("gp_Pnt")
      });
      var q = query.loadModule('gp', config);
      expect(q.classes.get('gp_Pnt').tag('ignore').enabled).toBe(false);
      expect(q.classes.get('gp_Pnt').ignore()).not.toBe(undefined);
      expect(q.classes.get('gp_Pnt').ignore()).toBe(false);
      config = configure('gp', config, function(conf) {
        //console.log("hmm")
        conf.ignore("gp_*");
      });
      expect(q.classes.get('gp_Pnt').ignore()).toBe(true);
    });
});
