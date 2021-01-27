// dataElements are classes for data row/objects.
class DataElement{
    constructor(cat){
        // cat: a category, numeric value.
        this.cat = cat;
        // y: independent numeric value.
        this.y = Math.abs(Math.sin(cat));
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

        // The maximum value of the independent variable.
        this.maxVal = d3.max(data, d => d.y);

        this.scaleX = d3.scaleLinear()
                    .range([0, this.xScaleWidth])
                    .domain(d3.extent(this.data, d => d.cat))

        this.scaleY = d3.scaleLinear()
                    .range([this.yScaleHeight, 0])
                    .domain([0, this.maxVal]);
    }
}

// When the document is loaded:
// Create some data
// Draw a line chart with the data.
document.addEventListener("DOMContentLoaded", function(){
    // dataObj is an array of dataElement objects.
    dataObj = [];
    let viz_svg01 = d3.select("#viz_svg01");

    // Create a set of 10 dataElements.
    for(i = 0; i < 10; i++){
        dataObj.push(new DataElement(i, i));
    }
    
    // Create a new chartSpecs object and populate it with the data.
    theseSpecs = new ChartSpecs(dataObj);

    // Prepare the chart and draw it.
    representData(viz_svg01, theseSpecs);

    // If the user changes the selection on the dropdown selection box, adjust the curve function of the chart line.
    $('#formControlSelector').on('change', function(event){
        // Establish a variable for the curve function
        let d3curve = '';

        // Get the input from the drop down.
        userVal = $(event.currentTarget).prop('value');
 
        drawLine(theseSpecs, d3[userVal])
    })
})

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
    var line = d3.line()
        .x(function(d) { return theseSpecs.scaleX(d.cat); })
        .y(function(d) { return theseSpecs.scaleY(d.y); })
        .curve(curveType)

    var u = body
        .selectAll('path')
        .data([theseSpecs.data]);
    
    u.enter()
        .append('path')
        .merge(u)
        .style('stroke', 'rgba(255, 0, 0, 1')
        .style('fill', 'none')
        .attr('stroke-width', '0.2vw')
        .attr('d', line);
}
