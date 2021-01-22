// When the document is loaded:
// Load some geodata
// Draw a map with the data.
document.addEventListener("DOMContentLoaded", function(){
    // Identify where we are drawing the map.
    let viz_svg01 = d3.select("#viz_svg01");

    // Asynchronously load the data
    d3.json('/data/countries.geojson').then(function(data){
        // dataObj holds the values assigned to each country.
        dataObj = [];

        // dataElements are classes for data row/objects.
        function dataElement(country, value){
            this.country = country;
            this.value = value;
        }

        // Create and populate the  descriptive data
        i = 0;
        for (let c of data.features){
            let country = c.properties.ADMIN;
            dataObj.push(new dataElement(country, i++));
        }
        
        // Create the chart
        representData(data, dataObj, viz_svg01);

        // If the user changes the X slider, adjust the color of the map elements
        $('#formControlRangeX').on('input', function(event){
            elementcolor =  Math.round(parseFloat($(event.currentTarget).prop('value')) * 2.5);
            
            // Create the color range
            colorRange = [`rgb(0, 255, 255)`, `rgb(${255 - elementcolor}, 0, 255)`, `rgb(255, 0, 0)`];
            setMapColors(data, viz_svg01, colorRange);
        })
    } )
})

function representData(mapData, descriptiveData, location){
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
        let descriptor = dataIndex[country];
        d.properties.Descriptor = descriptor;
        return d;
    })

    // Create the projection
    let projection = d3.geoMercator()
        // scale the projection
        .scale(50)
        // move the projection to the center
        .translate([xScaleWidth/2, yScaleHeight/2]);

    let path = d3.geoPath()
        .projection(projection)

    body.selectAll('path')
        .data(mapData.features)
        .enter()
        .append('path')
        .attr('d', d => path(d))
        .attr('stroke', 'rgba(0, 0, 0, 1)')
        .attr('stroke-width', '0')

    // Color the map elements
    setMapColors(mapData, location, ['rgb(0, 255, 255)', 'rgb(255, 0, 255)', 'rgb(255, 0, 0)']);
}

// setMapColors is used to adjust the colors of the map. This is called when the map is
// first created, as well as when the slider is moved.
function setMapColors(mapData, location, colorRange){
    //Calculate statistics
    let maxVal = d3.max(mapData.features, d => d.properties.Descriptor);
    let medVal = d3.median(mapData.features, d => d.properties.Descriptor);

    // Create a color scale for the choropleth
    // Separate by median.
    let cScale = d3.scaleLinear()
                    .domain([0, medVal, maxVal])
                    .range(colorRange)

    location.selectAll('path')
        // Color the countries according to the descriptor value
        // if there is data available
        .attr('fill', d => d.properties.Descriptor ? cScale(d.properties.Descriptor) : 'white')
}