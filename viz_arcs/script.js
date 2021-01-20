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

    // Create a table for the source data.
    makeTable('d3viz001', dataObj, ['category', 'sales']);

    representData(viz002svg001, dataObj);
})

function representData(location, data){
    location.attr('height', '300px');
    location.attr('left', '100px');
    location.attr('top', '100px');
    let body = d3.select('#body')
    
    let bodyHeight = 200;
    let bodyWidth = 400;

    // Create a pie function to translate values into arcs
    let pie = d3.pie()
        .value(d => d.sales)

    // set colors for chart
    let colorScale = d3.scaleOrdinal()
        .range(d3.schemeCategory10)
        .domain(data.map(d => d.category))

    // Create the arcs for the pie chart
    let arc = d3.arc()
        .outerRadius(bodyHeight/2)
        .innerRadius(50);
    
    console.log(data);
    console.log(pie(data));
    
    // Create the groups
    let g = body.selectAll('.arc')
        .data(pie(data))
        //only append g on new data
        .enter()
        .append('g')

    g.append('path')
        .attr('d', arc)
        .attr('fill', d => { return colorScale(d.data.category)})

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
