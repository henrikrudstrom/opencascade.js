%include ../common/ModuleHeader.i
%include ../gen/gp/includes.i
%include Standard.i

%include ../gen/gp/renames.i
%rename(Point2d) gp_Pnt2d;
%rename(Vector2d) gp_Vec2d;
%rename(x) gp_XY::X;
%rename(y) gp_XY::Y;
%rename(set) gp_XY::SetCoord;


%ignore SetCoord(const Standard_Integer Index, const Standard_Real Xi);
%ignore Coord(const Standard_Integer Index) const;
%ignore Coord(Standard_Real & X, Standard_Real & Y) const;


%module (package="OCC") gp

%include ../gen/gp/classes/gp_XY.i
%include ../gen/gp/classes/gp_Pnt2d.i
%include ../gen/gp/classes/gp_Vec2d.i
