import os
import json
from glob import glob
import parse
import re
import sys
from pygccxml import declarations
from collections import OrderedDict

oce_include = "/home/henrik/OCE/include/oce"

from collections import OrderedDict
import json



class Dict(OrderedDict):
    pass

test = Dict(a=10, k=100, b=20)


print json.dumps(test, indent=4, separators=(',', ': '))
class Module:

    def __init__(self, name, output_path):
        self.name = name
        self.output_path = output_path
        self.files = glob(oce_include + "/" + name + "_*.hxx")

        self.ns = parse.parse_files(oce_include, self.files)


#json.dumps(classes[1], cls=ComplexEncoder)


def iter(decls, func):
    return list([func(decl) for decl in decls])

def clean_name(name):
    if name.startswith("::"):
        return name[2:];
    return name

def w_arg(arg):
    tp = str(arg.type)
    if("const" in tp):
        tp = "const " + tp.replace("const ", "")
    d = Dict(name=arg.name, type=clean_name(tp))
    add_if(d, arg.default_value, "default")
    return d

def w_member_function(cd, parent):
    d = Dict(
        name=clean_name(cd.name),
        parent=parent.name,
        cls="memfun",
        arguments=iter(cd.arguments, w_arg),
        returnType=str(cd.return_type),

        )
    add_if(d, cd.has_static, "static")
    add_if(d, cd.has_extern, "extern")
    add_if(d, cd.has_const, "const")
    add_if(d, cd.is_artificial, "artificial")
    add_if(d, cd.does_throw, "throws")
    add_if(d, cd.virtuality, "virtuality")
    return d

def w_constructor(cc):
    member = w_member_function(cc)
    member['cls']="constructor"
    add_if(d, cc.is_copy_constructor, "copyConstructor")
    #member["trivialConstructor"] = cc.is_trivial_constructor
    return member

def w_enum(e):
    return Dict(
        name=clean_name(e.name),
        cls="enum",
        values=str(e.values).replace("(", "[").replace(")","]"))

def w_typedef(td):
    return Dict(name=clean_name(td.name), parent=parent.name, type=str(td.type), cls="typedef")

def select_module(module, name):
    #print module
    if name.startswith(module):
        return True
    if name.startswith("Handle_" + module):
        return True
    #print "FOUND", name
    return False

def add_if(d, value, name):
    if(value):
        d["virtual"] = name

def s_class(module):
    def select(obj):
        #print obj, obj.name
        return select_module(module, obj.name)
    return select
    #return lambda obj:

def s_typedef(module):
    return lambda obj: select_module(module, obj.name)

def s_enum(module):
    return lambda obj: select_module(module, obj.name)


def w_base(info):
    d = Dict(
    name=info.related_class.name,
    access=info.access,
    )
    add_if(d, info.is_virtual, "virtual")
    return d
def with_parent(parent, fn):
    def f(obj):
        return fn(obj, parent)
    return f

def w_class(cls):
    return Dict(name=cls.name,
        bases=[w_base(b) for b in cls.bases],
        abstract=cls.is_abstract,
        artificial=cls.is_artificial,
        location=cls.location.as_tuple(),
        cls="class",
        #operators=iter(cls.operators(), w_operator),
        # enums=iter(cls.enums(), w_enum),
        # #typedefs=iter(cls.typedefs(), w_typedef),
        #
        # constructors=iter(cls.constructors(), w_constructor),
        members=iter(cls.member_functions(), with_parent(cls, w_member_function)),

        #variables=iter(cls.variables(), w_variable)
        )

def w_module(ns, name):
    return Dict(
        name=name,
        classes=iter(ns.classes(s_class(name), allow_empty=True), w_class),
        typedefs=iter(ns.typedefs(s_typedef(name), allow_empty=True), w_typedef),
        enums=iter(ns.enums(s_enum(name), allow_empty=True), w_enum),
    )
module = Module("gp", "")
data = w_module(module.ns, module.name)


def wrapped_classes(module):
    def include(cls):
        if not (cls.name.startswith(module.name) or cls.name.startswith("Handle_" + module.name)):
            return False
        return True
    classes = list(module.ns.classes(include))

    return classes


    #return json.JSONEncoder.default(self, obj)
import yaml
classes = wrapped_classes(module)
with open("config/gp_tree.json", "w") as f:
    f.write(json.dumps(data, sort_keys=False, indent=2))
