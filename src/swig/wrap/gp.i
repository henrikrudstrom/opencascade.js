%include ../common/ModuleHeader.i
%include ../gen/gp/includes.i
%include Standard.i


%rename(XY) gp_XY;
%rename(Point2d) gp_Pnt2d;
%rename(Vector2d) gp_Vec2d;

%module (package="OCC") gp

%include ../gen/gp/classes/gp_XY.i
%include ../gen/gp/classes/gp_Pnt2d.i
%include ../gen/gp/classes/gp_Vec2d.i
