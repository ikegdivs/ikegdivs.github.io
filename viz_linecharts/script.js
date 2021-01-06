/*When the document is loaded*/
jQuery(function(){dataObj = [];
    mapObj = [];
    statsObj = [];
    data = null;

    let d3viz001 = d3.select("#d3viz001");
    let d3viz002 = d3.select("#d3viz002");
    let viz002svg001 = d3.select("#viz002svg001");

    // dataElements are classes for data row/objects.
    function dataElement(date, y){
        this.date = date;
        this.y = y;
    }

    // Create a set of 10 dataElements.
    for(i = 0; i < 10; i++){
        // Create a new date
        theDate = new Date(2021, 0, 1)
        // Add i days to the date
        //theDate.setDate(theDate.getDate() + i);
        // Add i months to the date
        theDate.setMonth(theDate.getMonth() + i);
        dataObj.push(new dataElement(theDate, i));
    }

    // Create a table for the source data.
    makeTable('d3viz001', dataObj, ['x', 'y']);

    representData(viz002svg001, dataObj);
})

function representData(location, data){
    location.attr('height', '300px');
    let body = d3.select('#body')
    
    let bodyHeight = 200;
    let bodyWidth = 400;
    let maxValue = d3.max(data, d => d.y);

    /* Invert the range in order to start from high values and
       move to low values. */
    let yScale = d3.scaleLinear()
        .range([bodyHeight, 0])
        .domain([0, maxValue]);

    body.style('transform', 'translate(50px,0px)');

    body.append('g')
        .call(d3.axisLeft(yScale))

    let xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, bodyWidth])

    body.append('g')
        .attr('transform', 'translate(0, ' + bodyHeight + ')')
        .call(d3.axisBottom(xScale)
            .tickFormat(d3.timeFormat('%b')))


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
