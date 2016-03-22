%include Standard.i
%include ../gen/gp/includes.i
%module (package="OCC") gp

#pragma SWIG nowarn=504,325,503

%{
#ifdef WNT
#pragma warning(disable : 4716)
#endif
%}
%include ../common/CommonIncludes.i
%include ../common/ExceptionCatcher.i
/*%include ../common/FunctionTransformers.i*/
%include ../common/Operators.i

%include ../gen/gp/classes/gp_XY.i
