var common = require('../common.js');
module.exports = function(conf, tree) {
  common('Standard', conf, tree);
  conf.ignore('*Standard_AncestorIterator');
  conf.ignore('*Standard_CLocaleSentry');
  conf.ignore('*Standard_Failure');
  conf.ignore('*Standard_Static_Assert');
  conf.ignore('*Standard_StdAllocator');
  conf.ignore('*Standard_MMgrOpt');
  conf.ignore('Standard', 'Free');
}
