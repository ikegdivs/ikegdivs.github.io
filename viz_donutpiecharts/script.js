// When the document is loaded:
// Create some data
// Draw a donut chart with the data.
document.addEventListener("DOMContentLoaded", function(){
    // dataObj is an array of dataElement objects.
    dataObj = [];
    let viz_svg01 = d3.select("#viz_svg01");

    // dataElements are classes for data row/objects.
    // properties:
    //   category: a string object
    //   sales: a numeric value
    function dataElement(category, sales){
        this.category = category;
        this.sales = sales;
    }

    // Create a set of 10 dataElements.
    for(i = 1; i < 11; i++){
        // Use a translation of number to letter for category
        category = 'a' + i;
        dataObj.push(new dataElement(category, 10 + i));
    }

    // Draw the chart
    representData(viz_svg01, dataObj);
})

function representData(location, data, innerRadiusFactor = 0.2){
    // Establish the basic parameters of the display
    // The starting position of the chart.
    chartBodyX = 100;
    chartBodyY = 100;
    // The relative size of the axes.
    xScaleWidth = 200;
    yScaleHeight = 200;
    // The number of tick marks on the x axis.
    numTicks = 5;
    // The amount of space to allocate for text,e etc. on the x and y axes.
    textBuffer = 20;
    topMargin = 10;

    // Clear out the display svg
    location.selectAll('*').remove();

    // Create the viewbox. This viewbox helps define the visible portions
    // of the chart, but it also helps when making the chart responsive.
    location.attr('viewBox', `0 0 ${xScaleWidth + chartBodyX + textBuffer} ${yScaleHeight + textBuffer + topMargin}`);

    // Create a pie function to translate values into arcs
    let pie = d3.pie()
        .value(d => d.sales)

    // set colors for chart
    let colorScale = d3.scaleOrdinal()
        .range(d3.schemeCategory10)
        .domain(data.map(d => d.category))

    // Add groups to the svg for the body of the chart.
    body = location.append('g')
                .attr('id', 'chartBody')
                .attr('transform', `translate(${chartBodyX}, ${chartBodyY})`);

    // Create the arcs for the pie chart
    let arc = d3.arc()
        .outerRadius(yScaleHeight/2)
        .innerRadius(yScaleHeight * innerRadiusFactor);
    
    // Create the groups
    let g = body.selectAll('.arc')
        .data(pie(data))
        //only append g on new data
        .enter()
        .append('g')

    g.append('path')
        .attr('d', arc)
        .attr('fill', d => { return colorScale(d.data.category)})

    // If the user changes the X slider, adjust the radius of the donut's inner circle.
    $('#formControlRangeX').on('input', function(event){
        innerRadiusFactor = parseFloat($(event.currentTarget).prop('value'))/250;
        
        // Recreate the donut's inner and outer radius values
        let arc = d3.arc()
            .outerRadius(yScaleHeight/2)
            .innerRadius(yScaleHeight * innerRadiusFactor)

        location.selectAll('path')
            .attr('d', arc)
    })
}

