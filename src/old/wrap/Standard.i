%include ../common/ModuleHeader.i
%include ../gen/Standard/includes.i

%module (package="OCC") Standard
%ignore SetCallBackFunction;
%include ../gen/Standard/members.i

/* typedefs */
typedef bool Standard_Boolean;
typedef const char * Standard_CString;
typedef Standard_ExtCharacter * Standard_PExtCharacter;
typedef std::time_t Standard_Time;
typedef unsigned char Standard_Byte;
typedef void * Standard_Address;
typedef uint16_t Standard_Utf16Char;
typedef GUID Standard_UUID;
typedef short Standard_ExtCharacter;
typedef double Standard_Real;
typedef Standard_ErrorHandler * Standard_PErrorHandler;
typedef int Standard_Integer;
typedef char Standard_Utf8Char;
typedef Standard_Character * Standard_PCharacter;
typedef pthread_t Standard_ThreadId;
typedef float Standard_ShortReal;
typedef wchar_t Standard_WidesdfsdfChar;
typedef char Standard_Character;
typedef unsigned char Standard_Utf8UChar;
typedef uint32_t Standard_Utf32Char;
typedef Standard_Persistent * Standard_OId;
typedef strstream Standard_SStream;
typedef Standard_Byte * Standard_PByte;
typedef const short * Standard_ExtString;
typedef unsigned __int32 uint32_t;
typedef size_t Standard_Size;
typedef ostream Standard_OStream;
typedef unsigned __int16 uint16_t;


/*%include ../gen/Standard/classes/Handle_Standard_Type.i
%include ../gen/Standard/classes/Standard_Type.i
%include ../gen/Standard/classes/Handle_Standard_Transient.i
%include ../gen/Standard/classes/Standard_Transient.i
%include ../gen/Standard/classes/Handle_Standard_Persistent.i
%include ../gen/Standard/classes/Standard_ErrorHandlerCallback.i
%include ../gen/Standard/classes/Standard_ErrorHandler.i
%include ../gen/Standard/classes/Standard_Storable.i
%include ../gen/Standard/classes/Standard_GUID.i*/
//typedef void(* 	TPCallBackFunc) (const Standard_Boolean theIsAlloc, const Standard_Address theStorage, const Standard_Size theRoundSize, const Standard_Size theSize);


/*%ignore ::Standard_MMgrRaw;
%ignore ::Standard_MMgrRoot;
%ignore ::Standard_MMgrTBBalloc;
%ignore ::Handle_Standard_MMgrOpt;
%ignore ::Handle_Standard_MMgrRaw;
%ignore ::Handle_Standard_MMgrRoot;
%ignore ::Handle_Standard_MMgrTBBalloc;*/
