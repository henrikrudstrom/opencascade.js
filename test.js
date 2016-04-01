const depend = require('./src/depend.js');
const yargs = require('yargs');
console.log();
var reader = depend.reader();
var res = reader.missingClasses(yargs.argv._)
console.log(res)
