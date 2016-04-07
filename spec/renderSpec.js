var headers = require('../src/configure/headers.js');

require('../src/configure/features/rename.js');
require('../src/configure/features/property.js');
const conf = require('../src/configure/conf.js');
const render = require('../src/configure/render.js');


describe('Swig Renderer', function() {
  var features = ['rename', 'property'].map((name) =>
    require(`../src/configure/features/${name}.js`)
  );
  
  it('can render renames', function() {
    var mod = new conf.Conf();
    mod.name = 'gp';
    mod.include('gp_Vec');
    mod.include('gp_Vec2d');
    mod.rename('gp_Vec*', 'Vector');
    mod.rename('gp_Vec2d', 'Vector2d');
    
    var res = mod.get('gp_Vec2d')
      .include('SetX')
      .rename('SetX', 'setX');
    
    mod.process();
    var parts = render.renderParts(mod, features);
    
    var res = [
      '%rename("Vector") gp_Vec;',
      '%rename("Vector2d") gp_Vec2d;',
      '%rename("setX") gp_Vec2d::SetX;'
    ];
    expect(parts.rename.length).toBe(3);
    expect(parts.rename).toEqual(res);
  });
  
  it('can render properties', function(){
    var mod = new conf.Conf();
    mod.name = 'gp';
    mod.include('gp_Vec');
    mod.get('gp_Vec')
      .include('X')
      .include('SetX')
      .rename('X', 'x')
      .property('X', 'SetX')
    mod.process();

    var parts = render.renderParts(mod, features);
    var res = ['%attribute(gp_Vec, Standard_Real, x, X, SetX);']
    expect(parts.property).toEqual(res);
  });
});