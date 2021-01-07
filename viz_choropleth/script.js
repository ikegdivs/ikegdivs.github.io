/*When the document is loaded*/
jQuery(function(){dataObj = [];
    mapObj = [];
    statsObj = [];
    data = null;

    let d3viz001 = d3.select("#d3viz001");
    let d3viz002 = d3.select("#d3viz002");
    let viz002svg001 = d3.select("#viz002svg001");

    // dataElements are classes for data row/objects.
    function dataElement(country, value){
        this.country = country;
        this.value = value;
    }

    // Asynchronously load the data
    d3.json('/data/countries.geojson').then(function(data){
        // Create and opulate the  descriptive data
        i = 0;
        for (let c of data.features){
            let country = c.properties.ADMIN;
            dataObj.push(new dataElement(country, i++));
        }
        console.log(data);
        // Create the chart
        representData(data, dataObj, viz002svg001);
        // Create the table
        makeTable('d3viz001', dataObj, ['country', 'value']);
    } )
})



function representData(mapData, descriptiveData, location){
    location.attr('height', '600px');
    location.attr('width', '600px');
    let body = d3.select('#body')

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
        .attr('stroke', 'rgba(0, 0, 0, 1)')
        // Color the countries according to the magnitude
        // if there is data available
        .attr('fill', d => d.properties.Magnitude ? cScale(d.properties.Magnitude) : 'white')

}

function makeTable(locationid, data, columns){
    function tabulate(data, columns) {
        /*Clear out the viz object*/
        document.getElementById(locationid).innerHTML = '';
        /*Create the table and add it to the viz object */
        var table = d3.select('#' + locationid).append('table');
        var thead = table.append('thead');
        var tbody = table.append('tbody');

        
        // append header row
        thead.append('tr')
            .selectAll('th')
            .data(columns).enter()
            .append('th')
                .text(function(column) {return column;});

        // create a row for each object in the data
        var rows = tbody.selectAll('tr')
                        .data(data)
                        .enter()
                        .append('tr');
        
        // Create a cell in each row for each column
        var cells = rows.selectAll('td')
                        .data(function (row) {
                            return columns.map(function (column) {
                                return {column: column, value: row[column]};
                            });
                        })
                        .enter()
                        .append('td')
                            .text(function (d) { return d.value; });

        /* Add the appropriate bootstrap classes */
        d3.select('#'+locationid+' table').node().classList.add('table');
        /* Alternate colors of rows. */
        d3.select('#'+locationid+' table').node().classList.add('table-striped');
        /* Color rows when hovered */
        d3.select('#'+locationid+' table').node().classList.add('table-hover');
        /* Ensure column headers are given column scope */
        d3.selectAll('#'+locationid+' thead tr th').attr('scope', 'col');

        return table;
    }

    // render the tables
    tabulate(data, columns);
}
