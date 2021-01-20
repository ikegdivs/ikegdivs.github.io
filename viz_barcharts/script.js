// When the document is loaded:
// Create some data
// Draw a histogram with the data.
document.addEventListener("DOMContentLoaded", function(){
    // dataObj is an array of dataElement objects.
    dataObj = [];
    
    // Use d3 to identify where we will draw the histogram.
    let viz_svg01 = d3.select("#viz_svg01");

    // dataElements are classes for data row/objects.
    // A dataElement object can be thought of as a simple
    // cartesian set.
    class dataElement{
        constructor(x, y){
            this.x = x;
            this.y = y;
        }
    }

    // Create an array of 10 dataElements.
    // This array will be used as the data for the chart.
    for(i = 0; i < 10; i++){
        // Use a simple linear equation.
        dataObj.push(new dataElement(i, i));
    }

    // Use D3 to represent the data as a chart.
    representData(viz_svg01, dataObj);
})

// representData is used to create a d3 chart. 
// input:
//   location: the svg element that the chart will be drawn in.
//   data: an array of classes that contain both x and y numeric data.
function representData(location, data){
    // Establish the basic parameters of the display
    // The starting position of the chart.
    chartBodyX = 50;
    chartBodyY = 0;
    // The relative size of the axes.
    xScaleWidth = 300;
    yScaleHeight = 200;
    // The amount of space between bars of the bar chart.
    chartBarPadding = 0.2;
    // The number of tick marks on the x axis.
    numTicks = 5;
    // The amount of space to allocate for text on the x and y axes.
    textBuffer = 20;

    // Create the viewbox. This viewbox helps define the visible portions
    // of the chart, but it also helps when making the chart responsive.
    location.attr('viewBox', `0 0 ${xScaleWidth + chartBodyX + textBuffer} ${yScaleHeight + textBuffer}`);

    // Use d3 to find the maximum dependent value for the data.
    let max = d3.max(data, d => d.y)

    // Use d3 to create a linear scale of x values.
    // Since the dependent variable is on the x axis, 
    // notice that 
    // The x scale should have the following values:
    //   range: x pixel distance of the start of the x axis.
    //          x pixel position of the end of the x axis.
    //   domain: value represented at the start of the x axis.
    //           value represented at the end of the x axis.
    let scaleX = d3.scaleLinear()
                    .range([0, xScaleWidth])
                    .domain([0, max])

    // Use d3 to create a linear scale of y values.
    // The y scale should have the following values:
    //   range: y pixel distance of the start of the y axis.
    //          y pixel distance of the end of the y axis.
    //   domain: mapped independent values
    //   padding: keep a small distance between each bar of the bar chart.
    let scaleY = d3.scaleBand()
                    .range([0, yScaleHeight])
                    .round(true)
                    .domain(data.map(d => d.x))
                    .padding(chartBarPadding)

    // Add groups to the svg for the body of the chart, the x axis, and the y axis.
    location.append('g')
        .attr('id', 'chartBody')
        .attr('transform', `translate(${chartBodyX}, 0)`);
    location.append('g')
        .attr('id', 'yAxis');
    location.append('g')
        .attr('id', 'xAxis');
    
    // Use d3 to create a set of rectangle objects utilizing the data.
    let join = d3.select('#chartBody')
                    .selectAll('rect')
                    .data(data);

    // enter() refers to the objects that will be entered into the 
    // chart. New objects will 'enter' the chart and be 'appended'.
    join.enter()
        .append('rect')
        .attr('fill', 'rgba(180, 240, 255')
        .style('stroke', 'rgba(230, 230, 230')
        // Set the horizontal width of the object to the
        // scaled values of the dependent variable
        .style('width', d => scaleX(d.y))
        // Set the vertical height of the object to
        // an appropriate value calculated by the scaleY.
        .attr('height', scaleY.bandwidth())
        // Position the bar using scaleY's distribution abilities.
        .attr('y', d => scaleY(d.x))

    // Create the x axis
    // Use the scaleX parameters to determine the start and end.
    // Request an allotment of n ticks on the scale.
    // Format the values on the tickmark: append an '%' symbol to the end of a tick value.
    let xAxis = d3.axisBottom(scaleX)
                    .ticks(numTicks)
                    .tickFormat(d => d + ' %');

    // Move the xAxis right nx units and down ny units
    d3.select('#xAxis')
        .attr('transform', `translate(${chartBodyX}, ${yScaleHeight})`)
        .call(xAxis)
    
    // Create the Y axis, 
    // Use the ScaleY parameters to determine the start and end.
    let yAxis = d3.axisLeft(scaleY)
    d3.select('#yAxis')
        // Move the Y axis right nx units.
        .attr('transform', `translate(${chartBodyX}, ${chartBodyY})`)
        .call(yAxis)
}
