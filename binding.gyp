{



    "targets": [
        {
          "target_name": "gp",
          "sources": [ "cmake-build/Unix/x86_64-MinSizeRel-64/gpJAVASCRIPT_wrap.cxx" ],
              'include_dirs': [
                '/home/henrik/OCE/include/oce',
              ],
              'cflags': [
                # '-DCSFDB', '-DHAVE_CONFIG_H', '-DOCC_CONVERT_SIGNALS', '-D_OCC64', '-Dgp_EXPORTS', '-Os', '-DNDEBUG', '-fPIC',
                '-fpermissive'
              ],
              'cflags!': [ '-fno-exceptions' ],
              'cflags_cc!': [ '-fno-exceptions' ],
              'libraries': [
                  '-L/home/henrik/OCE/lib/',
                   '-lTKMath',
                #   #'-L/home/henrik/OCE/lib/',
                   '-lTKernel',
                #   '-llibTKAdvTools',
                #   '-llibTKG2d',
                #   '-llibTKG3d',
                #   '-llibTKGeomBase',
                #   '-llibTKBRep',
                #   '-llibTKGeomAlgo',
                #   '-llibTKTopAlgo',
                #   '-llibTKPrim',
                #   '-llibTKBO',
                #   '-llibTKHLR',
                #   '-llibTKMesh',
                #   '-llibTKShHealing',
                #   '-llibTKBool',
                #   '-llibTKXMesh',
                #   '-llibTKFillet',
                #   '-llibTKFeat',
                #   '-llibTKOffset'
              ],
        }
    ]
}

# /usr/bin/c++   -DCSFDB -DHAVE_CONFIG_H -DOCC_CONVERT_SIGNALS -D_OCC64 -Dgp_EXPORTS -Os -DNDEBUG -fPIC
# -I/home/henrik/Development/pythonocc-core -I/usr/include/node
# -I/home/henrik/OCE/inc/oce    -o CMakeFiles/gp.dir/Unix/x86_64-MinSizeRel-64/gpJAVASCRIPT_wrap.cxx.o
# -c /home/henrik/Development/pythonocc-core/cmake-build/Unix/x86_64-MinSizeRel-64/gpJAVASCRIPT_wrap.cxx
