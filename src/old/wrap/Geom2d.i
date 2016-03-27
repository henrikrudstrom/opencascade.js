%include ../common/ModuleHeader.i
%include ../gen/Geom2d/includes.i
//should not be needed but...
%include ../gen/Standard/includes.i

%import "Standard.i"
%import "gp.i"

%include ../gen/Geom2d/renames.i



%module (package="OCC") Geom2d

//%rename(Point2d) Geom2d_Point;

%include ../gen/Geom2d/classes/Geom2d_Point.i
%include ../gen/Geom2d/classes/Geom2d_Vector.i
%include ../gen/Geom2d/classes/Geom2d_Geometry.i
%include ../gen/Geom2d/classes/Geom2d_Curve.i
%include ../gen/Geom2d/classes/Geom2d_Line.i
%include ../gen/Geom2d/classes/Handle_Geom2d_Geometry.i
%include ../gen/Geom2d/classes/Handle_Geom2d_Curve.i
%include ../gen/Geom2d/classes/Handle_Geom2d_Line.i

%extend Handle_Geom2d_Line {
    Geom2d_Line* GetObject() {
      return (Geom2d_Line*)$self->Access();
    }
};
