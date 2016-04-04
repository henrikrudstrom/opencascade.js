var settings = require('../src/settings.js');
var configure = require('../src/configure.js');
var query = require('../src/query.js');
var depend = require('../src/depend.js');


const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');

function writeJSON(dest, data, done) {
  mkdirp.sync(path.dirname(dest));
  var src = JSON.stringify(data, null, 2);
  if (typeof done !== 'function') {
    return fs.writeFileSync(dest, src);
  }
  return fs.writeFile(dest, src, done);
}

describe('build', function() {
  it('can query', function() {
    var q = query.loadModule('gp', { config: {} });
    expect(typeof q.classes.get('gp_Pnt')).toBe('object');
    expect(q.classes.get('gp_Pnt').name).toBe('gp_Pnt');
  });


  it('can ignore', function() {
    var config = {};

    configure('gp', config, function(mod, conf) {
      conf.ignore('gp_Pnt');
    });
    expect(config.ignore.length).toBe(1);
    expect(config.ignore[0].name).toBe('gp_Pnt');
    var q = query.loadModule('gp', { config });

    expect(q.classes.get('gp_Pnt').tag('ignore').enabled).toBe(true);
    expect(q.include(q.classes.get('gp_Pnt'))).toBe(false);
    expect(q.include(q.classes.get('gp_Vec'))).toBe(true);

  });

  it('can include', function() {
    var config = {};
    var q = query.loadModule('gp', { config }, true);
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

  function compareJson(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }


  it('can read dependencies', function() {
    var depsAdaptor2d = [
      'Standard',
      'GeomAbs',
      'TColStd',
      'gp',
      'Geom2d',
      'TCollection',
      'TColgp'
    ];

    var depsGp = [
      'Standard',
      'TColStd',
      'TCollection'
    ];

    var reader = depend.reader();
    var res = reader.requiredModules('Adaptor2d', false);
    expect(res).toEqual(depsAdaptor2d);
    res = reader.requiredModules('gp', false);
    expect(res).toEqual(depsGp);
  });

  it('can include missing classes', function() {
    settings.init({
      buildPath: 'build/test/missing',
      wrapperPath: 'spec/wrapper/missing'
    });
    configure.clean('gp');
    var data = configure('gp');
    configure.write('gp', data);
    var q = query.loadModule('gp');
    expect(q.classes.filter(q.include).length).toBe(1);

    console.log(data)


    //writeJSON(`${settings.paths.configDest}/${'gp'}.json`, data);
    configure.configureMissing();
    q = query.loadModule('gp');
    expect(q.classes.filter(q.include).length).toBe(8);
    q = query.loadModule('Standard');
    //expect(q.typedefs.filter(q.include).length).toBe(3);

  });
});
