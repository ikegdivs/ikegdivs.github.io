// dataElements are classes for data row/objects.
class DataElement{
    constructor(cat, y){
        // cat: a category, numeric value.
        this.cat = cat;
        // y: independent numeric value.
        this.y = y;
    }
}

// ChartSpecs holds the general display parameters and data for a chart.
class ChartSpecs {
    // Constructor for parts of the chart that depend upon the data.
    constructor(data){
        // The x/y relational data for the chart.
        this.data = data;

        // Establish the basic parameters of the display
        // The starting position of the chart.
        this.chartBodyX = 50;
        this.chartBodyY = 0;
        // The relative size of the axes.
        this.xScaleWidth = 300;
        this.yScaleHeight = 200;
        // The number of tick marks on the x axis.
        this.numTicks = 5;
        // The amount of space to allocate for text,e etc. on the x and y axes.
        this.textBuffer = 20;
        this.topMargin = 10;
    }
    
    // The maximum value of the independent variable.
    get maxVal() {
        return d3.max(this.data, d => d.y);
    }

    // To create a scaling Y function for the chart, use this getter.
    get scaleY() {
        return d3.scaleLinear()
            .range([this.yScaleHeight, 0])
            .domain([0, this.maxVal]);
    }

    // To create a scaling X function for the chart, use this getter.
    get scaleX() {
        return d3.scaleLinear()
            .range([0, this.xScaleWidth])
            .domain(d3.extent(this.data, d=>d.cat))
    }
}

// When the document is loaded:
// Create some data
// Draw a line chart with the data.
document.addEventListener("DOMContentLoaded", function(){
    // Personalization variables.
    let fileName = null;
    let authorName = null;
    let description = null;

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

                processInput('data/' + fileName);
            })
    }
})

function processInput(fileName){
    //Get the input file for parsing.
    fetch(fileName)
        .then(response => response.text())
        .then((data) => {
            let input = new d3.inp();
            val = input.parse(data);

            try
            {
                // Save the input file to a virtual file system.
                FS.createPath('/', '/', true, true);
                FS.ignorePermissions = true;
                var f = FS.findObject('input.inp');
                if (f) {
                    FS.unlink('input.inp');
                }
                FS.createDataFile('/', 'input.inp', data, true, true);

                // Prepare and run swmm.
                const swmm_run = Module.cwrap('swmm_run', 'number', ['string', 'string', 'string']);
                data = swmm_run("/input.inp", "data/rpt.rpt", "data/out.out")

                // Use the output file to create a chart.
                processOutput('data/out.out');

                // Create the model display:
                //let model_svg = new swmmjs();
                //model_svg.render();
                //swmmjs.render();

                document.getElementById('inpFile').value = 
`[TITLE]
;;Project Title/Notes
Example 1

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
13               2336.840           4357.890          
14               3157.890           4294.740          
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
1                3936.840           6905.260          
1                3494.740           6252.630          
1                273.680            6336.840          
1                252.630            8526.320          
1                463.160            9200.000          
1                1157.890           9726.320          
1                4000.000           9705.260          
2                7600.000           9663.160          
2                7705.260           6736.840          
2                5915.790           6694.740          
2                4926.320           6294.740          
2                4189.470           7200.000          
2                4126.320           9621.050          
3                2357.890           6021.050          
3                2400.000           4336.840          
3                3031.580           4252.630          
3                2989.470           3389.470          
3                315.790            3410.530          
3                294.740            6000.000          
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

`;
                
                swmmjs.run();
            } catch (e) {
                console.log('/input.inp creation failed');
            }
    })
}

function processOutput(filePath){
    // dataObj is an array of dataElement objects.
    dataObj = [];

    let viz_svg01 = d3.select("#viz_svg01");

    output = new d3.swmmresult();
    val = output.parse(filePath);

    for(let i = 1; !!val[i]; i++){
        dataObj.push(new DataElement(i, val[i].LINK["1"][3]));
    }

    // Create a new chartSpecs object and populate it with the data.
    theseSpecs = new ChartSpecs(dataObj);

    // Prepare the chart and draw it.
    representData(viz_svg01, theseSpecs);
}

// representData draws the chart
// location is an svg where the chart will be drawn.
// theseSpecs is an object of class ChartSpecs
function representData(location, theseSpecs){
    // Create the viewbox. This viewbox helps define the visible portions
    // of the chart, but it also helps when making the chart responsive.
    location.attr('viewBox', ` 0 0 ${theseSpecs.xScaleWidth + theseSpecs.chartBodyX + theseSpecs.textBuffer} ${theseSpecs.yScaleHeight + theseSpecs.textBuffer + theseSpecs.topMargin}`);

    // Add groups to the svg for the body of the chart, the x axis, and the y axis.
    body = location.append('g')
        .attr('id', 'chartBody')
        .attr('transform', `translate(${theseSpecs.chartBodyX}, ${theseSpecs.topMargin})`);
    location.append('g')
        .attr('id', 'yAxis')
        .call(d3.axisLeft(theseSpecs.scaleY))
        .attr('transform', `translate(${theseSpecs.chartBodyX}, ${theseSpecs.topMargin})`);
    location.append('g')
        .attr('id', 'xAxis')
        .call(d3.axisBottom(theseSpecs.scaleX))
        .attr('transform', `translate(${theseSpecs.chartBodyX}, ${theseSpecs.yScaleHeight + theseSpecs.topMargin})`);

    // Create the location for the line
    body.append('path')

    drawLine(theseSpecs, d3.curveLinear);
}

// drawLine creates the line.
// theseSpecs: an object of class ChartSpecs
// curveType: a d3 curve type
function drawLine(theseSpecs, curveType){
    // Create the line
    let line = d3.line()
        .x(function(d) { return theseSpecs.scaleX(d.cat); })
        .y(function(d) { return theseSpecs.scaleY(d.y); })
        .curve(curveType)

    // Create a join on 'path' and the data
    let join = d3.selectAll('#chartBody path')
        .data([theseSpecs.data]);

    // Establish the styles for the line
    join.style('stroke', 'rgba(255, 0, 0, 1')
        .style('fill', 'none')
        .style('stroke-width', '0.2vw')

    // Perform a transition, if there is any data to transition.
    join.transition()
        .duration(1000)
        .attr('d', line)
    
    // Remove any unnecesary objects.
    join.exit()
        .remove()

    // Update the y axis.
    d3.selectAll('#yAxis')
        .call(d3.axisLeft(theseSpecs.scaleY))

    // Update the x axis.
    d3.selectAll('#xAxis')
        .call(d3.axisBottom(theseSpecs.scaleX))
}
