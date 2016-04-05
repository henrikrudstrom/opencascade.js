module.exports = function(mod){
  mod.name('gp')
  mod.include('gp_Vec*')
  mod.exclude('gp_QuaternionSLerp');
  mod.exclude('gp_QuaternionNLerp');
  mod.camelCase('*::*');
  mod.removePrefix('*');
}