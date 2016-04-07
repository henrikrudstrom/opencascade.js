var headers = require('../src/configure/headers.js');

require('../src/configure/features/rename.js');
require('../src/configure/features/property.js');
const conf = require('../src/configure/conf.js');


const render = require('../src/configure/render.js');

describe('querie objects', function() {
  it('can query headers', function() {
    expect(headers.find('gp_Pnt').length).toBe(1);
    expect(headers.get('gp_Pnt').name).toBe('gp_Pnt');
    expect(headers.get('Geom_Point').name).toBe('Geom_Point');
    expect(headers.get('Handle_Geom_Point').name).toBe('Handle_Geom_Point');
    
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
    var mod = new conf.Conf();
    mod.include('gp_Pnt');
    mod.process();
    expect(mod.declarations[0].name).toBe('gp_Pnt');
    expect(mod.declarations.length).toBe(1);
    mod.exclude('gp_Vec');
    mod.process();
    expect(mod.declarations.length).toBe(1);
    mod.exclude('gp_Pnt');
    mod.include('gp_Vec*');
    mod.process();
    expect(mod.declarations.length).toBe(3);
    mod.exclude('gp_*WithNullMagnitude');
    mod.process();
    expect(mod.declarations.length).toBe(2);
  });
  it('declarations are only included once', function() {
    var mod = new conf.Conf();
    mod.include('gp_Pnt');
    mod.include('gp_Pnt');
    mod.process();
    expect(mod.get('gp_Pnt').name).toBe('gp_Pnt');
    expect(mod.find('*').length).toBe(1);
  });
  
  it('can include declared types', function() {
    var mod = new conf.Conf();
    mod.include('gp_Pnt');
    mod.include('gp_Pnt');
    mod.process();
    expect(mod.declarations[0].name).toBe('gp_Pnt');
  });
  
  it('wrap defintions are mapped to the source', function(){
    var mod = new conf.Conf();
    mod.include('gp_Pnt');
    mod.rename('gp_Pnt', 'Point');
    var pnt = mod.get('gp_Pnt')
    pnt.include('SetX');
    mod.process();
    // console.log(pnt)
    // console.log("================================")
    // console.log("SetX", pnt.get('SetX'))
    
    expect(pnt.source().name).toBe('gp_Pnt');
    
    expect(pnt.get('SetX').source().name).toBe('SetX');
  })
  // it('deepcopies the object from the source', function() {
  //   var mod = new conf.Conf();
  //   mod.include('gp_Pnt');
  //   mod.process('include');
  //   var wrapped = mod.get('gp_Pnt');
  //   var orig = headers.get('gp_Pnt');
  //   expect(wrapped).not.toBe(orig);
  //   expect(wrapped.declarations[0]).not.toBe(orig.declarations[0]);
  //   expect(wrapped.declarations.length).toBe(orig.declarations.length);
  // });

  it('can rename declarations', function() {
    var mod = new conf.Conf();
    mod.include('gp_Pnt');
    mod.find('gp_Pnt').include('*');
    mod.rename('gp_Pnt', 'Point');
    mod.process();
    expect(mod.get('gp_Pnt').name).toBe('Point');
    expect(mod.get('gp_Pnt').declarations[0].parent).toBe('Point');
    
  });
  it('renames childs parents', function(){
    
  })
  
  
  
  it('can rename before include', function() {
    var mod = new conf.Conf();
    mod.rename('gp_Vec', 'Vector');
    mod.include('gp_Vec');
    mod.process();
    expect(mod.get('gp_Vec').name).toBe('Vector');
  });
  it('only last is valid', function() {
    var mod = new conf.Conf();

    mod.include('gp_Vec*');
    mod.rename('gp_Vec*', 'Vector');
    mod.rename('gp_Vec2d', 'Vector2d');
    mod.process();
    expect(mod.get('gp_Vec').name).toBe('Vector');
    expect(mod.get('gp_Vec2d').name).toBe('Vector2d');
  });
  
  it('can pass a function', function() {
    var mod = new conf.Conf();
    mod.include('gp_Vec*');
    mod.rename('*', (n) => n + '_suffix');
    mod.process();
    expect(mod.get('gp_Vec').name).toBe('gp_Vec_suffix');
    expect(mod.get('gp_Vec2d').name).toBe('gp_Vec2d_suffix');
  });
  
  it('functions can be composed', function() {
    conf.Conf.prototype.testInclude = function(expr, name) {
      this.include(expr);
      this.rename(expr, name);
    };
    var mod = new conf.Conf();
    mod.testInclude('gp_Vec', 'Vector');
    mod.process();
    expect(mod.get('gp_Vec').name).toBe('Vector');
  });

  it('filter and rename members', function() {
    var mod = new conf.Conf();
    mod.include('gp_Vec');
    var vec = mod.get('gp_Vec');
    
    vec.exclude('*');
    mod.process();
    expect(mod.get('gp_Vec').declarations.length).toBe(0);
    expect(mod.get('gp_Vec')).toBe(vec);
    vec.include('SetX');
    expect(mod.get('gp_Vec').declarations.length).toBe(1);
    //console.log('filter and rename members=====================')
    expect(mod.get('gp_Vec').get('SetX').name).toBe('SetX');
    //console.log('filter and rename members=====================')
    vec.rename('SetX', 'setX');
    mod.process();
    expect(mod.get('gp_Vec').get('SetX').name).toBe('setX');
  });
  
  
  it('can query nested declarations', function(){
    var mod = new conf.Conf();
    mod.include('gp_*')
    mod.find('*')
      .include('*');
    mod.camelCase('*::*');
    mod.process();
    //console.log('can query nested declarations=====================')
    expect(mod.find('gp_Vec::SetX')[0].name).toBe('setX');
    //console.log('can query nested declarations=====================')
  });

  it('can apply to many declarations', function(){
    var mod = new conf.Conf();
    var classes = mod.include('gp_*');
    mod.find('gp_*').exclude('*');
    mod.find('gp_Vec*').include('Set*');
    mod.process();
    expect(mod.get('gp_Pnt').declarations.length).toBe(0);
    expect(mod.get('gp_Vec').declarations.length).toBe(12);
    expect(mod.get('gp_Vec2d').declarations.length).toBe(9);
    
  });


  it('rename camel case', function() {
    var mod = new conf.Conf();
    mod.include('gp_Vec');
    var vec = mod.get('gp_Vec');
    vec.include('*');
    vec.camelCase('*');
  
    mod.process();
    expect(vec.find('SetY')[0].name).toBe('setY');
    expect(vec.find('Mirror')[0].name).toBe('mirror');
  });
  it('rename remove prefix', function() {
    var mod = new conf.Conf();
    mod.include('gp_Vec');
    mod.include('Geom_Point');
    mod.include('Handle_Geom_Point');
    mod.removePrefix('*');
  
    mod.process();
    expect(mod.get('gp_Vec').name).toBe('Vec');
    expect(mod.get('Geom_Point').name).toBe('Point');
    expect(mod.get('Handle_Geom_Point').name).toBe('Handle_Point');
  });
  
  it('can define properties', function(){
    var mod = new conf.Conf();
    mod.include('gp_Vec')
    var vec = mod.get('gp_Vec')
      .include('*')
      .camelCase('*')
      .property('X', 'SetX')
    mod.process();
    expect(vec.get('X').cls).toBe('property');
    expect(vec.get('X').name).toBe('x');
    expect(vec.get('X').type).toBe('Standard_Real');
    expect(vec.get('SetX')).toBe(null);
  });
});


describe('MultiConf', function() {
  it('behaves as a normal array', function(){
    var a = [1,3,5];
    conf.wrapDeclarations(a);
    expect(a[0]).toBe(1);
    expect(a[1]).toBe(3);
    var sum = a.reduce((a,b) => a + b);
    expect(sum).toBe(9);
    expect(typeof a.include).toBe('function')
    expect(typeof a.exclude).toBe('function')
  });
});
var moduleReader = require('../src/configure/modules.js');
describe('modules queries', function(){
    it('can query wrapped modules', function(){
    var mod1 = new conf.Conf();
    mod1.name ='gp';
    mod1.include('gp_Pnt');
    mod1.rename('gp_Pnt', 'Point');
    mod1.process();
    var mod2 = new conf.Conf();
    mod2.name = 'Geom';
    mod2.include('Geom_Point');
    mod1.process();
    
    var mods = moduleReader([mod1, mod2])
    
    expect(mods.get('gp.Point').name).toBe('Point');
    expect(mods.get('Geom.Geom_Point').name).toBe('Geom_Point');
    
  });
});

