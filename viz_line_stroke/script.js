// When the document is loaded:
// Create some data
// Draw a line chart with the data.
document.addEventListener("DOMContentLoaded", function(){
    // dataObj is an array of dataElement objects.
    dataObj = [];
    let viz_svg01 = d3.select("#viz_svg01");

    // dataElements are classes for data row/objects.
    // properties:
    //   date: a dateTime object
    //   y: a numeric value
    //   factor: user manipulation factor
    function dataElement(date, y, factor = 0){
        this.date = date;
        this.y = Math.pow(((1+factor/10)*y-5), 3) + 100;
    }

    // Create a set of 10 dataElements.
    for(i = 0; i < 10; i++){
        // Create a new date
        theDate = new Date(2021, 0, 1)
        // Add i months to the date
        theDate.setMonth(theDate.getMonth() + i);
        dataObj.push(new dataElement(theDate, i));
    }

    representData(viz_svg01, dataObj);

    // If the user changes the X slider, adjust the color of the chart line.
    $('#formControlRangeX').on('input', function(event){
        // Get the input from the slider.
        userVal = parseFloat($(event.currentTarget).prop('value'));
        
        // Modify the user input to act as a color value
        colorVal = Math.round(userVal * 2.5);

        // Adjust the color of the chart line.
        body.selectAll('path')
            .attr('stroke', 'rgba('+ (255-colorVal) + ',' + colorVal + ', 0)')
    })
})

function representData(location, data){
    // Establish the basic parameters of the display
    // The starting position of the chart.
    chartBodyX = 50;
    chartBodyY = 0;
    // The relative size of the axes.
    xScaleWidth = 300;
    yScaleHeight = 200;
    // The number of tick marks on the x axis.
    numTicks = 5;
    // The amount of space to allocate for text,e etc. on the x and y axes.
    textBuffer = 20;
    topMargin = 10;

    // Create the viewbox. This viewbox helps define the visible portions
    // of the chart, but it also helps when making the chart responsive.
    location.attr('viewBox', `0 0 ${xScaleWidth + chartBodyX + textBuffer} ${yScaleHeight + textBuffer + topMargin}`);
    
    // Use d3 to find the maximum dependent value for the data.
    let maxValue = d3.max(data, d => d.y);

    // Use d3 to create a linear scale of y values.
    // The y scale should have the following values:
    //   range: y pixel distance of the end of the y axis.
    //          y pixel position of the strt of the y axis.
    //   domain: value represented at the start of the y axis.
    //           value represented at the end of the y axis.
    // Invert the range in order to start from high values and move to low values. 
    let scaleY = d3.scaleLinear()
                    .range([yScaleHeight, 0])
                    .domain([0, maxValue]);

    // Use d3 to create a linear scale of x values.
    // The x scale should have the following values:
    //   range: x pixel distance of the start of the y axis.
    //          y pixel distance of the end of the y axis.
    //   domain: mapped independent values
    let scaleX = d3.scaleTime()
                    .range([0, xScaleWidth])
                    .domain(d3.extent(data, d => d.date))

    // Add groups to the svg for the body of the chart, the x axis, and the y axis.
    body = location.append('g')
        .attr('id', 'chartBody')
        .attr('transform', `translate(${chartBodyX}, ${topMargin})`);
    location.append('g')
        .attr('id', 'yAxis')
        .call(d3.axisLeft(scaleY))
        .attr('transform', `translate(${chartBodyX}, ${topMargin})`);
    location.append('g')
        .attr('id', 'xAxis')
        .call(d3.axisBottom(scaleX)
            .tickFormat(d3.timeFormat('%b')))
        .attr('transform', `translate(${chartBodyX}, ${yScaleHeight + topMargin})`);

    // Create the line points
    valueline = d3.line()
        .x(d => scaleX(d.date))
        .y(d => scaleY(d.y))

    // Bind the data and add the line to the chart
    body.append('path')
        .datum(data)
        .attr('d', d => valueline(d))
        // Don't let path close
        .attr("class", "chartLine")
        .attr('fill', 'none')
        .attr('stroke', 'rgba(255, 0, 0, 1)')
        .attr('stroke-width', '0.2vw')
}
