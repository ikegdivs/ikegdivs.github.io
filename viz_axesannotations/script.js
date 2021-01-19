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

    representData(viz002svg001, dataObj);
})

function representData(location, data){
    location.attr('viewBox', '0 0 260 240');
    let max = d3.max(data, d => d.y)
    let scale = d3.scaleLinear()
                    .range([0, 200])
                    .domain([0, max])

    let scalePosition = d3.scaleBand()
                            .range([0,200])
                            .round(true)
                            .domain(data.map(d => d.x))
                            .padding(0.3)
    
    let join = d3.select('#body').selectAll('rect').data(data);

    join.enter()
        .append('rect')
        .attr('fill', 'lightblue')
        .style('stroke', 'white')
        .style('width', d => scale(d.y))
        .attr('height', scalePosition.bandwidth())
        .attr('y', d => scalePosition(d.x))

    // Create the x axis
    let xAxis = d3.axisBottom(scale)
                    .ticks(5)
                    .tickFormat(d => d + ' $')
    d3.select('#xAxis')
        .attr('transform', 'translate(50, 200)')
        .call(xAxis)
    
    // Create the y axis
    let yAxis = d3.axisLeft(scalePosition)
    d3.select('#yAxis')
        .attr('transform', 'translate(50, 0)')
        .call(yAxis)
}
