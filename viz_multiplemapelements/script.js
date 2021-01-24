/*When the document is loaded*/
jQuery(function(){
    dataObj = [];
    mapObj = [];
    statsObj = [];
    pointsObj = [];
    data = null;

    let viz_svg01 = d3.select("#viz_svg01");

    // dataElements are classes for data row/objects.
    function dataElement(country, value){
        this.country = country;
        this.value = value;
    }

    // Point data for the map
    function pointData(id, x, y, value){
        this.id = id;
        this.x = x;
        this.y = y;
        this.value = value;
    }

    // Asynchronously load the data
    d3.json('/data/countries.geojson').then(function(data){
        // Create and populate the descriptive data
        i = 0;
        for (let c of data.features){
            let country = c.properties.ADMIN;
            dataObj.push(new dataElement(country, i++));
        }

        // Create some point data
        for (j = 0; j < 20; j++){
            pointsObj.push(new pointData(j, 50 + j * 2, 50 + j * 2, j * 10))
        }

        // Create the chart
        representData(data, dataObj, pointsObj, viz_svg01);
    } )
})

function representData(mapData, descriptiveData, pointsObj, location){
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

    // clean out the location:
    location.innerHTML = '';

    // Add groups to the svg for the body of the chart.
    body = location.append('g')
                .attr('id', 'chartBody')
                .attr('transform', `translate(${chartBodyX}, ${chartBodyY})`)
                
    // Create a pairing of descriptive data and country name
    let dataIndex = {};
    for (let c of descriptiveData){
        let country = c.country;
        dataIndex[country] = c.value;
    }

    // Combine the map and descriptive data
    mapData.features = mapData.features.map(d => {
        let country = d.properties.ADMIN;
        let magnitude = dataIndex[country];
        d.properties.Magnitude = magnitude;
        return d;
    })

    //Calculate statistics
    let maxVal = d3.max(mapData.features, d => d.properties.Magnitude);
    let medVal = d3.median(mapData.features, d => d.properties.Magnitude);

    // Create a color scale for the choropleth
    // Separate by median.
    let cScale = d3.scaleLinear()
        .domain([0, medVal, maxVal])
        .range(['white','orange', 'red'])

    let bodyHeight = 400;
    let bodyWidth = 400;

    // Create the projection
    let projection = d3.geoMercator()
        // scale the projection
        .scale(50)
        // move the projection to the center
        .translate([bodyWidth/2, bodyHeight/2]);

    let path = d3.geoPath()
        .projection(projection)

    body.selectAll('path')
        .data(mapData.features)
        .enter()
        .append('path')
        .attr('d', d => path(d))
        .attr('stroke', 'rgba(150, 150, 150, 0.7)')
        // Color the countries according to the magnitude
        // if there is data available
        .attr('fill', d => d.properties.Magnitude ? cScale(d.properties.Magnitude) : 'white')

    body.selectAll('circle')
        .data(pointsObj)
        .enter()
        .append('circle')
        .attr('r', 3)
        .attr('fill', 'green')
        .attr('cx', d => projection([+d.y, +d.x])[0])
        .attr('cy', d => projection([+d.y, +d.x])[1])
}