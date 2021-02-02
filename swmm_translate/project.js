//-----------------------------------------------------------------------------
//   project.c
//
//   Project:  EPA SWMM5
//   Version:  5.1
//   Date:     03/19/14  (Build 5.1.000)
//             04/14/14  (Build 5.1.004)
//             09/15/14  (Build 5.1.007)
//             03/19/15  (Build 5.1.008)
//             04/30/15  (Build 5.1.009)
//             08/01/16  (Build 5.1.011)
//             03/14/17  (Build 5.1.012)
//             05/10/18  (Build 5.1.013)
//             04/01/20  (Build 5.1.015)
//   Author:   L. Rossman
//
//   Project management functions.
//
//   This module provides project-related services such as:
//   o opening a new project and reading its input data
//   o allocating and freeing memory for project objects
//   o setting default values for object properties and options
//   o initializing the internal state of all objects
//   o managing hash tables for identifying objects by ID name
//
//   Build 5.1.004:
//   - Ignore RDII option added.
//
//   Build 5.1.007:
//   - Default monthly adjustments for climate variables included.
//   - User-supplied GW flow equations initialized to null.
//   - Storage node exfiltration object initialized to null.
//   - Freeing of memory used for storage node exfiltration included.
//
//   Build 5.1.008:
//   - Constants used for dynamic wave routing moved to dynwave.c.
//   - Input processing of minimum time step & number of
//     parallel threads for dynamic wave routing added.
//   - Default values of hyd. conductivity adjustments added.
//   - Freeing of memory used for outfall pollutant load added.
//
//   Build 5.1.009:
//   - Fixed bug in computing total duration introduced in 5.1.008.
//
//   Build 5.1.011:
//   - Memory management of hydraulic event dates array added.
//
//   Build 5.1.012:
//   - Minimum conduit slope option initialized to 0 (none).
//   - NO/YES no longer accepted as options for NORMAL_FLOW_LIMITED.
//
//   Build 5.1.013:
//   - omp_get_num_threads function protected against lack of compiler
//     support for OpenMP.
//   - Rain gage validation now performed after subcatchment validation.
//   - More robust parsing of MinSurfarea option provided.
//   - Support added for new RuleStep analysis option.
//
//   Build 5.1.015: 
//   - Support added for multiple infiltration methods within a project.
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
//  Shared variables
//-----------------------------------------------------------------------------
var Htable; // Hash tables for object ID names
var MemPoolAllocated;      // true if memory pool allocated 

//-----------------------------------------------------------------------------
//  External Functions (declared in funcs.h)
//-----------------------------------------------------------------------------
//  project_open           (called from swmm_open in swmm5.c)
//  project_close          (called from swmm_close in swmm5.c)
//  project_readInput      (called from swmm_open in swmm5.c)
//  project_readOption     (called from readOption in input.c)
//  project_validate       (called from swmm_open in swmm5.c)
//  project_init           (called from swmm_start in swmm5.c)
//  project_addObject      (called from addObject in input.c)
//  project_createMatrix   (called from openFileForInput in iface.c)
//  project_freeMatrix     (called from iface_closeRoutingFiles)
//  project_findObject
//  project_findID

//=============================================================================

function project_open(f1, f2, f3)
//
//  Input:   f1 = pointer to name of input file
//           f2 = pointer to name of report file
//           f3 = pointer to name of binary output file
//  Output:  none
//  Purpose: opens a new SWMM project.
//
{
    initPointers();
    setDefaults();
    openFiles(f1, f2, f3);
}

//=============================================================================

function project_readInput()
//
//  Input:   none
//  Output:  none
//  Purpose: retrieves project data from input file.
//
{
    // --- create hash tables for fast retrieval of objects by ID names
    createHashTables();

    // --- count number of objects in input file and create them
    input_countObjects();
    createObjects();

    // --- read project data from input file
    input_readData();
    if ( ErrorCode ) return;

    // --- establish starting & ending date/time
    StartDateTime = StartDate + StartTime;
    EndDateTime   = EndDate + EndTime;
    ReportStart   = ReportStartDate + ReportStartTime;
    ReportStart   = MAX(ReportStart, StartDateTime);

    // --- check for valid starting & ending date/times
    if ( EndDateTime <= StartDateTime )
    {
        report_writeErrorMsg(ERR_START_DATE, "");
    }
    else if ( EndDateTime <= ReportStart )
    {
        report_writeErrorMsg(ERR_REPORT_DATE, "");
    }
    else
    {
        // --- compute total duration of simulation in seconds
        TotalDuration = floor((EndDateTime - StartDateTime) * SECperDAY);

        // --- reporting step must be <= total duration
        if ( ReportStep > TotalDuration )
        {
            ReportStep = TotalDuration;
        }

        // --- reporting step can't be < routing step
        if ( ReportStep < RouteStep )
        {
            report_writeErrorMsg(ERR_REPORT_STEP, "");
        }

        // --- convert total duration to milliseconds
        TotalDuration *= 1000.0;
    }
}

//=============================================================================

function project_validate()
//
//  Input:   none
//  Output:  none
//  Purpose: checks validity of project data.
//
{
    let i;
    let j;
    let err;

    // --- validate Curves and TimeSeries
    for ( i=0; i<Nobjects[CURVE]; i++ )
    {
         err = table_validate(Curve[i]);
         if ( err ) report_writeErrorMsg(ERR_CURVE_SEQUENCE, Curve[i].ID);
    }
    for ( i=0; i<Nobjects[TSERIES]; i++ )
    {
        err = table_validate(Tseries[i]);
        if ( err ) report_writeTseriesErrorMsg(err, Tseries[i]);
    }

    // --- validate hydrology objects
    //     (NOTE: order is important !!!!)
    climate_validate();
    lid_validate();
    if ( Nobjects[SNOWMELT] == 0 ) IgnoreSnowmelt = true;
    if ( Nobjects[AQUIFER]  == 0 ) IgnoreGwater   = true;
    for ( i=0; i<Nobjects[AQUIFER]; i++ )  gwater_validateAquifer(i);
    for ( i=0; i<Nobjects[SUBCATCH]; i++ ) subcatch_validate(i);
    for ( i=0; i<Nobjects[GAGE]; i++ )     gage_validate(i);                   //(5.1.013)
    for ( i=0; i<Nobjects[SNOWMELT]; i++ ) snow_validateSnowmelt(i);

    // --- compute geometry tables for each shape curve
    j = 0;
    for ( i=0; i<Nobjects[CURVE]; i++ )
    {
        if ( Curve[i].curveType == SHAPE_CURVE )
        {
            Curve[i].refersTo = j;
            Shape[j].curve = i;
            if ( !shape_validate(Shape[j], Curve[i]) )
                report_writeErrorMsg(ERR_CURVE_SEQUENCE, Curve[i].ID);
            j++;
        }
    }

    // --- validate links before nodes, since the latter can
    //     result in adjustment of node depths
    for ( i=0; i<Nobjects[NODE]; i++) Node[i].oldDepth = Node[i].fullDepth;
    for ( i=0; i<Nobjects[LINK]; i++) link_validate(i);
    for ( i=0; i<Nobjects[NODE]; i++) node_validate(i);

    // --- adjust time steps if necessary
    if ( DryStep < WetStep )
    {
        report_writeWarningMsg(WARN06, "");
        DryStep = WetStep;
    }
    if ( RouteStep > WetStep )
    {
        report_writeWarningMsg(WARN07, "");
        RouteStep = WetStep;
    }

    // --- adjust individual reporting flags to match global reporting flag
    if ( RptFlags.subcatchments == ALL )
        for (i=0; i<Nobjects[SUBCATCH]; i++) Subcatch[i].rptFlag = true;
    if ( RptFlags.nodes == ALL )
        for (i=0; i<Nobjects[NODE]; i++) Node[i].rptFlag = true;
    if ( RptFlags.links == ALL )
        for (i=0; i<Nobjects[LINK]; i++) Link[i].rptFlag = true;

    // --- validate dynamic wave options
    if ( RouteModel == DW ) dynwave_validate();

    if ( Nobjects[LINK] < 4 * NumThreads ) NumThreads = 1;                     //(5.1.008)

}

//=============================================================================

function project_close()
//
//  Input:   none
//  Output:  none
//  Purpose: closes a SWMM project.
//
{
    deleteObjects();
    deleteHashTables();
}

//=============================================================================

function  project_init()
//
//  Input:   none
//  Output:  returns an error code
//  Purpose: initializes the internal state of all objects.
// 
{
    let j;
    climate_initState();
    lid_initState();
    for (j=0; j<Nobjects[TSERIES]; j++)  table_tseriesInit(Tseries[j]);
    for (j=0; j<Nobjects[GAGE]; j++)     gage_initState(j);
    for (j=0; j<Nobjects[SUBCATCH]; j++) subcatch_initState(j);
    for (j=0; j<Nobjects[NODE]; j++)     node_initState(j);
    for (j=0; j<Nobjects[LINK]; j++)     link_initState(j);
    return ErrorCode;
}

//=============================================================================

function project_addObject(type,  id, n)
//
//  Input:   type = object type
//           id   = object ID string
//           n    = object index
//  Output:  returns 0 if object already added, 1 if not, -1 if hashing fails
//  Purpose: adds an object ID to a hash table
//
{
    let  result;
    let  len;
    let  newID;

    // --- do nothing if object already placed in hash table
    if ( project_findObject(type, id) >= 0 ) return 0;

    // --- use memory from the hash tables' common memory pool to store
    //     a copy of the object's ID string
    newID = id;

    // --- insert object's ID into the hash table for that type of object
    result = HTinsert(Htable[type], newID, n);
    if ( result == 0 ) result = -1;
    return result;
}

//=============================================================================

function project_findObject(type, id)
//
//  Input:   type = object type
//           id   = object ID
//  Output:  returns index of object with given ID, or -1 if ID not found
//  Purpose: uses hash table to find index of an object with a given ID.
//
{
    return HTfind(Htable[type], id);
}

//=============================================================================

function project_findID(type, id)
//
//  Input:   type = object type
//           id   = ID name being sought
//  Output:  returns pointer to location where object's ID string is stored
//  Purpose: uses hash table to find address of given string entry.
//
{
    return HTfindKey(Htable[type], id);
}

//=============================================================================

function project_createMatrix(nrows, ncols)
//
//  Input:   nrows = number of rows (0-based)
//           ncols = number of columns (0-based)
//  Output:  returns a pointer to a matrix
//  Purpose: allocates memory for a matrix of doubles.
//
{
    let i,j;
    let a;

    // --- allocate pointers to rows
    a = new Array(nrows);
    
    // --- allocate rows and set pointers to them
    for ( i = 1; i < nrows; i++ ) a[i] = a[i-1] + ncols;

    for ( i = 0; i < nrows; i++)
    {
        for ( j = 0; j < ncols; j++) a[i][j] = 0.0;
    }
    
    // --- return pointer to array of pointers to rows
    return a;
}

//=============================================================================

function project_freeMatrix(a)
//
//  Input:   a = matrix of floats
//  Output:  none
//  Purpose: frees memory allocated for a matrix of doubles.
//
{
    a = null;
}

//=============================================================================

function project_readOption(s1, s2)
//
//  Input:   s1 = option keyword
//           s2 = string representation of option's value
//  Output:  returns error code
//  Purpose: reads a project option from a pair of string tokens.
//
//  NOTE:    all project options have default values assigned in setDefaults().
//
{
    let k, m, h, s;
    let tStep;
    let strDate;
    let aTime;
    let aDate;

    // --- determine which option is being read
    k = findmatch(s1, OptionWords);
    if ( k < 0 ) return error_setInpError(ERR_KEYWORD, s1);
    switch ( k )
    {
      // --- choice of flow units
      case FLOW_UNITS:
        m = findmatch(s2, FlowUnitWords);
        if ( m < 0 ) return error_setInpError(ERR_KEYWORD, s2);
        FlowUnits = m;
        if ( FlowUnits <= MGD ) UnitSystem = US;
        else                    UnitSystem = SI;
        break;

      // --- choice of infiltration modeling method
      case INFIL_MODEL:
        m = findmatch(s2, InfilModelWords);
        if ( m < 0 ) return error_setInpError(ERR_KEYWORD, s2);
        InfilModel = m;
        break;

      // --- choice of flow routing method
      case ROUTE_MODEL:
        m = findmatch(s2, RouteModelWords);
        if ( m < 0 ) m = findmatch(s2, OldRouteModelWords);
        if ( m < 0 ) return error_setInpError(ERR_KEYWORD, s2);
        if ( m == NO_ROUTING ) IgnoreRouting = true;
        else RouteModel = m;
        if ( RouteModel == EKW ) RouteModel = KW;
        break;

      // --- simulation start date
      case START_DATE:
        if ( !datetime_strToDate(s2, StartDate) )
        {
            return error_setInpError(ERR_DATETIME, s2);
        }
        break;

      // --- simulation start time of day
      case START_TIME:
        if ( !datetime_strToTime(s2, StartTime) )
        {
            return error_setInpError(ERR_DATETIME, s2);
        }
        break;

      // --- simulation ending date
      case END_DATE:
        if ( !datetime_strToDate(s2, EndDate) ) 
        {
            return error_setInpError(ERR_DATETIME, s2);
        }
        break;

      // --- simulation ending time of day
      case END_TIME:
        if ( !datetime_strToTime(s2, EndTime) )
        {
            return error_setInpError(ERR_DATETIME, s2);
        }
        break;

      // --- reporting start date
      case REPORT_START_DATE:
        if ( !datetime_strToDate(s2, ReportStartDate) )
        {
            return error_setInpError(ERR_DATETIME, s2);
        }
        break;

      // --- reporting start time of day
      case REPORT_START_TIME:
        if ( !datetime_strToTime(s2, ReportStartTime) )
        {
            return error_setInpError(ERR_DATETIME, s2);
        }
        break;

      // --- day of year when street sweeping begins or when it ends
      //     (year is arbitrarily set to 1947 so that the dayOfYear
      //      function can be applied)
      case SWEEP_START:
      case SWEEP_END:
        strDate = s2;
        strDate += "/1947";
        if ( !datetime_strToDate(strDate, aDate) )
        {
            return error_setInpError(ERR_DATETIME, s2);
        }
        m = datetime_dayOfYear(aDate);
        if ( k == SWEEP_START ) SweepStart = m;
        else SweepEnd = m;
        break;

      // --- number of antecedent dry days
      case START_DRY_DAYS:
        StartDryDays = atof(s2);
        if ( StartDryDays < 0.0 )
        {
            return error_setInpError(ERR_NUMBER, s2);
        }
        break;

      // --- runoff or reporting time steps
      //     (input is in hrs:min:sec format, time step saved as seconds)
      case WET_STEP:
      case DRY_STEP:
      case REPORT_STEP:
      case RULE_STEP:                                                          //(5.1.013)
        if ( !datetime_strToTime(s2, aTime) )
        {
            return error_setInpError(ERR_DATETIME, s2);
        }
        datetime_decodeTime(aTime, h, m, s);
        h += 24*aTime;
        s = s + 60*m + 3600*h;

        // --- RuleStep allowed to be 0 while other time steps must be > 0     //(5.1.013)
        if (k == RULE_STEP)                                                    //      
        {                                                                      //
            if (s < 0) return error_setInpError(ERR_NUMBER, s2);               //
        }                                                                      //
        else if ( s <= 0 ) return error_setInpError(ERR_NUMBER, s2);           //

        switch ( k )
        {
          case WET_STEP:     WetStep = s;     break;
          case DRY_STEP:     DryStep = s;     break;
          case REPORT_STEP:  ReportStep = s;  break;
          case RULE_STEP:    RuleStep = s;    break;                           //(5.1.013)
        }
        break;

      // --- type of damping applied to inertial terms of dynamic wave routing
      case INERT_DAMPING:
        m = findmatch(s2, InertDampingWords);
        if ( m < 0 ) return error_setInpError(ERR_KEYWORD, s2);
        else InertDamping = m;
        break;

      // --- Yes/No options (NO = 0, YES = 1)
      case ALLOW_PONDING:
      case SLOPE_WEIGHTING:
      case SKIP_STEADY_STATE:
      case IGNORE_RAINFALL:
      case IGNORE_SNOWMELT:
      case IGNORE_GWATER:
      case IGNORE_ROUTING:
      case IGNORE_QUALITY:
      case IGNORE_RDII:
        m = findmatch(s2, NoYesWords);
        if ( m < 0 ) return error_setInpError(ERR_KEYWORD, s2);
        switch ( k )
        {
          case ALLOW_PONDING:     AllowPonding    = m;  break;
          case SLOPE_WEIGHTING:   SlopeWeighting  = m;  break;
          case SKIP_STEADY_STATE: SkipSteadyState = m;  break;
          case IGNORE_RAINFALL:   IgnoreRainfall  = m;  break;
          case IGNORE_SNOWMELT:   IgnoreSnowmelt  = m;  break;
          case IGNORE_GWATER:     IgnoreGwater    = m;  break;
          case IGNORE_ROUTING:    IgnoreRouting   = m;  break;
          case IGNORE_QUALITY:    IgnoreQuality   = m;  break;
          case IGNORE_RDII:       IgnoreRDII      = m;  break;
        }
        break;

      case NORMAL_FLOW_LTD: 
        m = findmatch(s2, NormalFlowWords); 
        if ( m < 0 ) return error_setInpError(ERR_KEYWORD, s2);
        NormalFlowLtd = m;
        break;

      case FORCE_MAIN_EQN:
        m = findmatch(s2, ForceMainEqnWords);
        if ( m < 0 ) return error_setInpError(ERR_KEYWORD, s2);
        ForceMainEqn = m;
        break;

      case LINK_OFFSETS:
        m = findmatch(s2, LinkOffsetWords);
        if ( m < 0 ) return error_setInpError(ERR_KEYWORD, s2);
        LinkOffsets = m;
        break;

      // --- compatibility option for selecting solution method for
      //     dynamic wave flow routing (NOT CURRENTLY USED)
      case COMPATIBILITY:
        if      ( strcomp(s2, "3") ) Compatibility = SWMM3;
        else if ( strcomp(s2, "4") ) Compatibility = SWMM4;
        else if ( strcomp(s2, "5") ) Compatibility = SWMM5;
        else return error_setInpError(ERR_KEYWORD, s2);
        break;

      // --- routing or lengthening time step (in decimal seconds)
      //     (lengthening time step is used in Courant stability formula
      //     to artificially lengthen conduits for dynamic wave flow routing
      //     (a value of 0 means that no lengthening is used))
      case ROUTE_STEP:
      case LENGTHENING_STEP:
        if ( !getDouble(s2, tStep) )
        {
            if ( !datetime_strToTime(s2, aTime) )
            {
                return error_setInpError(ERR_NUMBER, s2);
            }
            else
            {
                datetime_decodeTime(aTime, h, m, s);
                h += 24*aTime;
                s = s + 60*m + 3600*h;
                tStep = s;
            }
        }
        if ( k == ROUTE_STEP )
        {
            if ( tStep <= 0.0 ) return error_setInpError(ERR_NUMBER, s2);
            RouteStep = tStep;
        }
        else LengtheningStep = MAX(0.0, tStep);
        break;

     // --- minimum variable time step for dynamic wave routing
      case MIN_ROUTE_STEP:
        if ( !getDouble(s2, MinRouteStep) || MinRouteStep < 0.0 )
            return error_setInpError(ERR_NUMBER, s2);
        break;

      case NUM_THREADS:
        m = atoi(s2);
        if ( m < 0 ) return error_setInpError(ERR_NUMBER, s2);
        NumThreads = m;
        break;

      // --- safety factor applied to variable time step estimates under
      //     dynamic wave flow routing (value of 0 indicates that variable
      //     time step option not used)
      case VARIABLE_STEP:
        if ( !getDouble(s2, CourantFactor) )
            return error_setInpError(ERR_NUMBER, s2);
        if ( CourantFactor < 0.0 || CourantFactor > 2.0 )
            return error_setInpError(ERR_NUMBER, s2);
        break;

      // --- minimum surface area (ft2 or sq. meters) associated with nodes
      //     under dynamic wave flow routing 
      case MIN_SURFAREA:
        if (!getDouble(s2, MinSurfArea))                                      //(5.1.013)
            return error_setInpError(ERR_NUMBER, s2);                          //(5.1.013)
        if (MinSurfArea < 0.0)                                                 //(5.1.013)
            return error_setInpError(ERR_NUMBER, s2);                          //(5.1.013)
        break;

      // --- minimum conduit slope (%)
      case MIN_SLOPE:
        if ( !getDouble(s2, MinSlope) )
            return error_setInpError(ERR_NUMBER, s2);
        if ( MinSlope < 0.0 || MinSlope >= 100 )
            return error_setInpError(ERR_NUMBER, s2);
        MinSlope /= 100.0;
        break;

      // --- maximum trials / time step for dynamic wave routing
      case MAX_TRIALS:
        m = atoi(s2);
        if ( m < 0 ) return error_setInpError(ERR_NUMBER, s2);
        MaxTrials = m;
        break;

      // --- head convergence tolerance for dynamic wave routing
      case HEAD_TOL:
        if ( !getDouble(s2, HeadTol) )
        {
            return error_setInpError(ERR_NUMBER, s2);
        }
        break;

      // --- steady state tolerance on system inflow - outflow
      case SYS_FLOW_TOL:
        if ( !getDouble(s2, SysFlowTol) )
        {
            return error_setInpError(ERR_NUMBER, s2);
        }
        SysFlowTol /= 100.0;
        break;

      // --- steady state tolerance on nodal lateral inflow
      case LAT_FLOW_TOL:
        if ( !getDouble(s2, LatFlowTol) )
        {
            return error_setInpError(ERR_NUMBER, s2);
        }
        LatFlowTol /= 100.0;
        break;

      // --- method used for surcharging in dynamic wave flow routing          //(5.1.013)
      case SURCHARGE_METHOD:
          m = findmatch(s2, SurchargeWords);
          if (m < 0) return error_setInpError(ERR_KEYWORD, s2);
          SurchargeMethod = m;
          break;

      case TEMPDIR: // Temporary Directory
        sstrncpy(TempDir, s2, MAXFNAME);
        break;

    }
    return 0;
}

//=============================================================================

function initPointers()
//
//  Input:   none
//  Output:  none
//  Purpose: assigns null to all dynamic arrays for a new project.
//
{
    Gage     = null;
    Subcatch = null;
    Node     = null;
    Outfall  = null;
    Divider  = null;
    Storage  = null;
    Link     = null;
    Conduit  = null;
    Pump     = null;
    Orifice  = null;
    Weir     = null;
    Outlet   = null;
    Pollut   = null;
    Landuse  = null;
    Pattern  = null;
    Curve    = null;
    Tseries  = null;
    Transect = null;
    Shape    = null;
    Aquifer    = null;
    UnitHyd    = null;
    Snowmelt   = null;
    Event      = null;
    MemPoolAllocated = false;
}

//=============================================================================

function setDefaults()
//
//  Input:   none
//  Output:  none
//  Purpose: assigns default values to project variables.
//
{
   let i, j;

   // Project title & temp. file path
   for (i = 0; i < MAXTITLE; i++) Title[i] = "";
   TempDir = "";

   // Interface files
   Frain.mode      = SCRATCH_FILE;     // Use scratch rainfall file
   Fclimate.mode   = NO_FILE; 
   Frunoff.mode    = NO_FILE;
   Frdii.mode      = NO_FILE;
   Fhotstart1.mode = NO_FILE;
   Fhotstart2.mode = NO_FILE;
   Finflows.mode   = NO_FILE;
   Foutflows.mode  = NO_FILE;
   Frain.file      = null;
   Fclimate.file   = null;
   Frunoff.file    = null;
   Frdii.file      = null;
   Fhotstart1.file = null;
   Fhotstart2.file = null;
   Finflows.file   = null;
   Foutflows.file  = null;
   Fout.file       = null;
   Fout.mode       = NO_FILE;

   // Analysis options
   UnitSystem      = US;               // US unit system
   FlowUnits       = CFS;              // CFS flow units
   InfilModel      = HORTON;           // Horton infiltration method
   RouteModel      = KW;               // Kin. wave flow routing method
   SurchargeMethod = EXTRAN;           // Use EXTRAN method for surcharging    //(5.1.013)
   CrownCutoff     = 0.96;                                                     //(5.1.013)
   AllowPonding    = false;            // No ponding at nodes
   InertDamping    = SOME;             // Partial inertial damping
   NormalFlowLtd   = BOTH;             // Default normal flow limitation
   ForceMainEqn    = H_W;              // Hazen-Williams eqn. for force mains
   LinkOffsets     = DEPTH_OFFSET;     // Use depth for link offsets
   LengtheningStep = 0;                // No lengthening of conduits
   CourantFactor   = 0.0;              // No variable time step 
   MinSurfArea     = 0.0;              // Force use of default min. surface area
   MinSlope        = 0.0;              // No user supplied minimum conduit slope
   SkipSteadyState = false;            // Do flow routing in steady state periods 
   IgnoreRainfall  = false;            // Analyze rainfall/runoff
   IgnoreRDII      = false;            // Analyze RDII
   IgnoreSnowmelt  = false;            // Analyze snowmelt 
   IgnoreGwater    = false;            // Analyze groundwater 
   IgnoreRouting   = false;            // Analyze flow routing
   IgnoreQuality   = false;            // Analyze water quality
   WetStep         = 300;              // Runoff wet time step (secs)
   DryStep         = 3600;             // Runoff dry time step (secs)
   RuleStep        = 0;                // Rules evaluated at each routing step
   RouteStep       = 300.0;            // Routing time step (secs)
   MinRouteStep    = 0.5;              // Minimum variable time step (sec)
   ReportStep      = 900;              // Reporting time step (secs)
   StartDryDays    = 0.0;              // Antecedent dry days
   MaxTrials       = 0;                // Force use of default max. trials 
   HeadTol         = 0.0;              // Force use of default head tolerance
   SysFlowTol      = 0.05;             // System flow tolerance for steady state
   LatFlowTol      = 0.05;             // Lateral flow tolerance for steady state
   NumThreads      = 0;                // Number of parallel threads to use
   NumEvents       = 0;                // Number of detailed routing events

   // Deprecated options
   SlopeWeighting  = true;             // Use slope weighting 
   Compatibility   = SWMM4;            // Use SWMM 4 up/dn weighting method

   // Starting & ending date/time
   StartDate       = datetime_encodeDate(2004, 1, 1);
   StartTime       = datetime_encodeTime(0,0,0);
   StartDateTime   = StartDate + StartTime;
   EndDate         = StartDate;
   EndTime         = 0.0;
   ReportStartDate = NO_DATE;
   ReportStartTime = NO_DATE;
   SweepStart      = 1;
   SweepEnd        = 365;

   // Reporting options
   RptFlags.input         = false;
   RptFlags.continuity    = true;
   RptFlags.flowStats     = true;
   RptFlags.controls      = false;
   RptFlags.subcatchments = false;
   RptFlags.nodes         = false;
   RptFlags.links         = false;
   RptFlags.nodeStats     = false;
   RptFlags.averages      = false;

   // Temperature data
   Temp.dataSource  = NO_TEMP;
   Temp.tSeries     = -1;
   Temp.ta          = 70.0;
   Temp.elev        = 0.0;
   Temp.anglat      = 40.0;
   Temp.dtlong      = 0.0;
   Temp.tmax        = MISSING;

   // Wind speed data
   Wind.type = MONTHLY_WIND;
   for (let i=0; i<12; i++ ) Wind.aws[i] = 0.0;

   // Snowmelt parameters
   Snow.snotmp      = 34.0;
   Snow.tipm        = 0.5;
   Snow.rnm         = 0.6;

   // Snow areal depletion curves for pervious and impervious surfaces
   for ( i=0; i<2; i++ )
   {
       for ( j=0; j<10; j++) Snow.adc[i][j] = 1.0;
   }

   // Evaporation rates
   Evap.type = CONSTANT_EVAP;
   for (i=0; i<12; i++)
   {
       Evap.monthlyEvap[i] = 0.0;
       Evap.panCoeff[i]    = 1.0;
   }
   Evap.recoveryPattern = -1;
   Evap.recoveryFactor  = 1.0; 
   Evap.tSeries = -1;
   Evap.dryOnly = false;

   // Climate adjustments
   for (i = 0; i < 12; i++)
   {
       Adjust.temp[i] = 0.0;   // additive adjustments
       Adjust.evap[i] = 0.0;   // additive adjustments
       Adjust.rain[i] = 1.0;   // multiplicative adjustments
       Adjust.hydcon[i] = 1.0; // hyd. conductivity adjustments
   }
   Adjust.rainFactor = 1.0;
   Adjust.hydconFactor = 1.0;
}

//=============================================================================

function openFiles(f1, f2, f3)
//
//  Input:   f1 = name of input file
//           f2 = name of report file
//           f3 = name of binary output file
//  Output:  none
//  Purpose: opens a project's input and report files.
//
{
    // --- initialize file pointers to null
    Finp.file = null;
    Frpt.file = null;
    Fout.file = null;

    // --- save file names
    sstrncpy(Finp.name, f1, MAXFNAME);
    sstrncpy(Frpt.name, f2, MAXFNAME);
    sstrncpy(Fout.name, f3, MAXFNAME);

    // --- check that file names are not identical
    if (strcomp(f1, f2) || strcomp(f1, f3) || strcomp(f2, f3))
    {
        writecon(FMT11);
        ErrorCode = ERR_FILE_NAME;
        return;
    }

    // --- open input and report files
    if ((Finp.file = fopen(f1,"rt")) == null)
    {
        writecon(FMT12);
        writecon(f1);
        ErrorCode = ERR_INP_FILE;
        return;
    }
    if ((Frpt.file = fopen(f2,"wt")) == null)
    {
       writecon(FMT13);
       ErrorCode = ERR_RPT_FILE;
       return;
    }
}

//=============================================================================

function createObjects()
//
//  Input:   none
//  Output:  none
//  Purpose: allocates memory for project's objects.
//
//  NOTE: number of each type of object has already been determined in
//        project_readInput().
//
{
    let j, k;

    // --- allocate memory for each category of object
    if ( ErrorCode ) return;
    Gage     = new Array(Nobjects[GAGE]);
    Subcatch = new Array(Nobjects[SUBCATCH]);
    Node     = new Array(Nobjects[NODE]);
    Outfall  = new Array(Nnodes[OUTFALL]);
    Divider  = new Array(Nnodes[DIVIDER]);
    Storage  = new Array(Nnodes[STORAGE]);
    Link     = new Array(Nobjects[LINK]);
    Conduit  = new Array(Nlinks[CONDUIT]);
    Pump     = new Array(Nlinks[PUMP]);
    Orifice  = new Array(Nlinks[ORIFICE]);
    Weir     = new Array(Nlinks[WEIR]);
    Outlet   = new Array(Nlinks[OUTLET]);
    Pollut   = new Array(Nobjects[POLLUT]);
    Landuse  = new Array(Nobjects[LANDUSE]);
    Pattern  = new Array(Nobjects[TIMEPATTERN]);
    Curve    = new Array(Nobjects[CURVE]);
    Tseries  = new Array(Nobjects[TSERIES]);
    Aquifer  = new Array(Nobjects[AQUIFER]);
    UnitHyd  = new Array(Nobjects[UNITHYD]);
    Snowmelt = new Array(Nobjects[SNOWMELT]);
    Shape    = new Array(Nobjects[SHAPE]);

    // --- create array of detailed routing event periods
    Event =  new Array(NumEvents+1)
    Event[NumEvents].start = BIG;
    Event[NumEvents].end = BIG + 1.0;

    // --- create LID objects
    lid_create(Nobjects[LID], Nobjects[SUBCATCH]);

    // --- create control rules
    ErrorCode = controls_create(Nobjects[CONTROL]);
    if ( ErrorCode ) return;

    // --- create cross section transects
    ErrorCode = transect_create(Nobjects[TRANSECT]);
    if ( ErrorCode ) return;

    // --- allocate memory for infiltration data
    infil_create(Nobjects[SUBCATCH]);                                          //(5.1.015)

    // --- allocate memory for water quality state variables
    for (let j = 0; j < Nobjects[SUBCATCH]; j++)
    {
        Subcatch[j].initBuildup = new Array(Nobjects[POLLUT]);
        Subcatch[j].oldQual = new Array(Nobjects[POLLUT]);
        Subcatch[j].newQual = new Array(Nobjects[POLLUT]);
        Subcatch[j].pondedQual = new Array(Nobjects[POLLUT]);
        Subcatch[j].totalLoad  = new Array(Nobjects[POLLUT]);
    }
    for (let j = 0; j < Nobjects[NODE]; j++)
    {
        Node[j].oldQual = new Array(Nobjects[POLLUT]);
        Node[j].newQual = new Array(Nobjects[POLLUT]);
        Node[j].extInflow = null;
        Node[j].dwfInflow = null;
        Node[j].rdiiInflow = null;
        Node[j].treatment = null;
    }
    for (let j = 0; j < Nobjects[LINK]; j++)
    {
        Link[j].oldQual = new Array(Nobjects[POLLUT]);
        Link[j].newQual = new Array(Nobjects[POLLUT]);
        Link[j].totalLoad = new Array(Nobjects[POLLUT]);
    }

    // --- allocate memory for land use buildup/washoff functions
    for (let j = 0; j < Nobjects[LANDUSE]; j++)
    {
        Landuse[j].buildupFunc = new Array(Nobjects[POLLUT]);
        Landuse[j].washoffFunc = new Array(Nobjects[POLLUT]);
    }

    // --- allocate memory for subcatchment landuse factors
    for (let j = 0; j < Nobjects[SUBCATCH]; j++)
    {
        Subcatch[j].landFactor = new Array(Nobjects[LANDUSE]);
        for (let k = 0; k < Nobjects[LANDUSE]; k++)
        {
            Subcatch[j].landFactor[k].buildup = new Array(Nobjects[POLLUT]);
        }
    }

    // --- initialize buildup & washoff functions
    for (let j = 0; j < Nobjects[LANDUSE]; j++)
    {
        for (let k = 0; k < Nobjects[POLLUT]; k++)
        {
            Landuse[j].buildupFunc[k].funcType = NO_BUILDUP;
            Landuse[j].buildupFunc[k].normalizer = PER_AREA;
            Landuse[j].washoffFunc[k].funcType = NO_WASHOFF;
        }
    }

    // --- initialize rain gage properties
    for (let j = 0; j < Nobjects[GAGE]; j++)
    {
        Gage[j].tSeries = -1;
        Gage[j].fname = "";
    }

    // --- initialize subcatchment properties
    for (let j = 0; j < Nobjects[SUBCATCH]; j++)
    {
        Subcatch[j].outSubcatch = -1;
        Subcatch[j].outNode     = -1;
        Subcatch[j].infil       = -1;
        Subcatch[j].groundwater = null;
        Subcatch[j].gwLatFlowExpr = null;
        Subcatch[j].gwDeepFlowExpr = null;
        Subcatch[j].snowpack    = null;
        Subcatch[j].lidArea     = 0.0;
        for (let k = 0; k < Nobjects[POLLUT]; k++)
        {
            Subcatch[j].initBuildup[k] = 0.0;
        }
    }

    // --- initialize RDII unit hydrograph properties
    for ( let j = 0; j < Nobjects[UNITHYD]; j++ ) rdii_initUnitHyd(j);

    // --- initialize snowmelt properties
    for ( let j = 0; j < Nobjects[SNOWMELT]; j++ ) snow_initSnowmelt(j);

    // --- initialize storage node exfiltration
    for (let j = 0; j < Nnodes[STORAGE]; j++) Storage[j].exfil = null;

    // --- initialize link properties
    for (let j = 0; j < Nobjects[LINK]; j++)
    {
        Link[j].xsect.type   = -1;
        Link[j].cLossInlet   = 0.0;
        Link[j].cLossOutlet  = 0.0;
        Link[j].cLossAvg     = 0.0;
        Link[j].hasFlapGate  = false;
    }
    for (let j = 0; j < Nlinks[PUMP]; j++) Pump[j].pumpCurve  = -1;

    // --- initialize reporting flags
    for (let j = 0; j < Nobjects[SUBCATCH]; j++) Subcatch[j].rptFlag = false;
    for (let j = 0; j < Nobjects[NODE]; j++) Node[j].rptFlag = false;
    for (let j = 0; j < Nobjects[LINK]; j++) Link[j].rptFlag = false;

    //  --- initialize curves, time series, and time patterns
    for (let j = 0; j < Nobjects[CURVE]; j++)   table_init(Curve[j]);
    for (let j = 0; j < Nobjects[TSERIES]; j++) table_init(Tseries[j]);
    for (let j = 0; j < Nobjects[TIMEPATTERN]; j++) inflow_initDwfPattern(j);
}

//=============================================================================

function deleteObjects()
//
//  Input:   none
//  Output:  none
//  Purpose: frees memory allocated for a project's objects.
//
//  NOTE: care is taken to first free objects that are properties of another
//        object before the latter is freed (e.g., we must free a
//        subcatchment's land use factors before freeing the subcatchment).
//
{
    let j, k;

    // --- free memory for landuse factors & groundwater
    if ( Subcatch ) for (let j = 0; j < Nobjects[SUBCATCH]; j++)
    {
        for (k = 0; k < Nobjects[LANDUSE]; k++)
        {
            FREE(Subcatch[j].landFactor[k].buildup);
        }
        FREE(Subcatch[j].landFactor);
        FREE(Subcatch[j].groundwater);
        gwater_deleteFlowExpression(j);
        FREE(Subcatch[j].snowpack);
    }

    // --- free memory for buildup/washoff functions
    if ( Landuse ) for (let j = 0; j < Nobjects[LANDUSE]; j++)
    {
        FREE(Landuse[j].buildupFunc);
        FREE(Landuse[j].washoffFunc)
    }

    // --- free memory for water quality state variables
    if ( Subcatch ) for (let j = 0; j < Nobjects[SUBCATCH]; j++)
    {
        FREE(Subcatch[j].initBuildup);
        FREE(Subcatch[j].oldQual);
        FREE(Subcatch[j].newQual);
        FREE(Subcatch[j].pondedQual);
        FREE(Subcatch[j].totalLoad);
    }
    if ( Node ) for (let j = 0; j < Nobjects[NODE]; j++)
    {
        FREE(Node[j].oldQual);
        FREE(Node[j].newQual);
    }
    if ( Link ) for (let j = 0; j < Nobjects[LINK]; j++)
    {
        FREE(Link[j].oldQual);
        FREE(Link[j].newQual);
        FREE(Link[j].totalLoad);
    }

    // --- free memory used for rainfall infiltration
    infil_delete();

    // --- free memory used for storage exfiltration
    if ( Node ) for (let j = 0; j < Nnodes[STORAGE]; j++)
    {
        if ( Storage[j].exfil )
        {
            FREE(Storage[j].exfil.btmExfil);
            FREE(Storage[j].exfil.bankExfil);
            FREE(Storage[j].exfil);
        }
    }

    // --- free memory used for outfall pollutants loads
    if ( Node ) for (let j = 0; j < Nnodes[OUTFALL]; j++)
        FREE(Outfall[j].wRouted);

    // --- free memory used for nodal inflows & treatment functions
    if ( Node ) for (let j = 0; j < Nobjects[NODE]; j++)
    {
        inflow_deleteExtInflows(j);
        inflow_deleteDwfInflows(j);
        rdii_deleteRdiiInflow(j);
        treatmnt_delete(j);
    }

    // --- delete table entries for curves and time series
    if ( Tseries ) for (let j = 0; j < Nobjects[TSERIES]; j++)
        table_deleteEntries(Tseries[j]);
    if ( Curve ) for (let j = 0; j < Nobjects[CURVE]; j++)
        table_deleteEntries(Curve[j]);

    // --- delete cross section transects
    transect_delete();

    // --- delete control rules
    controls_delete();

    // --- delete LIDs
    lid_delete();

    // --- now free each major category of object
    FREE(Gage);
    FREE(Subcatch);
    FREE(Node);
    FREE(Outfall);
    FREE(Divider);
    FREE(Storage);
    FREE(Link);
    FREE(Conduit);
    FREE(Pump);
    FREE(Orifice);
    FREE(Weir);
    FREE(Outlet);
    FREE(Pollut);
    FREE(Landuse);
    FREE(Pattern);
    FREE(Curve);
    FREE(Tseries);
    FREE(Aquifer);
    FREE(UnitHyd);
    FREE(Snowmelt);
    FREE(Shape);
    FREE(Event);
}

//=============================================================================

function createHashTables()
//
//  Input:   none
//  Output:  returns error code
//  Purpose: allocates memory for object ID hash tables
//
{   let  j;
    MemPoolAllocated = false;
    for (j = 0; j < MAX_OBJ_TYPES ; j++)
    {
        Htable[j] = HTcreate();
        if ( Htable[j] == null ) report_writeErrorMsg(ERR_MEMORY, "");
    }

    // --- initialize memory pool used to store object ID's
    if ( AllocInit() == null ) report_writeErrorMsg(ERR_MEMORY, "");
    else MemPoolAllocated = true;
}

//=============================================================================

function deleteHashTables()
//
//  Input:   none
//  Output:  none
//  Purpose: frees memory allocated for object ID hash tables
//
{
    let  j;
    for (let j = 0; j < MAX_OBJ_TYPES; j++)
    {
        if ( Htable[j] != null ) HTfree(Htable[j]);
    }

    // --- free object ID memory pool
    if ( MemPoolAllocated ) AllocFreePool();
}

//=============================================================================
