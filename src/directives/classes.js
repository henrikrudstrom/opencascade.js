function renderArg(arg) {
  var res = arg.decl + ' ' + arg.name;
  if (arg.default) {
    res += '=' + arg.default;
  }
  return res;
}

function renderFunction(func) {
  var args = func.arguments.map(renderArg).join(', ');
  var stat = func.static ? 'static ' : '';
  var cons = func.const ? 'const ' : '';
  return `
    %feature("compactdefaultargs") ${func.name};
    ${stat}${cons}${func.returnType + ' '}${func.name}(${args});`;
}

function renderClass(cls, config) {
  var functions = cls.members
    //.filter((member) => member.cls === 'calldef')
    .filter(cls.include)
    //.filter(ignore(config, cls))
    .map(renderFunction).join('');
  var base = '';
  if (cls.bases.length > 0) {
    base = ' : ' + cls.bases[0].access + ' ' + cls.bases[0].name;
  }
  const constructors = cls.constructors
    .filter(cls.include)
    .map(renderFunction).join('');
  return `\
%nodefaultctor ${cls.name};
class ${cls.name}${base} {
	public:
    /* Constructors */
    ${constructors}
    /* Member functions */
    ${functions}
};`;
}

module.exports.renderSwig = function(moduleName, config, q) {
  var parts = {};
  q.classes
    .filter(q.include)
    //.filter(ignore(config))
    .forEach(function(cls) {
      parts[cls.name] = renderClass(cls, config);
    });
  return parts;
};
