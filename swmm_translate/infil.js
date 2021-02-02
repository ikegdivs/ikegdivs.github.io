//-----------------------------------------------------------------------------
//   infil.h
//
//   Project: EPA SWMM5
//   Version: 5.1
//   Date:    03/20/14   (Build 5.1.001)
//            09/15/14   (Build 5.1.007)
//            08/05/15   (Build 5.1.010)
//            05/10/18   (Build 5.1.013)
//            04/01/20   (Build 5.1.015)
//   Author:  L. Rossman (US EPA)
//
//   Public interface for infiltration functions.
//
//   Build 5.1.010:
//   - New Modified Green Ampt infiltration option added.
//
//   Build 5.1.013:
//   - New function infil_setInfilFactor() added.
//
//   Build 5.1.015:
//   - Support added for multiple infiltration methods within a project.
//-----------------------------------------------------------------------------

//---------------------
// Enumerated Constants
//---------------------
//enum InfilType {
var HORTON = 0                     // Horton infiltration
var MOD_HORTON = 1                 // Modified Horton infiltration
var GREEN_AMPT = 2                 // Green-Ampt infiltration
var MOD_GREEN_AMPT = 3             // Modified Green-Ampt infiltration
var CURVE_NUMBER = 4               // SCS Curve Number infiltration

//---------------------
// Horton Infiltration
//---------------------
class THorton
{
    constructor(){
        this.f0;              // initial infil. rate (ft/sec)
        this.fmin;            // minimum infil. rate (ft/sec)
        this.Fmax;            // maximum total infiltration (ft);
        this.decay;           // decay coeff. of infil. rate (1/sec)
        this.regen;           // regeneration coeff. of infil. rate (1/sec)
        //-----------------------------
        this.tp;              // present time on infiltration curve (sec)
        this.Fe;              // cumulative infiltration (ft)
    }
}  ;


//-------------------------
// Green-Ampt Infiltration
//-------------------------
class TGrnAmpt
{
    constructor(){
        this.S;               // avg. capillary suction (ft)
        this.Ks;              // saturated conductivity (ft/sec)
        this.IMDmax;          // max. soil moisture deficit (ft/ft)
        //-----------------------------
        this.IMD;             // current initial soil moisture deficit
        this.F;               // current cumulative infiltrated volume (ft)
        this.Fu;              // current upper zone infiltrated volume (ft)
        this.Lu;              // depth of upper soil zone (ft)
        this.T;               // time until start of next rain event (sec)
        this.Sat;             // saturation flag
    }
}  ;


//--------------------------
// Curve Number Infiltration
//--------------------------
class TCurveNum
{
    constructor(){
        this.Smax;            // max. infiltration capacity (ft)
        this.regen;           // infil. capacity regeneration constant (1/sec)
        this.Tmax;            // maximum inter-event time (sec)
        //-----------------------------
        this.S;               // current infiltration capacity (ft)
        this.F;               // current cumulative infiltration (ft)
        this.P;               // current cumulative precipitation (ft)
        this.T;               // current inter-event time (sec)
        this.Se;              // current event infiltration capacity (ft)
        this.f;               // previous infiltration rate (ft/sec)
    }
}  ;

//-----------------------------------------------------------------------------
//   Exported Variables
//-----------------------------------------------------------------------------
// type: THorton
var  HortInfil;
// type: TGrnAmpt
var  GAInfil;
// type: TCurveNum
var  CNInfil;
