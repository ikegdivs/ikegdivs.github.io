// dataElements are classes for data row/objects.
class DataElement{
    constructor(date, y){
        // date: a datetime object
        this.date = date;
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

        // The maximum value of the independent variable.
        this.maxVal = d3.max(data, d => d.y);

        // Use d3 to create a linear scale of x values.
        // The x scale should have the following values:
        //   range: x pixel distance of the start of the y axis.
        //          y pixel distance of the end of the y axis.
        //   domain: mapped independent values
        this.scaleX = d3.scaleTime()
                    .range([0, this.xScaleWidth])
                    .domain(d3.extent(this.data, d => d.date))

        // Use d3 to create a linear scale of y values.
        // The y scale should have the following values:
        //   range: y pixel distance of the end of the y axis.
        //          y pixel position of the strt of the y axis.
        //   domain: value represented at the start of the y axis.
        //           value represented at the end of the y axis.
        // Invert the range in order to start from high values and move to low values. 
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
        // Create a new date
        theDate = new Date(2021, 0, 1)
        // Add i months to the date
        theDate.setMonth(theDate.getMonth() + i);
        dataObj.push(new DataElement(theDate, i));
    }

    // Create a new ChartSpecs object and populate it with the data.
    theseSpecs = new ChartSpecs(dataObj);

    representData(viz_svg01, theseSpecs);

    // If the user changes the x slider, adjust the color of the map elements
    $('#formControlRangeX').on('input', function(event){
        dataObj = [];
        // Get the input from the slider.
        userVal = parseFloat($(event.currentTarget).prop('value'));

        // Create a set of 10 dataElements.
        for(i = 0; i < 10; i++){
            // Create a new date
            theDate = new Date(2021, 0, 1)
            // Add i months to the date
            theDate.setMonth(theDate.getMonth() + i);
            dataObj.push(new DataElement(theDate, i + userVal));
        }

        theseSpecs = new ChartSpecs(dataObj);

        // These modifications will have an effect on the axes, so we 
        // need to redraw the whole chart.
        representData(viz_svg01, theseSpecs);
    })
})

// representData draws a chart
// input
//   location: the svg html element where the chart will be drawn.
//   theseSpecs: a ChartSpecs object.
function representData(location, theseSpecs){
    // Empty out the destination location
    location.selectAll('*').html(null);
    
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
        .call(d3.axisBottom(theseSpecs.scaleX)
            .tickFormat(d3.timeFormat('%b')))
        .attr('transform', `translate(${theseSpecs.chartBodyX}, ${theseSpecs.yScaleHeight + theseSpecs.topMargin})`);

    // Create the location for the line
    body.append('path')

    drawLine(theseSpecs);
}

// drawLine creates the line.
// theseSpecs: an object of class ChartSpecs
// lineColor: a color to apply to the line
function drawLine(theseSpecs){
    // Create the line
    var line = d3.line()
        .x(function(d) { return theseSpecs.scaleX(d.date); })
        .y(function(d) { return theseSpecs.scaleY(d.y); })

    var u = body
        .selectAll('path')
        .data([theseSpecs.data]);
    
    u.enter()
        .append('path')
        .merge(u)
        .style('stroke', 'rgba(255, 0, 0, 1)')
        .style('fill', 'none')
        .attr('stroke-width', '0.2vw')
        .attr('d', line);
}

