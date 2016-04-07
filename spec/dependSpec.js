var headers = require('../src/configure/headers.js');

require('../src/configure/features/rename.js');
const conf = require('../src/configure/conf.js');
const configure = require('../src/configure/configure.js');

const render = require('../src/configure/render.js');
var moduleReader = require('../src/configure/modules.js');
var depend = require('../src/configure/dependencies.js');

describe('classDepends', function() {


  it('can process source dependencies', function() {
    var reader = depend(headers);
    var deps = reader(headers.get('gp_Pnt'));
    var res = [
      'gp_XYZ', 'Standard_Real', 'Standard_Integer',
      'Standard_Boolean', 'gp_Ax1', 'gp_Ax2', 'gp_Trsf', 'gp_Vec'
    ];
    res.sort();
    deps.sort();
    expect(deps).toEqual(res);
  });

  it('can process wrapped dependencies', function() {
    var mod1 = new conf.Conf();
    mod1.name('gp');
    mod1.include('gp_*');
    mod1.find('gp_*').include('*');
    mod1.removePrefix('*');
    mod1.process();
    configure.translateTypes([mod1]);


    var modules = moduleReader([mod1]);
    var reader = depend(modules);
    var deps = reader(modules.get('gp.Pnt'));
    var res = [
      'gp.XYZ', 'double', 'int',
      'bool', 'gp.Ax1', 'gp.Ax2', 'gp.Trsf', 'gp.Vec'
    ];
    res.sort();
    deps.sort();
    expect(deps).toEqual(res);
  });
  it('can process recursive dependencies', function() {
    var reader = depend(headers);
    //var deps = reader(headers.get('Geom_Point'));
    var deps = reader(headers.get('Geom_Point'), true);

    var res = [
      'Standard_Real', 'gp_Pnt', 'Handle_Geom_Point', 'Handle_Standard_Type',
      'gp_XYZ', 'Standard_Integer', 'Standard_Boolean', 'gp_Ax1', 'gp_Ax2', 'gp_Trsf',
      'gp_Vec', 'gp_Mat', 'gp_Dir', 'gp_Trsf2d', 'gp_Quaternion', 'gp_Ax3',
      'gp_TrsfForm', 'gp_Pnt2d', 'gp_Ax2d', 'gp_Vec2d', 'gp_XY', 'gp_Mat2d', 'gp_Dir2d',
      'gp_EulerSequence', 'Handle_Standard_Transient', 'Standard_Transient',
      'Standard_OStream', 'Standard_CString', 'Standard_Type', 'Standard_Address'
    ];

    res.sort();
    deps.sort();
    expect(deps).toEqual(res);
  });

});
