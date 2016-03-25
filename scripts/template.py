import re
from pygccxml import declarations

class Template:
    def __init__(self, text, func=None):
        self.text = text
        self.process = func

    def render(self, **kwargs):
        if(self.process != None):
            kwargs = self.process(**kwargs)
        #print kwargs
        text = str(self.text)
        for arg in kwargs.keys():
            #print arg
            text = text.replace("${"+arg+"}", kwargs[arg])
        return text

def print_arg(arg):
    if("const" in arg):
        arg = "const " + arg.replace("const ", "")
    return arg


def print_calldef(calldef):
    name = declarations.algorithm.full_name(calldef)
    if name[:2] == "::":
        name = name[2:]
    # Add the arguments...
    args = [print_arg(str(a)) for a in calldef.arguments]

    res = "%s(%s)" % (name, ", ".join(args))
    # Add the return type...
    if calldef.return_type is not None:
        res = "%s %s" % (calldef.return_type, res)
    # const?
    if calldef.has_const:
        res += " const"
    # static?
    if calldef.has_static:
        res = "static " + res

    res = res.replace(calldef.parent.name + "::", "")
    return res


def process_class(cls, constructors, functions, typedefs):
    base = ""
    if len(cls.bases) > 0:
        base = " : public " + cls.bases[0].related_class.name

    name = re.sub("<\w+>", "", cls.name)
    new_name = re.sub("^\w+_", "", cls.name)
    return {
        "name": name,
        "new_name": new_name,
        "base_class": base,
        "constructors": "".join(
            [t_calldef.render(name=c.name, decl=c) for c in constructors]),
        "functions": "".join(
            [t_calldef.render(name=c.name, decl=c) for c in functions]),
        "typedefs": "\n".join([td.decl_string for td in typedefs])
    }

t_class = Template("""
%nodefaultctor ${name};

class ${name}${base_class}{
	public:
    /* Constructors */
    ${constructors}
    /* Member functions */
    ${functions}
};
""", process_class)

def process_calldef(name, decl):
    return {
        "name": name,
        "new_name": name[0].lower() + name[1:],
        "decl": print_calldef(decl)
    }

t_calldef = Template("""
%feature("compactdefaultargs") ${name};
${decl};
""", process_calldef)

t_rename = Template("%rename(${new_name}) ${name};")


def process_includes(name, includes):
    return {
        "name": name,
        "includes": "\n".join(["#include<"+f+">" for f in includes])
    }

t_includes = Template("""
/* includes for module: ${name} */
%{
${includes}
%}
""", process_includes)

#print t_class.render(name="Hi", constructors=["COS", "Hmm"], functions="ABS")
