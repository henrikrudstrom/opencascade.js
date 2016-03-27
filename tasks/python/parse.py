from pygccxml import utils
from pygccxml import declarations
from pygccxml import parser
import os, json
from glob import glob


def parse_files(path, files):
    # Find the location of the xml generator (castxml or gccxml)
    #generator_path, generator_name = utils.find_xml_generator()
    #print("GENER " + generator_path)
    # Configure the xml generator
    xml_generator_config = parser.xml_generator_configuration_t(
        xml_generator_path="/usr/bin/castxml",
        xml_generator="castxml",
        include_paths=[path],
        define_symbols=[],
        keep_xml = True
    )
    def cache_file(filename):
        return parser.file_configuration_t(
            data=filename,
            content_type=parser.CONTENT_TYPE.CACHED_SOURCE_FILE,
            cached_source_file=filename.replace(path, "tmp/xml")+".xml")
    cached_files = [cache_file(f) for f in files]


    project_reader = parser.project_reader_t(xml_generator_config)
    decls = project_reader.read_files(
        cached_files,
        compilation_mode=parser.COMPILATION_MODE.ALL_AT_ONCE)

    return declarations.get_global_namespace(decls)
