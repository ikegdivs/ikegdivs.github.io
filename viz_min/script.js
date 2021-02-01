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
        this.xScaleWidth = 325;
        this.yScaleHeight = 225;
        // The number of tick marks on the x axis.
        this.numTicks = 5;
        // The amount of space to allocate for text,e etc. on the x and y axes.
        this.textBuffer = 20;
        this.topMargin = 10;
        // Size of the legend
        this.legendWidth = 125;
        this.legendHeight = 75;
        this.legendPadding = 15;
        this.legendBuffer = 10;
        this.legendLineHeight = 20;
        //Size of icons in the legend
        this.legendIconSize = 4;

        // Stats for the data.
        this.maxVal = d3.max(this.data, d => d.y);
        this.minVal = d3.min(this.data, d => d.y);

        // Create a scaling map for the independent axis.
        this.scaleX = d3.scaleLinear()
                    .range([0, this.xScaleWidth])
                    .domain(d3.extent(this.data, d => d.cat))

        // Create a scaling map for the dependent axis.
        this.scaleY = d3.scaleLinear()
                    .range([this.yScaleHeight, 0])
                    .domain([0, this.maxVal]);
        
        //Create a map function to find the min value for the data
        this.minMap = this.data.map(item => {
            const container = {};

            container.cat = item.cat;
            container.y = this.minVal;

            return container;
        })
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
        dataObj.push(new DataElement(i, Math.abs(Math.sin(i))));
    }
    
    // Create a new chartSpecs object and populate it with the data.
    theseSpecs = new ChartSpecs(dataObj);

    // Prepare the chart and draw it.
    representData(viz_svg01, theseSpecs);

    // If the user changes the x slider, adjust the color of the map elements
    $('#formControlRangeX').on('input', function(event){
        dataObj = [];
        // Get the input from the slider.
        userVal = parseFloat($(event.currentTarget).prop('value'));

        // Create a set of 10 dataElements.
        for(i = 0; i < 10; i++){
            dataObj.push(new DataElement(i, Math.abs(Math.sin(i)) + userVal/100));
        }

        theseSpecs = new ChartSpecs(dataObj);

        // These modifications will have an effect on the axes, so we 
        // need to redraw the whole chart.
        representData(viz_svg01, theseSpecs);
    })
})

// representData draws the chart
// location is an svg where the chart will be drawn.
// theseSpecs is an object of class ChartSpecs
function representData(location, theseSpecs){
    // Empty the destination location.
    location.html(null);

    // Create the viewbox. This viewbox helps define the visible portions
    // of the chart, but it also helps when making the chart responsive.
    location.attr('viewBox', ` 0 0 ${theseSpecs.xScaleWidth + theseSpecs.chartBodyX + theseSpecs.textBuffer + theseSpecs.legendWidth} ${theseSpecs.yScaleHeight + theseSpecs.textBuffer + theseSpecs.topMargin}`);

    // Add groups to the svg for the body of the chart, the x axis, and the y axis.
    let body = location.append('g')
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

    drawLine(theseSpecs, d3.curveBasis);
    drawMinLine(theseSpecs);
    createLegend();
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

    // Identify the chart body
    let body = d3.selectAll('#chartBody')

    let u = body
        .selectAll('.mainLine')
        .data([theseSpecs.data]);
    
    u.enter()
        .append('path')
        .attr('class', 'mainLine')
        .merge(u)
        .style('stroke', 'rgba(255, 0, 0, 1')
        .style('fill', 'none')
        .attr('stroke-width', '0.2vw')
        .attr('d', line);
}

// drawMinLine creates a line that represents the minimum value on the chart.
// theseSpecs: an object of class ChartSpecs
function drawMinLine(theseSpecs){
    // Create the line
    let line = d3.line()
        .x(function(d) { return theseSpecs.scaleX(d.cat); })
        .y(function(d) { return theseSpecs.scaleY(d.y); })

    // Identify the chart body
    let body = d3.selectAll('#chartBody')

    let u = body
        .selectAll('.minLine')
        .data([theseSpecs.minMap]);
    
    u.enter()
        .append('path')
        .attr('class', 'minLine')
        .merge(u)
        .style('stroke', 'rgba(255, 0, 255, 1)')
        .style('fill', 'none')
        .attr('stroke-width', '0.2vw')
        .attr('d', line);
}

// Create a legend for the chart.
function createLegend(){
    // Identify the chart body
    let body = d3.selectAll('#chartBody')

    // Legend borders
    body.append("rect")
        .attr('class', 'lgnd')
        .attr("x", theseSpecs.xScaleWidth + theseSpecs.legendBuffer)
        .attr("y", 0)
        .attr("width",  theseSpecs.legendWidth)
        .attr("height", theseSpecs.legendHeight)
        .style("fill", "rgba(220, 220, 220, 1)")
        .style("stroke", "rgba(0, 0, 0, 1)")
    body.append("rect")
        .attr('class', 'lgnd')
        .attr("x", theseSpecs.xScaleWidth + theseSpecs.legendBuffer + 2)
        .attr("y", 2)
        .attr("width",  theseSpecs.legendWidth - 4)
        .attr("height", theseSpecs.legendHeight - 4)
        .style("fill", "rgba(255, 255, 255, 1)")
        .style("stroke", "rgba(0, 0, 0, 1)")
    
    // Legend title
    body.append("text")
        .attr('class', 'lgnd')
        .attr("x", theseSpecs.xScaleWidth + theseSpecs.legendPadding + theseSpecs.legendBuffer)
        .attr("y", theseSpecs.legendLineHeight)
        .text("LEGEND")
        .style("font-size", "12px")
        .style("font-weight", "800")

    // Icon for first entry
    body.append("circle")
        .attr('class', 'lgnd')
        .attr("cx", theseSpecs.xScaleWidth + theseSpecs.legendPadding + theseSpecs.legendBuffer)
        .attr("cy", theseSpecs.legendLineHeight * 2 - theseSpecs.legendIconSize)
        .attr("r", theseSpecs.legendIconSize)
        .style("fill", "red")
    
    // Icon for second entry.
    body.append("circle")
        .attr('class', 'lgnd')
        .attr("cx", theseSpecs.xScaleWidth + theseSpecs.legendPadding + theseSpecs.legendBuffer)
        .attr("cy",theseSpecs.legendLineHeight * 3 - theseSpecs.legendIconSize)
        .attr("r", theseSpecs.legendIconSize)
        .style("fill", 'rgba(255, 0, 255, 1)')

    // Descriptor for first entry
    body.append("text")
        .attr('class', 'lgnd')
        .attr("x", theseSpecs.xScaleWidth + theseSpecs.legendPadding * 2 + theseSpecs.legendBuffer)
        .attr("y", theseSpecs.legendLineHeight * 2)
        .text("Sinusoidal Data")
        .style("font-size", "10px")

    // Descriptor for second entry
    body.append("text")
        .attr('class', 'lgnd')
        .attr("x", theseSpecs.xScaleWidth + theseSpecs.legendPadding * 2 + theseSpecs.legendBuffer)
        .attr("y", theseSpecs.legendLineHeight * 3)
        .text("Local Minima")
        .style("font-size", "10px")
}