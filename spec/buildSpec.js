describe('build', function() {
  var configure = require('../src/configure.js');
  var query = require('../src/lib/query.js');
  ///

  it('can query', function() {
    var q = query.loadModule('gp', {config: {}});
    expect(typeof q.classes.get('gp_Pnt')).toBe('object')
    expect(q.classes.get('gp_Pnt').name).toBe('gp_Pnt')
  });


  it('can ignore', function() {
    var config = {}

    configure('gp', config, function(mod, conf) {
      //console.log('hmm')
      conf.ignore('gp_Pnt');
    });

    ////console.log(config);
    expect(config.ignore.length).toBe(1);
    expect(config.ignore[0].name).toBe('gp_Pnt');
    var q = query.loadModule('gp', {config});

    expect(q.classes.get('gp_Pnt').tag('ignore').enabled).toBe(true);
    expect(q.include(q.classes.get('gp_Pnt'))).toBe(false);
    expect(q.include(q.classes.get('gp_Vec'))).toBe(true);

  });

  it('can include', function() {
    var config = {};
    var q = query.loadModule('gp', {config}, true);
    expect(q.include(q.classes.get('gp_Pnt'))).toBe(true);
    configure('gp', config, function(mod, conf) {
      conf.ignore('gp_Vec');
    });
    expect(q.include(q.classes.get('gp_Pnt'))).toBe(true);
    configure('gp', config, function(mod, conf) {
      conf.ignore('gp_*');
    });
    expect(q.include(q.classes.get('gp_Pnt'))).toBe(false);

    configure('gp', config, function(mod, conf) {
      conf.include('gp_Pnt');
    });
    expect(q.include(q.classes.get('gp_Pnt'))).toBe(true);

    config = configure('gp', config, function(mod, conf) {
      conf.ignore('gp_*');
    });
    expect(q.include(q.classes.get('gp_Pnt'))).toBe(false);
  });
});
