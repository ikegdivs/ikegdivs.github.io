
//--------------------------------------------------
// Macro to test for successful allocation of memory
//--------------------------------------------------
function  MEMCHECK(x)  {(((x) == NULL) ? 101 : 0 )}

//--------------------------------------------------
// Macro to free a non-null pointer
//--------------------------------------------------
function  FREE(x) { if (x) { free(x); x = NULL; } }

//---------------------------------------------------
// Conversion macros to be used in place of functions
//---------------------------------------------------
function ABS(x)   {(((x)<0) ? -(x) : (x))  }        /* absolute value of x   */
function MIN(x,y) {(((x)<=(y)) ? (x) : (y))  }      /* minimum of x and y    */
function MAX(x,y) {(((x)>=(y)) ? (x) : (y)) }       /* maximum of x and y    */
function MOD(x,y) {((x)%(y))     }                  /* x modulus y           */
function LOG10(x) {((x) > 0.0 ? log10((x)) : (x))}  /* safe log10 of x       */
function SQR(x)   {((x)*(x))}                       /* x-squared             */
function SGN(x)   {(((x)<0) ? (-1) : (1))}          /* sign of x             */
function SIGN(x,y) {((y) >= 0.0 ? fabs(x) : -fabs(x))}
function UCHAR(x) {(((x) >= 'a' && (x) <= 'z') ? ((x)&~32) : (x))}
                                                 /* uppercase char of x   */
function ARRAY_LENGTH(x) {(sizeof(x)/sizeof(x[0]))} /* length of array x     */

//-------------------------------------------------
// Macro to evaluate function x with error checking
//-------------------------------------------------
function CALL(x) {(ErrorCode = ((ErrorCode>0) ? (ErrorCode) : (x)))}

