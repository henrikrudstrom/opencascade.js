var headers = require('../src/configure/headers.js');
require('../src/configure/features/rename.js');
const conf = require('../src/configure/conf.js');

const render = require('../src/configure/render.js');

describe('headers object', function() {
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
    expect(wrapped.declarations.length).toBe(orig.declarations.length);
  });

  it('can rename declarations', function() {
    var mod = new conf.Module();
    mod.include('gp_Pnt');
    mod.rename('gp_Pnt', 'Point');
    mod.process();
    expect(mod.get('gp_Pnt').name).toBe('Point');
    expect(mod.get('gp_Pnt').declarations[0].parent).toBe('Point');
    
  });
  it('renames childs parents', function(){
    
  })
  
  
  
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
    mod.rename('*', (n) => n + '_suffix');
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
    var vec = mod.get('gp_Vec');
    
    vec.exclude('*');
    mod.process();
    expect(mod.get('gp_Vec').declarations.length).toBe(0);
    expect(mod.get('gp_Vec')).toBe(vec);
    vec.include('SetX');
    expect(mod.get('gp_Vec').declarations.length).toBe(1);
    expect(mod.get('gp_Vec').get('SetX').name).toBe('SetX');
    vec.rename('SetX', 'setX');
    mod.process();
    expect(mod.get('gp_Vec').get('SetX').name).toBe('setX');
  });
  
  
  it('can query nested declarations', function(){
    var mod = new conf.Module();
    mod.include('gp_*');
    mod.camelCase('*::*');
    mod.process();
    expect(mod.find('gp_Vec::SetX')[0].name).toBe('setX');
  });

  it('rename camel case', function() {
    var mod = new conf.Module();
    mod.include('gp_Vec');
    var vec = mod.get('gp_Vec');
    vec.include('*');
    vec.camelCase('*');
  
    mod.process();
    expect(vec.find('SetY')[0].name).toBe('setY');
    expect(vec.find('Mirror')[0].name).toBe('mirror');
  });
  it('rename remove prefix', function() {
    var mod = new conf.Module();
    mod.include('gp_Vec');
    mod.include('Geom_Point');
    mod.include('Handle_Geom_Point');
    mod.removePrefix('*');
  
    mod.process();
    expect(mod.get('gp_Vec').name).toBe('Vec');
    expect(mod.get('Geom_Point').name).toBe('Point');
    expect(mod.get('Handle_Geom_Point').name).toBe('Handle_Point');
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
    var parts = render.renderParts(mod, require('../src/configure/features/rename.js'));
    var res = '%rename("Vector") gp_Vec;\n%rename("Vector2d") gp_Vec2d;';
    expect(parts.rename).toBe(res);
  });
  
  describe('MapArray', function() {
    var MapArray = require('../src/configure/MapArray.js');
    function MyClass(value){
      this.value = value;
    }
    MyClass.prototype.test1 = function(a){
      return this.value * a;
    }
    MyClass.prototype.test2 = function(){
      this.value += 1;
    }
    function MyOtherClass(name){
      this.name = name;
      this.value = 1;
    }
    
    MyOtherClass.prototype.test1 = function(a){
      return this.value * a * 2;
    }
    
    var array1 = new MapArray([new MyClass(1), new MyClass(2)]);
    var array2 = new MapArray([new MyClass(1), new MyOtherClass(2)]);
    
    it('behaves as a normal array', function(){
      expect(array1[0].value).toBe(1);
      expect(array1[1].value).toBe(2);
      var sum = array1.map((obj) => obj.value).reduce((a,b) => a + b);
      expect(sum).toBe(3);
    })
    
    it('maps variables and functions', function(){
      expect(array1.value()).toEqual([1,2]);
      expect(array1.test1(10)).toEqual([10, 20]);
      array1.test2();
      expect(array1[0].value).toBe(2);
      expect(array1[1].value).toBe(3);
    });
    
  })
  
});
