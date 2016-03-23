
import os
import json
from glob import glob
import parse
import re
import sys
from pygccxml import declarations
import template
from mako.template import Template


oce_include = "/home/henrik/OCE/include/oce"


def load_template(name):
    path = os.path.join("scripts/templates", name)
    with open(path, "r") as f:
        return Template(f.read())

class_template = template.t_class
includes_template = template.t_includes

ignore_headers = []
with open("config/ignore_headers.json", 'r') as f:
    ignore_headers = json.loads(f.read())


def ignore(name):
    # print("IGNORE:", name)
    name = name.replace(".hxx", "")
    name = name.replace(oce_include + "/", "")
    name = re.sub("<\w+>", "", name)
    ignored = name in ignore_headers
    return ignored


def clean_arg(arg):
    if("const" in arg):
        arg = "const " + arg.replace("const ", "")
    return arg


def calldef_swig(calldef):
    name = declarations.algorithm.full_name(calldef)
    if name[:2] == "::":
        name = name[2:]
    # Add the arguments...
    args = [clean_arg(str(a)) for a in calldef.arguments]

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


def constructor_swig(cons):
    res = calldef_swig(cons)

    return res


def filter_members(members):
    return members(
        lambda f: f.access_type == "public" and f.virtuality == 'not virtual',
        allow_empty=True)


def generate_class(cls):
    constructors = []
    if not cls.is_abstract:
        for func in filter_members(cls.constructors):
            constructors.append(func)
    print constructors
    code = class_template.render(
        cls=cls,
        constructors=constructors,
        functions=filter_members(cls.member_functions))
    return code.strip()


def generate_headers(name):
    all_modules = {}
    with open("config/dependencies.json", "r") as f:
        all_modules = json.loads(f.read())

    regexp = "|".join(all_modules.keys())

    dependencies = []

    for cls in global_namespace.classes(lambda c: re.match(regexp, c.name)):
        dep = re.sub("<\w+>", "", cls.name) + ".hxx"
        if ignore(dep):
            continue
        dependencies.append(dep)
    return includes_template.render(includes=dependencies, name=name)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print "please specfy module name and output path"

    module_name = sys.argv[1]
    output_path = sys.argv[2]
    files = glob(oce_include + "/" + module_name + "_*.hxx")
    files = filter(lambda f: not ignore(f), files)
    global_namespace = parse.parse_files(oce_include, files)

    def write(path, src):
        path = os.path.join(output_path, path)
        folder = os.path.dirname(path)
        if(not os.path.exists(folder)):
            os.makedirs(folder)

        with open(path, 'w') as f:
            f.write(src)

    classes = list(global_namespace.classes(
        lambda cls: cls.name.startswith(module_name)))

    include_classes = ""
    for class_ in classes:
        if ignore(class_.name):
             continue

        src = generate_class(class_).replace("%%", "%")

        path = "classes/"+class_.name+".i"
        write(os.path.join(module_name, path), src)
        include_classes += "%include " + path + "\n"

    src = generate_headers(module_name)
    write(module_name + "/includes.i", src)
    src = include_classes
    write(module_name + "/members.i", src)
