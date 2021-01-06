/*When the document is loaded*/
jQuery(function(){dataObj = [];
    mapObj = [];
    statsObj = [];
    data = null;

    let d3viz001 = d3.select("#d3viz001");
    let d3viz002 = d3.select("#d3viz002");
    let viz002svg001 = d3.select("#viz002svg001");

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
        representData(data, viz002svg001);
        // Create a table for the source data.
        //"ADMIN": "Aruba", "ISO_A3": "ABW"
        console.log(data);
        makeTable('d3viz001', dataObj, ['category', 'sales']);
    } )
})



function representData(data, location){
    location.attr('height', '600px');
    location.attr('width', '600px');
    let body = d3.select('#body')
    
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
        .data(data.features)
        .enter()
        .append('path')
        .attr('d', d => path(d))
        .attr('stroke', 'rgba(0, 0, 0, 1)')
        .attr('fill', 'rgba(255, 255, 255, 1)')

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
