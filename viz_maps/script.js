/*When the document is loaded*/
jQuery(function(){dataObj = [];
    mapObj = [];
    statsObj = [];
    data = null;

    let viz_svg01 = d3.select("#viz_svg01");

    // dataElements are classes for data row/objects.
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

    d3.json('/data/countries.geojson').then(function(data){
        representData(data, viz_svg01);
    } )
})

function representData(data, location){
    // Establish the basic parameters of the display
    // The starting position of the chart.
    chartBodyX = 0;
    chartBodyY = 25;
    // The relative size of the axes.
    xScaleWidth = 420;
    yScaleHeight = 170;

    // Create the viewbox. This viewbox helps define the visible portions
    // of the chart, but it also helps when making the chart responsive.
    location.attr('viewBox', `0 0 ${xScaleWidth + chartBodyX} ${yScaleHeight}`);

    // Add groups to the svg for the body of the chart.
    body = location.append('g')
                .attr('id', 'chartBody')
                .attr('transform', `translate(${chartBodyX}, ${chartBodyY})`)

    // Create the projection
    let projection = d3.geoMercator()
        // scale the projection
        .scale(50)
        // move the projection to the center
        .translate([xScaleWidth/2, yScaleHeight/2]);



    let path = d3.geoPath()
        .projection(projection)

    body.selectAll('path')
        .data(data.features)
        .enter()
        .append('path')
        .attr('d', d => path(d))
        .attr('stroke', 'rgba(0, 0, 0, 1)')
        .attr('fill', 'rgba(255, 255, 255, 1)')

}
