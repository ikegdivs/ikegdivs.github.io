// When the document is loaded:
// Create some data
// Draw a line chart with the data.
document.addEventListener("DOMContentLoaded", function(){
    // Personalization variables.
    let fileName = null;
    let authorName = null;
    let description = null;

    /////////////////////////////////////////////
    // Modal controls.
    /////////////////////////////////////////////
    // Get the modal
    let modal = document.getElementById("myModal");

    // Get the <span> element that closes the modal
    let span = document.getElementsByClassName("close")[0];

    
    // Alter display property of a group of elements.
    function hideOrShow(classDesc, displayType){
        items = document.getElementsByClassName(classDesc);
        Array.from(items).forEach(item => {
            item.style.display = displayType;
            item.value = '';
        })
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
        // Make the edit texts disappear
        hideOrShow('modaledit', 'none');
        // Make the labels disappear.
        hideOrShow('modallabel', 'none');
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            // Make the edit texts disappear
            hideOrShow('modaledit', 'none');
            // Make the labels disappear.
            hideOrShow('modallabel', 'none');
        }
    }

    /////////////////////////////////////////////
    // Project Tree controls.
    /////////////////////////////////////////////

    // Clicking on the Title/Notes li in the Project tree opens a text dialog.
    /*let pmTitle = document.getElementById("pmTitle");

    pmTitle.onclick = (e)=>{
        modal.style.display = 'block';
        document.getElementById('testid').innerText = this.id; 

        //;;Junction       Invert     Dmax       Dinit      Dsurch     Aponded 
        hideOrShow('modallabel', 'block');

        document.getElementById('modallabel01').innerText = 'Title'; 

        hideOrShow('modaledit', 'block');

        document.getElementById('modaledit01').value = swmmjs.model.TITLE[0]['TitleNotes'];

        document.getElementById('modaledit01').onkeyup = ()=>{
            swmmjs.model.TITLE[0]['TitleNotes'] = document.getElementById('modaledit01').value;
        }
    }*/

    // Setting up to process input file.
    Module.onRuntimeInitialized = _ => {
        // Process the metadata file
        // Load info.json into an object
        fetch('data/info.json')
            .then(response => response.json())
            .then((info) => {
                // For every item in mainpages.json, create a carousel-item
                authorName = info[0].Name;
                fileName = info[0].FileName;
                description = info[0].Description;

                //processInput('data/' + fileName);
            })
    }

    // Listen for requests to open an .inp file.
    const inputElement = document.getElementById("input");
    inputElement.addEventListener('change', handleFiles, false);
    function handleFiles() {
        const fileList = this.files;

        let fr = new FileReader();
        fr.onload=function(){
            /*if(fr.result){
                processInput(fr.result)
            }*/
            if(1){
                processInput(`[TITLE]
                ;;Project Title/Notes
                Example 1 is a gooe example. ; ok? ; )
                
                [OPTIONS]
                ;;Option             Value
                FLOW_UNITS           CFS
                INFILTRATION         HORTON
                FLOW_ROUTING         KINWAVE
                LINK_OFFSETS         DEPTH
                MIN_SLOPE            0
                ALLOW_PONDING        NO
                SKIP_STEADY_STATE    NO
                
                START_DATE           01/01/1998
                START_TIME           00:00:00
                REPORT_START_DATE    01/01/1998
                REPORT_START_TIME    00:00:00
                END_DATE             01/02/1998
                END_TIME             12:00:00
                SWEEP_START          01/01
                SWEEP_END            12/31
                DRY_DAYS             5
                REPORT_STEP          00:01:00
                WET_STEP             00:15:00
                DRY_STEP             01:00:00
                ROUTING_STEP         0:01:00 
                
                INERTIAL_DAMPING     PARTIAL
                NORMAL_FLOW_LIMITED  BOTH
                FORCE_MAIN_EQUATION  H-W
                VARIABLE_STEP        0.75
                LENGTHENING_STEP     0
                MIN_SURFAREA         12.557
                MAX_TRIALS           8
                HEAD_TOLERANCE       0.005
                SYS_FLOW_TOL         5
                LAT_FLOW_TOL         5
                
                [EVAPORATION]
                ;;Evap Data      Parameters
                ;;-------------- ----------------
                CONSTANT         0.0
                DRY_ONLY         NO
                
                [RAINGAGES]
                ;;Gage           Format    Interval SCF      Source    
                ;;-------------- --------- ------ ------ ----------
                RG1              INTENSITY 1:00     1.0      TIMESERIES TS1             
                
                [SUBCATCHMENTS]
                ;;Subcatchment   Rain Gage        Outlet           Area     %Imperv  Width    %Slope   CurbLen  Snow Pack       
                ;;-------------- ---------------- ---------------- -------- -------- -------- -------- -------- ----------------
                1                RG1              9                10       50       500      0.01     0                        
                2                RG1              10               10       50       500      0.01     0                        
                3                RG1              13               5        50       500      0.01     0                        
                4                RG1              22               5        50       500      0.01     0                        
                5                RG1              15               15       50       500      0.01     0                        
                6                RG1              23               12       10       500      0.01     0                        
                7                RG1              19               4        10       500      0.01     0                        
                8                RG1              18               10       10       500      0.01     0                        
                
                [SUBAREAS]
                ;;Subcatchment   N-Imperv   N-Perv     S-Imperv   S-Perv     PctZero    RouteTo    PctRouted 
                ;;-------------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
                1                0.001      0.10       0.05       0.05       25         OUTLET    
                2                0.001      0.10       0.05       0.05       25         OUTLET    
                3                0.001      0.10       0.05       0.05       25         OUTLET    
                4                0.001      0.10       0.05       0.05       25         OUTLET    
                5                0.001      0.10       0.05       0.05       25         OUTLET    
                6                0.001      0.10       0.05       0.05       25         OUTLET    
                7                0.001      0.10       0.05       0.05       25         OUTLET    
                8                0.001      0.10       0.05       0.05       25         OUTLET    
                
                [INFILTRATION]
                ;;Subcatchment   MaxRate    MinRate    Decay      DryTime    MaxInfil  
                ;;-------------- ---------- ---------- ---------- ---------- ----------
                1                0.35       0.25       4.14       0.50       0         
                2                0.7        0.3        4.14       0.50       0         
                3                0.7        0.3        4.14       0.50       0         
                4                0.7        0.3        4.14       0.50       0         
                5                0.7        0.3        4.14       0.50       0         
                6                0.7        0.3        4.14       0.50       0         
                7                0.7        0.3        4.14       0.50       0         
                8                0.7        0.3        4.14       0.50       0         
                
                [JUNCTIONS]
                ;;Junction       Invert     Dmax       Dinit      Dsurch     Aponded   
                ;;-------------- ---------- ---------- ---------- ---------- ----------
                9                1000       3          0          0          0         
                10               995        3          0          0          0         
                13               995        3          0          0          0         
                14               990        3          0          0          0         
                15               987        3          0          0          0         
                16               985        3          0          0          0         
                17               980        3          0          0          0         
                19               1010       3          0          0          0         
                20               1005       3          0          0          0         
                21               990        3          0          0          0         
                22               987        3          0          0          0         
                23               990        3          0          0          0         
                24               984        3          0          0          0         
                
                [OUTFALLS]
                ;;Outfall        Invert     Type       Stage Data       Gated   
                ;;-------------- ---------- ---------- ---------------- --------
                18               975        FREE                        NO
                
                [CONDUITS]
                ;;Conduit        From Node        To Node          Length     Roughness  InOffset   OutOffset  InitFlow   MaxFlow   
                ;;-------------- ---------------- ---------------- ---------- ---------- ---------- ---------- ---------- ----------
                1                9                10               400        0.01       0          0          0          0         
                4                19               20               200        0.01       0          0          0          0         
                5                20               21               200        0.01       0          0          0          0         
                6                10               21               400        0.01       0          1          0          0         
                7                21               22               300        0.01       1          1          0          0         
                8                22               16               300        0.01       0          0          0          0         
                10               17               18               400        0.01       0          0          0          0         
                11               13               14               400        0.01       0          0          0          0         
                12               14               15               400        0.01       0          0          0          0         
                13               15               16               400        0.01       0          0          0          0         
                14               23               24               400        0.01       0          0          0          0         
                15               16               24               100        0.01       0          0          0          0         
                16               24               17               400        0.01       0          0          0          0         
                
                [XSECTIONS]
                ;;Link           Shape        Geom1            Geom2      Geom3      Geom4      Barrels   
                ;;-------------- ------------ ---------------- ---------- ---------- ---------- ----------
                1                CIRCULAR     1.5              0          0          0          1                    
                4                CIRCULAR     1                0          0          0          1                    
                5                CIRCULAR     1                0          0          0          1                    
                6                CIRCULAR     1                0          0          0          1                    
                7                CIRCULAR     2                0          0          0          1                    
                8                CIRCULAR     2                0          0          0          1                    
                10               CIRCULAR     2                0          0          0          1                    
                11               CIRCULAR     1.5              0          0          0          1                    
                12               CIRCULAR     1.5              0          0          0          1                    
                13               CIRCULAR     1.5              0          0          0          1                    
                14               CIRCULAR     1                0          0          0          1                    
                15               CIRCULAR     2                0          0          0          1                    
                16               CIRCULAR     2                0          0          0          1                    
                
                [LOSSES]
                ;;Link           Kin        Kout       Kavg       Flap Gate  SeepRate  
                ;;-------------- ---------- ---------- ---------- ---------- ----------
                
                [POLLUTANTS]
                ;;Pollutant      Units  Cppt       Cgw        Crdii      Kdecay     SnowOnly   Co-Pollutant     Co-Frac    Cdwf       Cinit     
                ;;-------------- ------ ---------- ---------- ---------- ---------- ---------- ---------------- ---------- ---------- ----------
                TSS              MG/L   0.0        0.0        0          0.0        NO         *                0.0        0          0         
                Lead             UG/L   0.0        0.0        0          0.0        NO         TSS              0.2        0          0         
                
                [LANDUSES]
                ;;               Cleaning   Fraction   Last      
                ;;Land Use       Interval   Available  Cleaned   
                ;;-------------- ---------- ---------- ----------
                Residential                                      
                Undeveloped                                      
                
                [COVERAGES]
                ;;Subcatchment   Land Use         Percent   
                ;;-------------- ---------------- ----------
                1                Residential      100.00    
                2                Residential      50.00     
                2                Undeveloped      50.00     
                3                Residential      100.00    
                4                Residential      50.00     
                4                Undeveloped      50.00     
                5                Residential      100.00    
                6                Undeveloped      100.00    
                7                Undeveloped      100.00    
                8                Undeveloped      100.00    
                
                [LOADINGS]
                ;;Subcatchment   Pollutant        InitLoad  
                ;;-------------- ---------------- ----------
                
                [BUILDUP]
                ;;Land Use       Pollutant        Function   Coeff1     Coeff2     Coeff3     Normalizer
                ;;-------------- ---------------- ---------- ---------- ---------- ---------- ----------
                Residential      TSS              SAT        50         0          2          AREA      
                Residential      Lead             NONE       0          0          0          AREA      
                Undeveloped      TSS              SAT        100        0          3          AREA      
                Undeveloped      Lead             NONE       0          0          0          AREA      
                
                [WASHOFF]
                ;;Land Use       Pollutant        Function   Coeff1     Coeff2     Ecleaning  Ebmp      
                ;;-------------- ---------------- ---------- ---------- ---------- ---------- ----------
                Residential      TSS              EXP        0.1        1          0          0         
                Residential      Lead             EMC        0          0          0          0         
                Undeveloped      TSS              EXP        0.1        0.7        0          0         
                Undeveloped      Lead             EMC        0          0          0          0         
                
                [TIMESERIES]
                ;;Time Series    Date       Time       Value     
                ;;-------------- ---------- ---------- ----------
                ;RAINFALL
                TS1                         0:00       0.0       
                TS1                         1:00       0.25      
                TS1                         2:00       0.5       
                TS1                         3:00       0.8       
                TS1                         4:00       0.4       
                TS1                         5:00       0.1       
                TS1                         6:00       0.0       
                TS1                         27:00      0.0       
                TS1                         28:00      0.4       
                TS1                         29:00      0.2       
                TS1                         30:00      0.0       
                
                [REPORT]
                ;;Reporting Options
                INPUT      NO
                CONTROLS   NO
                SUBCATCHMENTS ALL
                NODES ALL
                LINKS ALL
                
                [TAGS]
                
                [MAP]
                DIMENSIONS 0.000 0.000 10000.000 10000.000
                Units      None
                
                [COORDINATES]
                ;;Node           X-Coord            Y-Coord           
                ;;-------------- ------------------ ------------------
                9                4042.110           9600.000          
                10               4105.260           6947.370          
                13               -786.241           6412.776          
                14               2358.722           1597.052          
                15               3221.050           3242.110          
                16               4821.050           3326.320          
                17               6252.630           2147.370          
                19               7768.420           6736.840          
                20               5957.890           6589.470          
                21               4926.320           6105.260          
                22               4421.050           4715.790          
                23               6484.210           3978.950          
                24               5389.470           3031.580          
                18               6631.580           505.260           
                
                [VERTICES]
                ;;Link           X-Coord            Y-Coord           
                ;;-------------- ------------------ ------------------
                10               6673.680           1368.420          
                
                [Polygons]
                ;;Subcatchment   X-Coord            Y-Coord           
                ;;-------------- ------------------ ------------------
                1                1468.736           6981.560          
                1                1026.636           6328.930          
                1                -2194.424          6413.140          
                1                -2215.474          8602.620          
                1                -2004.944          9276.300          
                1                -1310.214          9802.620          
                1                1531.896           9781.560          
                2                7600.000           9663.160          
                2                7705.260           6736.840          
                2                5915.790           6694.740          
                2                4926.320           6294.740          
                2                4189.470           7200.000          
                2                4126.320           9621.050          
                3                -289.741           5850.664          
                3                -247.631           4166.454          
                3                383.949            4082.244          
                3                341.839            3219.084          
                3                -2331.841          3240.144          
                3                -2352.891          5829.614          
                4                3473.680           6105.260          
                4                3915.790           6421.050          
                4                4168.420           6694.740          
                4                4463.160           6463.160          
                4                4821.050           6063.160          
                4                4400.000           5263.160          
                4                4357.890           4442.110          
                4                4547.370           3705.260          
                4                4000.000           3431.580          
                4                3326.320           3368.420          
                4                3242.110           3536.840          
                4                3136.840           5157.890          
                4                2589.470           5178.950          
                4                2589.470           6063.160          
                4                3284.210           6063.160          
                4                3705.260           6231.580          
                4                4126.320           6715.790          
                5                2568.420           3200.000          
                5                4905.260           3136.840          
                5                5221.050           2842.110          
                5                5747.370           2421.050          
                5                6463.160           1578.950          
                5                6610.530           968.420           
                5                6589.470           505.260           
                5                1305.260           484.210           
                5                968.420            336.840           
                5                315.790            778.950           
                5                315.790            3115.790          
                6                9052.630           4147.370          
                6                7894.740           4189.470          
                6                6442.110           4105.260          
                6                5915.790           3642.110          
                6                5326.320           3221.050          
                6                4631.580           4231.580          
                6                4568.420           5010.530          
                6                4884.210           5768.420          
                6                5368.420           6294.740          
                6                6042.110           6568.420          
                6                8968.420           6526.320          
                7                8736.840           9642.110          
                7                9010.530           9389.470          
                7                9010.530           8631.580          
                7                9052.630           6778.950          
                7                7789.470           6800.000          
                7                7726.320           9642.110          
                8                9073.680           2063.160          
                8                9052.630           778.950           
                8                8505.260           336.840           
                8                7431.580           315.790           
                8                7410.530           484.210           
                8                6842.110           505.260           
                8                6842.110           589.470           
                8                6821.050           1178.950          
                8                6547.370           1831.580          
                8                6147.370           2378.950          
                8                5600.000           3073.680          
                8                6589.470           3894.740          
                8                8863.160           3978.950          
                
                [SYMBOLS]
                ;;Gage           X-Coord            Y-Coord           
                ;;-------------- ------------------ ------------------
                RG1              10084.210          8210.530          
                
                `);
            }
        }

        fr.readAsText(fileList[0]);
        x = swmmjs.model;
    }

    // Listen for requests to save an .inp file.
    const saveElement = document.getElementById("save");
    saveElement.addEventListener('click', saveFile, false);
    function saveFile() {
        swmmjs.svg.save();
    }
})

// Read the input file (text). 
// Parse the data into memory. 
// Run the model.

function processInput(inpText){
    try
    {
        document.getElementById('inpFile').value = inpText;
        swmmjs.run();
    } catch (e) {
        console.log('/input.inp creation failed');
    }
}

// Project tree display controls
let toggler = document.getElementsByClassName('caret');
let iter;

for (iter = 0; iter < toggler.length; iter++){
    toggler[iter].addEventListener('click', function(){
        this.parentElement.querySelector('.nested')
            .classList.toggle('active');
        this.classList.toggle('active');
        //this.querySelector('.nested')
        //    .classList.toggle('active');
        this.classList.toggle('caret-down');
    })
}


