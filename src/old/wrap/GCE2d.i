%include ../common/ModuleHeader.i
%include ../gen/GCE2d/includes.i

%import "Standard.i"
%import "gp.i"
%import "Geom2d.i"


%rename(MakeLine) GCE2d_MakeLine;
%rename(value) GCE2d_MakeLine::Value;


%module (package="OCC") Geom2d

//%rename(Point2d) Geom2d_Point;

%include ../gen/GCE2d/classes/GCE2d_MakeLine.i
