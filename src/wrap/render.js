var fs = require("fs")
var data = JSON.parse(fs.readFileSync("config/gp_proc.json"))

function render(template, data) {
  template = template.toString()
  console.log(data)
  for (var key in data) {

    template = template.replace(new RegExp("<#" + key + ">", "g"), data[key])
  }
  return template;
}

t_class =
  `%nodefaultctor <#name>;

class <#name><#base_class>{
	public:
    /* Constructors */
    <#constructors>
    /* Member functions */
    <#functions>
};
`

t_calldef =
  `%feature("compactdefaultargs") <#name>;
<#decl>;
`

t_rename = "%rename(${new_name}) ${name};"

t_includes =
  `/* includes for module: <#name> */
%{
<#includes>
%}
`


function renderArg(arg) {
  res = arg.type + " " + arg.name
  if (arg.default) {
    res += "=" + arg.default
  }
  return res;

}

function renderFunction(func) {
  var str = func.name;
  if (str.startsWith("::")) str = substr(2)
  var str = func.return_type + " " + func.name;
  var args = func.arguments.map(renderArg);
  str += "(" + args.join(", ") + ");"
  if (func.const) str += " const";
  if (func.static) str = "static " + str;

  //str = res.replace(func.parent.name + "::", "");
  return render(t_calldef, {
    name: func.name,
    decl: str
  });
}

function isClass(name) {
  return function(member) {
    return member.cls !== name;
  }
}

function renderSwigClass(cls) {
  var functions = cls.members.filter(isClass("calldef"))
    .map(renderFunction).join("\n");
  var base = ""
  if(cls.bases.length > 0){
    base = cls.bases[0].access + " " + cls.bases[0].name;
  }
  return render(t_class, {
    name: cls.name,
    base_class: base,
    constructors: "",
    functions: functions
  })
}


console.log(renderSwigClass(data.classes[0]))
