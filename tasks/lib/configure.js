global.$$ = {};
const loadTree = require('./tree.js');
module.exports = function configure(file, treePath) {
  global.$$.data = {
    ignore: [],
    rename: []
  };
  global.$$.tree = loadTree(treePath);
  require(`../../${file}`);
  var data = global.$$.data;
  delete global.$$.data;
  delete global.$$.tree;
  return data;
};
