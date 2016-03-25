{
    "targets": [
        {
          "include_dirs": [
            "/home/henrik/OCE/include/oce"
            ],
          "cflags": [
            "-DCSFDB", "-DHAVE_CONFIG_H", "-DOCC_CONVERT_SIGNALS", "-D_OCC64", "-Dgp_EXPORTS", "-Os", "-DNDEBUG", "-fPIC",
            "-fpermissive",
            "-DSWIG_TYPE_TABLE=occ.js"
          ],
          "cflags!": ["-fno-exceptions"],
          "cflags_cc!": ["-fno-exceptions"],
          "libraries": [
              "-L/home/henrik/OCE/lib/",
               "-lTKMath",
               "-lTKernel",
               "-lTKAdvTools",
               "-lTKG2d",
               "-lTKG3d",
               "-lTKGeomBase",
               "-lTKBRep",
               "-lTKGeomAlgo",
               "-lTKTopAlgo",
               "-lTKPrim",
               "-lTKBO",
               "-lTKHLR",
               "-lTKMesh",
               "-lTKShHealing",
               "-lTKBool",
               "-lTKXMesh",
               "-lTKFillet",
               "-lTKFeat",
               "-lTKOffset"
               ]
        }
    ]
}
