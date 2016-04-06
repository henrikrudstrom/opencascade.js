var headers = require('../src/configure/headers.js');

require('../src/configure/features/rename.js');
const conf = require('../src/configure/conf.js');
const configure = require('../src/configure/configure.js');

const render = require('../src/configure/render.js');
var moduleReader = require('../src/configure/modules.js');
var depend = require('../src/configure/dependencies.js');

describe('classDepends', function() {
  
  
  it('can process source dependencies', function(){
    var reader = depend(headers);
    console.log(reader(headers.get('gp_Pnt')))
  });
  it('can process wrapped dependencies', function(){
        var mod1 = new conf.Conf();
    mod1.name('gp');
    mod1.include('gp_*');
    mod1.removePrefix('*');
    mod1.process();
    configure.translateTypes([mod1]);
    
    
    var modules = moduleReader([mod1]);
    var reader = depend(modules);
    console.log(reader(modules.get('gp.Pnt')))
  });
  
  
});
