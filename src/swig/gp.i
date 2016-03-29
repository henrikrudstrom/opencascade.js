//include me!
%attribute(gp_XY, double, x, X, SetX);
%extend gp_Quaternion {
  const gp_Quaternion interpolateLinear(const gp_Quaternion &b, Standard_Real t){
    return gp_QuaternionNLerp::Interpolate(*$self, b, t);
  }

  const gp_Quaternion interpolateSpherical(const gp_Quaternion &b, Standard_Real t){
    gp_QuaternionSLerp* lerp = new gp_QuaternionSLerp(*$self, b);
    gp_Quaternion res;
    lerp->Interpolate(t, res);
    return res;
  }
}
