{
    "targets": [
        {
          "target_name": "gp",
          "sources": [ "build/swig/gp_wrap.cxx" ],
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
