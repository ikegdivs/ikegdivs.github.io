/*When the document is loaded*/
jQuery(function(){
    dataObj = [];
    mapObj = [];
    data = null;
    d3viz001 = d3.select("#d3viz001");

    /* dataElements are classes for data row/objects. */
    function dataElement(x, y){
        this.x = x;
        this.y = y;
    }

    // Create a set of 10 dataElements.
    for(i = 0; i < 10; i++){
        dataObj.push(new dataElement(i, i));
    }

    // Create a table for the source data.
    makeTable('d3viz001', dataObj);

    // Clone the original array
    dataObj2 = dataObj.map( d => Object.assign({}, d));

    // Apply a map function to the array 
    dataObj2.map(d => {d.y = Math.sqrt(d.x); return d;})

    // Apply a reducer function to the array
    let sum = dataObj2.reduce((prev, curr) => {
        return prev + curr.y
    }, 0)

    let mean = sum / dataObj2.length;

    /* Append the mean to the dataObj2 */
    dataObj2.push(new dataElement(dataObj2.length, mean));

    // Create a table for the mapped data
    makeTable('d3viz002', dataObj2);
})


function makeTable(locationid, data){
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
                            .text(function (d) {return d.value; });

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
    tabulate(data, ['x', 'y']);
}
