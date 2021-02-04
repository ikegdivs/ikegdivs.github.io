
//--------------------------------------------------
// Macro to test for successful allocation of memory
//--------------------------------------------------
function  MEMCHECK(x)  {(((x) == null) ? 101 : 0 )}

//--------------------------------------------------
// Macro to free a non-null pointer
//--------------------------------------------------
function  FREE(x) { if (x) { free(x); x = null; } }

//---------------------------------------------------
// Conversion macros to be used in place of functions
//---------------------------------------------------
function ABS(x)   { return (((x)<0) ? -(x) : (x))  }        /* absolute value of x   */
function MIN(x,y) { return (((x)<=(y)) ? (x) : (y))  }      /* minimum of x and y    */
function MAX(x,y) { return (((x)>=(y)) ? (x) : (y)) }       /* maximum of x and y    */
function MOD(x,y) { return ((x)%(y))     }                  /* x modulus y           */
function LOG10(x) { return ((x) > 0.0 ? log10((x)) : (x))}  /* safe log10 of x       */
function SQR(x)   { return ((x)*(x))}                       /* x-squared             */
function SGN(x)   { return (((x)<0) ? (-1) : (1))}          /* sign of x             */
function SIGN(x,y) { return ((y) >= 0.0 ? fabs(x) : -fabs(x))}
function UCHAR(x) { return (((x) >= 'a' && (x) <= 'z') ? ((x)&~32) : (x))}
                                                 /* uppercase char of x   */
function ARRAY_LENGTH(x) {(sizeof(x)/sizeof(x[0]))} /* length of array x     */

//-------------------------------------------------
// Macro to evaluate function x with error checking
//-------------------------------------------------
function CALL(x) { return (ErrorCode = ((ErrorCode>0) ? (ErrorCode) : (x)))}

function fopen(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if(xmlhttp.status==200){
        result = xmlhttp.responseText;
    }
    return result;
}
