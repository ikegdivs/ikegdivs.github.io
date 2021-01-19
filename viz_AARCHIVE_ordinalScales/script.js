/*When the document is loaded*/
jQuery(function(){dataObj = [];
    mapObj = [];
    statsObj = [];
    data = null;

    let d3viz001 = d3.select("#d3viz001");
    let d3viz002 = d3.select("#d3viz002");
    let viz002svg001 = d3.select("#viz002svg001");

    // dataElements are classes for data row/objects.
    function dataElement(x, y){
        this.x = x;
        this.y = y;
    }

    // Create a set of 10 dataElements.
    for(i = 0; i < 10; i++){
        dataObj.push(new dataElement(i, i));
    }

    // Create a table for the source data.
    makeTable('d3viz001', dataObj, ['x', 'y']);

    representData(viz002svg001, dataObj);
})

function representData(location, data){
    location.attr('height', '200px');
    let max = d3.max(data, d => d.y)
    let widthScale = d3.scaleLinear()
                    .range([0, 200])
                    .domain([0, max])

    let positionScale = d3.scaleBand()
                            .range([0,200])
                            .round(true)
                            .domain(data.map(d => d.x))
                            .padding(0.3)
    
    let join = location.selectAll('rect').data(data);

    join.enter()
        .append('rect')
        .attr('fill', 'lightblue')
        .style('width', d => widthScale(d.y))
        .attr('height', positionScale.bandwidth())
        .attr('y', d => positionScale(d.x))
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
