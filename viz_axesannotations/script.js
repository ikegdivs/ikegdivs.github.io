/*When the document is loaded*/
jQuery(function(){
    // dataObj is an array of dataElement objects.
    dataObj = [];

    let viz002svg001 = d3.select("#viz002svg001");

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
    representData(viz002svg001, dataObj);
})

// representData is used to create a d3 chart. 
// This will be a 
function representData(location, data){
    // Create the viewbox. This viewbox helps define the visible portions
    // of the chart, but it also helps when making the chart responsive.
    location.attr('viewBox', '0 0 360 240');
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
                    .range([0, 300])
                    .domain([0, max])

    // Use d3 to create a linear scale of y values.
    // The y scale should have the following values:
    //   range: y pixel distance of the start of the y axis.
    //          y pixel distance of the end of the y axis.
    //   domain: mapped independent values
    //   padding: keep a small distance between each bar of the bar chart.
    let scaleY = d3.scaleBand()
                            .range([0,200])
                            .round(true)
                            .domain(data.map(d => d.x))
                            .padding(0.2)
    
    // Place the data into rectangle objects in the #chartBody object
    let join = d3.select('#chartBody')
                    .selectAll('rect')
                    .data(data);

    // For new data, append a rectangle svg object.
    join.enter()
        .append('rect')
        .attr('fill', 'lightblue')
        .style('stroke', 'white')
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
    // Format the values on the tickmark: append an '$' symbol to the end of a tick value.
    let xAxis = d3.axisBottom(scaleX)
                    .ticks(5)
                    .tickFormat(d => d + ' $')
    // Move the xAxis right nx units and down ny units
    d3.select('#xAxis')
        .attr('transform', 'translate(50, 200)')
        .call(xAxis)
    
    // Create the Y axis, 
    // Use the ScaleY parameters to determine the start and end.
    let yAxis = d3.axisLeft(scaleY)
    d3.select('#yAxis')
        // Move the Y axis right nx units.
        .attr('transform', 'translate(50, 0)')
        .call(yAxis)
}
