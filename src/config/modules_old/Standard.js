var renameModule = function(moduleName) {
  return function(name) {
    return name.replace(moduleName + '_', '');
  };
};


require('../common.js');
var conf = require('../conf.js');
conf.ignore('*Standard_AncestorIterator');
conf.ignore('*Standard_CLocaleSentry');
conf.ignore('*Standard_Failure');
conf.ignore('*Standard_Static_Assert');
conf.ignore('*Standard_StdAllocator');
conf.ignore('*Standard_MMgrOpt');
conf.ignore('Standard', 'Free');
