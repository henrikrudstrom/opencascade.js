
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


class Module:
    def __init__(self, name, output_path):
        self.name = name
        self.output_path = output_path
        self.files = glob(oce_include + "/" + module_name + "_*.hxx")
        self.files = filter(lambda f: not ignore(f), self.files)
        self.ns = parse.parse_files(oce_include, self.files)

    def write(self, path, src):
        path = os.path.join(self.output_path, self.name, path)
        #print "Write: " + path
        folder = os.path.dirname(path)
        if(not os.path.exists(folder)):
            os.makedirs(folder)

        with open(path, 'w') as f:
            f.write(src)


class_template = template.t_class
includes_template = template.t_includes


ignore_headers = []
with open("config/ignore_headers.json", 'r') as f:
    ignore_headers = json.loads(f.read())


def ignore(name):
    # print("IGNORE:", name)
    name = name.replace(".hxx", "")
    name = name.replace(oce_include + "/", "")
    name = normalize_class_name(name)
    ignored = name in ignore_headers
    if(ignored):
        print "IGNORED: " + name
    return ignored


def wrapped_classes(module):
    def include(cls):
        if not (cls.name.startswith(module.name) or cls.name.startswith("Handle_" + module.name)):
            return False
        if ignore(cls.name):
            return False
        return True
    classes = list(module.ns.classes(include))

    return classes


def normalize_class_name(name):
    return re.sub("<\w+>", "", name)


def filter_members(members):
    return members(
        lambda f: f.access_type == "public" and f.virtuality == 'not virtual' and not f.name.startswith(
            "_"),
        allow_empty=True)


def generate_module_members(module):
    def tmpl(mod, clsname):
        return "%include ../gen/" + mod + "/classes/" + clsname + ".i"
    includes = [tmpl(module.name, cls.name) for cls in wrapped_classes(module)]
    src = "\n".join(includes)
    module.write("members.i", src)


def generate_renames(module):
    renames = []
    for cls in wrapped_classes(module):
        new_name = cls.name.replace(module.name + "_", "")
        renames.append(template.t_rename.render(
            name=cls.name, new_name=new_name))

        for f in filter_members(cls.member_functions):
            renames.append(template.t_rename.render(
                name=cls.name + "::" + f.name,
                new_name=f.name[0].lower() + f.name[1:]))
    src = "\n".join(renames)
    module.write("renames.i", src)


def generate_classes(module):
    for cls in wrapped_classes(module):
        constructors = []
        if not cls.is_abstract:
            for func in filter_members(cls.constructors):
                constructors.append(func)
        functions = list(filter_members(cls.member_functions))
        typedefs = list(cls.typedefs(allow_empty=True))
        src = class_template.render(
            cls=cls,
            constructors=constructors,
            functions=functions,
            typedefs=typedefs)
        module.write(os.path.join("classes", cls.name + ".i"), src)


def generate_headers(module):
    all_modules = {}
    with open("config/dependencies.json", "r") as f:
        all_modules = json.loads(f.read()).keys()

    all_modules += ["Handle_" + m for m in all_modules]
    regexp = "|".join(all_modules)
    print "REGEXP" + regexp
    dependencies = []

    for cls in module.ns.classes(lambda c: re.match(regexp, c.name)):
        dep = normalize_class_name(cls.name)
        if ignore(dep):
            continue
        dependencies.append(dep + ".hxx")

    src = includes_template.render(includes=dependencies, name=module.name)
    module.write("includes.i", src)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        module_name = sys.argv[1]
    if len(sys.argv) > 2:
        output_path = sys.argv[2]
    module = Module(module_name, output_path)
    generate_classes(module)
    generate_headers(module)
    generate_renames(module)
    generate_module_members(module)
