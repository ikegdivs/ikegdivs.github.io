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
        this.xScaleWidth = 400;
        this.yScaleHeight = 200;
        // The number of tick marks on the x axis.
        this.numTicks = 5;
        // The amount of space to allocate for text,e etc. on the x and y axes.
        this.textBuffer = 20;
        this.topMargin = 10;
        // Parameters for the legend
        this.legendWidth = 125;
        this.legendHeight = 75;
        this.legendPadding = 15;
        this.legendBuffer = 10;
        this.legendLineHeight = 20;
        //Size of icons in the legend
        this.legendIconSize = 4;
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
    // dataObj is an array of dataElement objects.
    dataObj = [];
    let viz_svg01 = d3.select("#viz_svg01")

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
    location.attr('viewBox', ` 0 0 ${theseSpecs.xScaleWidth} ${theseSpecs.yScaleHeight}`);

    // Add groups to the svg for the body of the chart, the x axis, and the y axis.
    body = location.append('g')
        .attr('id', 'chartBody')

    var x = theseSpecs.scaleX;

    var y = theseSpecs.scaleY;

    var view = body.append("rect")
        .attr("class", "view")
        .attr("x", 0.5)
        .attr("y", 0.5)
        .attr("width", theseSpecs.xScaleWidth - 1)
        .attr("height", theseSpecs.yScaleHeight - 1)
        .attr('fill', 'rgba(255, 255, 255, 1)');

    var xAxis = d3.axisBottom(x)
        .ticks(10)
        .tickSize(theseSpecs.yScaleHeight)
        .tickPadding(8 - theseSpecs.yScaleHeight)

    var yAxis = d3.axisRight(y)
        .ticks(10)
        .tickSize(theseSpecs.xScaleWidth)
        .tickPadding(8 - theseSpecs.xScaleWidth)

    var gY = location.append('g')
        .attr('id', 'yAxis')
        .attr("class", "axis axis--y")
        .attr('stroke-opacity', '0.15')
        .attr('stroke-color', 'lightgrey')
        .call(yAxis)
                
    var gX = location.append('g')
        .attr('id', 'xAxis')
        .attr("class", "axis axis--x")
        .attr('stroke-opacity', '0.15')
        .attr('stroke-color', 'lightgrey')
        .call(xAxis)

    var zoom = d3.zoom()
        .scaleExtent([0.5, 40])
        .translateExtent([[-100, -100], [theseSpecs.xScaleWidth + 90, theseSpecs.yScaleHeight + 100]])
        .on("zoom", zoomed);

    var zoomCatcher = location.append("rect")
        .attr("class", "zoomCatcher")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", theseSpecs.xScaleWidth)
        .attr("height", theseSpecs.yScaleHeight)
        .attr("fill", "transparent")
        .attr("stroke", "none")
        .call(zoom);

    // Create the location for the line
    body.append('path')

    drawLine(theseSpecs, d3.curveLinear);

    

    body.call(zoom);

    function zoomed({transform}) {
        d3.select("#viz_svg01 #chartBody")
            .attr('transform', transform)

        gX.call(xAxis.scale(transform.rescaleX(x)));
        gY.call(yAxis.scale(transform.rescaleY(y)));
    }

    // d3 uses the size of the entire <svg/> node to determine the zoom extent. This
    // causes it to incorrectly handle the translateExtent if you're catching zoom
    // events with a rect that's smaller than the SVG. But d3 lets you specify your
    // own extent function, so there's a solution!
    function svgRectExtent() {
        var e = this, w, h;
    
        return [[0, 0],
                [e.width.baseVal.value,
                e.height.baseVal.value]];
    }

    zoomCatcher
        .call(zoom.transform, d3.zoomIdentity);

    zoom.extent(svgRectExtent);

    zoomCatcher.call(zoom);

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
}
