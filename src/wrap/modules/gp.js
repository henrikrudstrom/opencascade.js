require('../common.js');
var conf = require('../conf.js');

conf.ignore('*gp_VectorWithNullMagnitude');

conf.rename('gp_Ax1', 'Axis');
conf.rename('gp_Ax2', 'Frame');
conf.rename('gp_Ax22d', 'Frame2d');
conf.rename('gp_Ax2d', 'Axis2d');
conf.rename('gp_Ax3', 'FrameLeft');
conf.rename('gp_Circ', 'Circle');
conf.rename('gp_Circ2d', 'Circle2d');
conf.rename('gp_Cone', 'Cone');
conf.rename('gp_Cylinder', 'Cylinder');
conf.rename('gp_Dir', 'Dir');
conf.rename('gp_Dir2d', 'Dir');
conf.rename('gp_Elips', 'Ellipse');
conf.rename('gp_Elips2d', 'Ellipse2d');
conf.rename('gp_EulerSequence', 'EulerSequence');
conf.rename('gp_GTrsf', 'Transform');
conf.rename('gp_GTrsf2d', 'Transform2d');
conf.rename('gp_Hypr', 'Hyperbola');
conf.rename('gp_Hypr2d', 'Hyperbola2d');
conf.rename('gp_Lin', 'Line');
conf.rename('gp_Lin2d', 'Line2d');
conf.rename('gp_Mat', 'Matrix');
conf.rename('gp_Mat2d', 'Matrix2d');
conf.rename('gp_Parab', 'Parabola');
conf.rename('gp_Parab2d', 'Parabola2d');
conf.rename('gp_Pln', 'Plane');
conf.rename('gp_Pnt', 'Point');
conf.rename('gp_Pnt2d', 'Point2d');
conf.rename('gp_Quaternion', 'Quaternion');
conf.rename('gp_QuaternionNLerp', 'QuaternionNLerp');
conf.rename('gp_QuaternionSLerp', 'QuaternionSLerp');
conf.rename('gp_Sphere', 'Sphere');
conf.rename('gp_Torus', 'Torus');
conf.rename('gp_Trsf', 'Trsf');
conf.rename('gp_Trsf2d', 'Trsf2d');
conf.rename('gp_TrsfForm', 'TransformForm');
conf.rename('gp_Vec', 'Vector');
conf.rename('gp_Vec2d', 'Vector2d');
conf.rename('gp_VectorWithNullMagnitude', 'VectorWithNullMagnitude');
conf.rename('gp_XY', 'XY');
conf.rename('gp_XYZ', 'XYZ');


const trsfs = ['Mirror', 'Rotate', 'Scale', 'Transform', 'Translate'];
trsfs.forEach((trsf) => {
  var self = trsf.replace(/e$/, '') + 'ed';
  conf.ignore(trsf);
  conf.rename(self, trsf)
});
