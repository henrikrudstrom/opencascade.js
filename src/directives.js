const glob = require('glob');
const path = require('path');

const directives = glob.sync(`${__dirname}/directives/*.js`)
  .map((dirPath) => {
    return {
      module: require(dirPath.replace(__dirname, '.')),
      name: path.basename(dirPath).replace('.js', '')
    };
  });

var names = directives.map((dir) => dir.name);

function getDir(name) {
  return directives.find((dir) => dir.name === name);
}

function orderDirs(dir, list) {
  if (names.indexOf(dir.name) !== -1)
    return;
  if (list.indexOf(dir.name) === -1)
    return;
  if (dir.module.depends) {
    dir.module.depends.forEach((name) => orderDirs(getDir(name)));
  }
  list.push(dir.name);
}

var order = [];
directives.forEach((dir) => orderDirs(dir, order));
directives.sort((a, b) => order.indexOf(b.name) - order.indexOf(a.name));

module.exports = directives;
