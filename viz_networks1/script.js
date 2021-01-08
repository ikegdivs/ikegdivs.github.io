/*When the document is loaded*/
jQuery(function(){
    dataObj = [];
    mapObj = [];
    statsObj = [];
    pointsObj = [];
    data = null;

    let d3viz001 = d3.select("#d3viz001");
    let d3viz002 = d3.select("#d3viz002");
    let viz002svg001 = d3.select("#viz002svg001");

    // Asynchronously load the data
    d3.json('./data/network.json').then(function(data){
        // Copy data.links (kept for testing)
        //linksCopy = data.links.map(d => Object.assign({}, d));
        // Create the table using data.links
        makeTable('d3viz001', data.links, ['source', 'target']);
        // Create the chart
        representData(data, viz002svg001);
    } )
})

function representData(data, location){
    let bodyHeight = 400;
    let bodyWidth = 400;
    location.attr('height', bodyHeight + 'px');
    location.attr('width', bodyWidth + 'px');
    let body = d3.select('#body');

    // Create the network data elements
    createElements(body, data);

    // To create a network force diagram
    let simulation = d3.forceSimulation()
        // Apply forceLink to the links to pull them together
        .force('link', d3.forceLink()
        // Designate the id of one node for the force
        .id((d) => d.id))
        // Apply force to push apart elements
        .force('charge', d3.forceManyBody())
        // Results should be towards the center of the diagram
        .force('center', d3.forceCenter(bodyWidth/2, bodyHeight/2))
    
    simulation.nodes(data.nodes)
        // When the simulation is run, data is updated
        .on('tick', updateElements);

    simulation.force('link').links(data.links);
}

// Creating the network visualization
function createElements(body, data) {
    let nodes = body.append('g')
        .attr('class', 'nodes')
        .selectAll('circle')
        .data(data.nodes)
        .enter()
        .append('circle')
        .attr('r', 5)
        .attr('fill', 'red')

    let links = body.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(data.links)
        .enter()
        .append('line')
        .attr('stroke', 'black')
}

// Updating the network visualization
function updateElements() {
    d3.select('.nodes')
        .selectAll('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)

    d3.select('.links')
        .selectAll('line')
        .attr('x1', d => d.source.x )
        .attr('y1', d => d.source.y )
        .attr('x2', d => d.target.x )
        .attr('y2', d => d.target.y )
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
