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
