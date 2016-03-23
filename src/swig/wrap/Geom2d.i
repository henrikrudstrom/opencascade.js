%include ../common/ModuleHeader.i
%include ../gen/Geom2d/includes.i

%include Standard.i
%include gp.i

%module (package="OCC") Geom2d

%rename(Point2d) Geom2d_Point;

%include ../gen/Geom2d/classes/Geom2d_Point.i
