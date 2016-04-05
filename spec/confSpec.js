var headers = require('../src/configure/headers.js');

const conf = require('../src/configure/configuration.js');
const render = require('../src/configure/render.js');

describe('headers object', function() {
  it('can query headers', function() {
    expect(headers.find('gp_Pnt').length).toBe(1);
    expect(headers.get('gp_Pnt').name).toBe('gp_Pnt');
    expect(headers.find('gp_Pnt::SetCoord').length).toBe(2);
    expect(headers.find('gp_Pnt::Set*').length).toBe(6);
    expect(headers.get('gp_Pnt::BaryCenter').name).toBe('BaryCenter');
    expect(headers.find('gp_Vec*').length).toBe(3);
    expect(headers.find('gp_Vec*WithNull*').length).toBe(1);
    expect(headers.find('gp_*::*Distance').length).toBe(22);
  });
});

describe('module object', function() {
  it('can include declared types', function() {
    var mod = new conf.Module();
    mod.include('gp_Pnt');
    mod.process('include');
    expect(mod.declarations[0].name).toBe('gp_Pnt');
    expect(mod.declarations.length).toBe(1);
    mod.exclude('gp_Vec');
    mod.process('include');
    expect(mod.declarations.length).toBe(1);
    mod.exclude('gp_Pnt');
    mod.include('gp_Vec*');
    mod.process('include');
    expect(mod.declarations.length).toBe(3);
    mod.exclude('gp_*WithNullMagnitude');
    mod.process('include');
    expect(mod.declarations.length).toBe(2);
  });
  it('is queryable', function() {
    var mod = new conf.Module();
    mod.include('gp_Pnt');
    mod.process('include');
    expect(mod.get('gp_Pnt').name).toBe('gp_Pnt');
    expect(mod.find('gp_*').length).toBe(1);
  });
  it('deepcopies the object from the source', function() {
    var mod = new conf.Module();
    mod.include('gp_Pnt');
    mod.process('include');
    var wrapped = mod.get('gp_Pnt');
    var orig = headers.get('gp_Pnt');
    expect(wrapped).not.toBe(orig);
    expect(wrapped.declarations[0]).not.toBe(orig.declarations[0]);
    expect(wrapped.declarations).toEqual(orig.declarations);
  });

  it('can rename declarations', function() {
    var mod = new conf.Module();
    mod.include('gp_Pnt');
    mod.rename('gp_Pnt', 'Point');
    mod.process();
    expect(mod.get('gp_Pnt').name).toBe('Point');
  });
  it('can rename before include', function() {
    var mod = new conf.Module();
    mod.rename('gp_Vec', 'Vector');
    mod.include('gp_Vec');
    mod.process();
    expect(mod.get('gp_Vec').name).toBe('Vector');
  });
  it('only last is valid', function() {
    var mod = new conf.Module();

    mod.include('gp_Vec*');
    mod.rename('gp_Vec*', 'Vector');
    mod.rename('gp_Vec2d', 'Vector2d');
    mod.process();
    expect(mod.get('gp_Vec').name).toBe('Vector');
    expect(mod.get('gp_Vec2d').name).toBe('Vector2d');
  });
  it('can pass a function', function() {
    var mod = new conf.Module();
    mod.include('gp_Vec*');
    mod.rename('gp_Vec*', (n) => n + '_suffix');
    mod.process();
    expect(mod.get('gp_Vec').name).toBe('gp_Vec_suffix');
    expect(mod.get('gp_Vec2d').name).toBe('gp_Vec2d_suffix');
  });
  it('functions can be composed', function() {
    conf.Module.prototype.testInclude = function(expr, name) {
      this.include(expr);
      this.rename(expr, name);
    };
    var mod = new conf.Module();
    mod.testInclude('gp_Vec', 'Vector');
    mod.process();
    expect(mod.get('gp_Vec').name).toBe('Vector');
  });

  it('filter and rename members', function() {
    var mod = new conf.Module();
    mod.include('gp_Vec');
    var vec = mod.get('gp_Vec')
    vec.exclude('*');
    mod.process();
    expect(mod.get('gp_Vec').declarations.length).toBe(0);
    expect(mod.get('gp_Vec')).toBe(vec)
    console.log(mod.get('gp_Vec'))
    vec.include('SetX');
    expect(mod.get('gp_Vec').declarations.length).toBe(1);
    expect(mod.get('gp_Vec').get('SetX').name).toBe('SetX');
    // vec.rename('SetX', 'setX');
    // mod.process();
    // expect(mod.get('gp_Vec').get('SetX').name).toBe('s  etX');
  });


});

describe('Renderer', function() {
  it('can render renames', function() {
    var mod = new conf.Module();

    mod.include('gp_Vec');
    mod.include('gp_Vec2d');
    mod.rename('gp_Vec*', 'Vector');
    mod.rename('gp_Vec2d', 'Vector2d');
    mod.process();
    var parts = render.renderModule(mod, require('../src/configure/features/rename.js'));
    var res = '%rename("Vector") gp_Vec;\n%rename("Vector2d") gp_Vec2d;';
    expect(parts.rename).toBe(res);
  });
});
