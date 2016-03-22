import json
import os
import imp
import sys
from glob import glob
oce_include = "/home/henrik/OCE/include/oce"
Modules = imp.load_source('Modules', os.path.join(sys.argv[1],"Modules.py"))
#From python-occ
HXX_TO_EXCLUDE = ['TCollection_AVLNode.hxx',
                  'AdvApp2Var_Data_f2c.hxx',
                  'NCollection_DataMap.hxx',
                  'NCollection_DoubleMap.hxx',
                  'NCollection_IndexedDataMap.hxx',
                  'NCollection_IndexedMap.hxx', 'NCollection_Map.hxx',
                  'NCollection_CellFilter.hxx',
                  'NCollection_EBTree.hxx',
                  'NCollection_BaseSequence.hxx',
                  'NCollection_Haft.h',
                  'Standard_StdAllocator.hxx',
                  'PLib_HermitJacobi.hxx',
                  'BndLib_Compute.hxx',
                  'BOPTools_DataMapOfShapeSet.hxx',
                  'Resource_gb2312.h', 'Resource_Shiftjis.h',
                  'TopOpeBRepBuild_SplitShapes.hxx',
                  'TopOpeBRepBuild_SplitSolid.hxx',
                  'TopOpeBRepBuild_Builder.hxx',
                  'TopOpeBRepBuild_SplitEdge.hxx',
                  'TopOpeBRepBuild_Fill.hxx',
                  'TopOpeBRepBuild_SplitFace.hxx',
                  'TopOpeBRepDS_traceDSX.hxx',
                  'ChFiKPart_ComputeData_ChAsymPlnCon.hxx',
                  'ChFiKPart_ComputeData_ChAsymPlnCyl.hxx',
                  'ChFiKPart_ComputeData_ChAsymPlnPln.hxx',
                  'ChFiKPart_ComputeData_ChPlnCon.hxx',
                  'ChFiKPart_ComputeData_ChPlnCyl.hxx',
                  'ChFiKPart_ComputeData_ChPlnPln.hxx',
                  'ChFiKPart_ComputeData_Sphere.hxx',
                  'V3d_Plane.hxx',
                  'AIS_ColoredShape.hxx',
                  'Font_FTFont.hxx', 'Font_FTLibrary.hxx',
                  'IntTools_LineConstructor.hxx',
                  'IntTools_PolyhedronTool.hxx',
                  'IntPatch_PolyhedronTool.hxx',
                  'IntPatch_TheInterfPolyhedron.hxx',
                  'SelectMgr_CompareResults.hxx',
                  'InterfaceGraphic_wntio.hxx',
                  'Interface_STAT.hxx',
                  'Aspect_DisplayConnection.hxx',
                  'XSControl_Vars.hxx',
                  'MeshVS_Buffer.hxx',
                  'SMDS_SetIterator.hxx',
                  'SMESH_Block.hxx',
                  'SMESH_ExceptHandlers.hxx', 'StdMeshers_Penta_3D.hxx',
                  'SMESH_ControlsDef.hxx',
                  'SMESH_Algo.hxx',
                  'SMESH_0D_Algo.hxx', 'SMESH_1D_Algo.hxx',
                  'SMESH_2D_Algo.hxx',
                  'SMESH_3D_Algo.hxx',
                  'IntTools_CurveRangeSampleMapHasher.hxx',
                  'Quantity_Color_1.hxx',
                  'Interface_ValueInterpret.hxx'
                  ]
output_path = sys.argv[2]


def process_deps():
    all_modules = Modules.OCE_MODULES
    deps = {}
    for module in all_modules:
        #if(len(module[1]) > 0):
        deps[module[0]] = module[1]
        # {
        #     "name": module[0],
        #     "dependencies": module[1],
        #     "exclude_classes": module[2],
        #     "exclude_members": exclude_members
        #     }


    with open(os.path.join(output_path, "dependencies.json"), 'w') as f:
        f.write(json.dumps(deps, sort_keys=True, indent=4));
def process_ignore():
    all_modules = Modules.OCE_MODULES
    ignore = []
    for module in all_modules:
        #if(len(module[1]) > 0):
        if(len(module[2]) == 1 and module[2][0] == "*"):
            ignore.append(module[0]+"_*")
        else:
            ignore += [m for m in module[2]]
    ignore += HXX_TO_EXCLUDE
    ignore = sorted(ignore)
    ignore = [i.replace(".hxx", "") for i in ignore]
    with open(os.path.join(output_path, "ignore_headers.json"), 'w') as f:
        f.write(json.dumps(ignore, sort_keys=True, indent=4));



def process_toolkit(toolkit_name):
    """ Generate wrappers for modules depending on a toolkit
    For instance : TKernel, TKMath etc.
    """
    modules_list=TOOLKITS[toolkit_name]
    for module in modules_list:
        process_module(module)




process_deps()
process_ignore()
