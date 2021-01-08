/*When the document is loaded*/
jQuery(function(){
    dataObj = [];
    mapObj = [];
    statsObj = [];
    data = null;

    let d3viz001 = d3.select("#d3viz001");
    let d3viz002 = d3.select("#d3viz002");
    let viz002svg001 = d3.select("#viz002svg001");

    // dataElements are classes for data row/objects.
    // date: independent variable
    // val: asset valuation
    // year: year portion of date
    class dataElement {
        constructor(date, val){
            this.date = date;
            this.val = val;
            this.year = this.date.getFullYear();
        }
    }

    // modelData contains the main parameters for the financial model.
    // sd: start date
    // ed: end date
    // pc: purchasing costs
    // sv: salvage value
    // al: asset lifespan
    // dr: depreciation ratio

    class modelData{
        constructor(sd, ed, pc, sv, al){
            this.sd = sd;
            this.ed = ed;
            this.pc = pc;
            this.sv = sv;
            this.al = al;
            // Base values for slider adjusments
            this.sd_base = sd;
            this.ed_base = ed;
            this.pc_base = pc;
            this.sv_base = sv;
            this.al_base = al;
        }
        // Double declining balance equation:
        // 2 * 1 / (asset lifespan)
        dr(){ return 2 * 1 / this.al; }

        // calcVal should be thought of as the main output of this model:
        // the yearly value (or other time-based) of the asset(s).
        // This is the value called on by the non-complex charting methods.
        // input: The current total of years in use.
        calcVal(input){ return this.pc * ( Math.pow(1 - this.dr(), i)); }
        
    }

    // Create a mockup of the model
    thisModel = new modelData(  new Date(2010, 0, 1), 
                            new Date(2020, 0, 1), 
                            100, 
                            5,
                            5);

    // Run the model using the default parameters
    dataObj = runModel(thisModel);

    // Create the graphic representation of the model
    drawModel(dataObj, thisModel);

    // *********************************************
    // Form input
    // *********************************************

    // If the user changes the slider, change the start date
    $('#formRangeModelStart').on('input', function(event){
        thisYear = thisModel.sd_base.getFullYear();
        sliderVal = parseFloat((event.currentTarget.value)).toFixed(2) - 50;
        thisModel.sd = new Date(thisYear + sliderVal, 0, 1);
        dataObj = runModel(thisModel);
        drawModel(dataObj, thisModel);
    })

    // If the user changes the model start year update the model
    $('#modelStart').on('input', function(event){
        // Change both the base and the model
        thisModel.sd = new Date(event.currentTarget.value, 0, 1);
        thisModel.sd_base = thisModel.sd;
        dataObj = runModel(thisModel);
        drawModel(dataObj, thisModel);
    })

    // If the user changes the end date slider, change the end date
    $('#formRangeModelEnd').on('input', function(event){
        thisYear = thisModel.ed_base.getFullYear();
        sliderVal = parseFloat((event.currentTarget.value)).toFixed(2) - 50;
        thisModel.ed = new Date(thisYear + sliderVal, 0, 1);
        dataObj = runModel(thisModel);
        drawModel(dataObj, thisModel);
    })

    // If the user changes the model end year update the model
    $('#modelEnd').on('input', function(event){
        // Change both the base and the model
        thisModel.ed = new Date(event.currentTarget.value, 0, 1);
        thisModel.ed_base = thisModel.ed;
        dataObj = runModel(thisModel);
        drawModel(dataObj, thisModel);
    })

    // If the user changes the purchase cost slider, change the purchase cost
    $('#formRangePurchaseCost').on('input', function(event){
        thisVal = thisModel.pc_base;
        sliderVal = parseFloat((event.currentTarget.value)).toFixed(2);
        thisModel.pc = thisVal * sliderVal/50;
        dataObj = runModel(thisModel);
        drawModel(dataObj, thisModel);
    })

    // If the user changes the purchase cost, update the model
    $('#purchaseCost').on('input', function(event){
        // Change both the base and the model
        thisModel.pc = parseFloat(event.currentTarget.value);
        thisModel.pc_base = thisModel.pc;
        $('#formRangePurchaseCost').val(50);
        dataObj = runModel(thisModel);
        drawModel(dataObj, thisModel);
    })

    // If the user changes the salvage value slider, change the salvage value
    $('#formRangeSalvageValue').on('input', function(event){
        thisVal = thisModel.sv_base;
        sliderVal = parseFloat((event.currentTarget.value)).toFixed(2) - 50;
        thisModel.sv = thisVal + sliderVal;
        dataObj = runModel(thisModel);
        drawModel(dataObj, thisModel);
    })

    // If the user changes the salvage value, update the model
    $('#salvageValue').on('input', function(event){
        // Change both the base and the model
        thisModel.sv = event.currentTarget.value;
        thisModel.sv_base = thisModel.sv;
        dataObj = runModel(thisModel);
        drawModel(dataObj, thisModel);
    })

    // If the user changes the expected lifespan slider, change the expected lifespan
    $('#formRangeAssetLifespan').on('input', function(event){
        thisVal = thisModel.al_base;
        sliderVal = parseFloat((event.currentTarget.value)).toFixed(2) - 50;
        thisModel.al = thisVal + sliderVal;
        dataObj = runModel(thisModel);
        drawModel(dataObj, thisModel);
    })

    // If the user changes the expected lifespan, update the model
    $('#assetLifespan').on('input', function(event){
        // Change both the base and the model
        thisModel.al = event.currentTarget.value;
        thisModel.sd_base = thisModel.sd;
        dataObj = runModel(thisModel);
        drawModel(dataObj, thisModel);
    })

    // *********************************************
    // Internal functions
    // *********************************************

    function runModel(model){
        data = [];
        // Create a set of dataElements with a count equal to the number of years in the model.
        startYear = model.sd.getFullYear();
        endYear = model.ed.getFullYear();
        interval = endYear - startYear;

        for(i = 0; i < interval; i++){
            // Create a new date i years from the model start
            var theDate = new Date(model.sd.getTime());
            theDate.setYear(theDate.getFullYear() + i);
            // Set the value for this asset
            val = model.calcVal(i);
            data.push(new dataElement(theDate, parseFloat(val.toFixed(2))));
        }

        return data;
    }

    function drawModel(data, model){
        // Create a table for the source data.
        makeTable('d3viz001', data, ['year', 'val']);

        // Draw the chart
        representData(viz002svg001, data);

        // Update the form's annual depreciation (here a ratio).
        $('#annualDepreciation').val(model.dr());
        $('#annualDepreciation').text(model.dr());
    }
})



function representData(location, data){
    location.attr('viewBox', '0 0 500 500');
    let body = d3.select('#body')
    
    let bodyHeight = 400;
    let bodyWidth = 400;
    let maxValue = d3.max(data, d => d.val);
    let yAxisWidth = 30;
    let xAxisHeight = 30;

    // clear out the groups
    document.getElementById('body').innerHTML = "";

    // ********************************************
    // SVG filter definitions
    // ********************************************
    var defs = location.append('defs');

    // Glow filter
    var filter = defs.append('filter')
        .attr('id', 'glow');
    filter.append('feGaussianBlur')
        .attr('stdDeviation', '2')
        .attr('result', 'coloredBlur');
    var feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode')
        .attr('in', 'coloredBlur');
    feMerge.append('feMergeNode')
        .attr('in', 'SourceGraphic');

    // Outline filter
    var filter2 = defs.append('filter')
        .attr('id', 'outline')
        .attr('filterUnits', 'userSpaceOnUse')
    filter2.append('feMorphology')
        .attr('in', 'SourceAlpha')
        .attr('operator', 'dilate')
        // This border is 2 pixels wide
        .attr('radius', '2')
        .attr('result', 'e1')
    filter2.append('feMorphology')
        .attr('in', 'SourceAlpha')
        .attr('operator', 'dilate')
        // This border starts at the edges of the group
        .attr('radius', '0')
        .attr('result', 'e2')
    filter2.append('feComposite')
        .attr('in', 'e1')
        .attr('in2', 'e2')
        .attr('operator', 'xor')
        .attr('result', 'outline')
    filter2.append('feColorMatrix')
        .attr('type', 'matrix')
        .attr('in', 'outline')
        .attr('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.3 0')
        .attr('result', 'outline2')
    filter2.append('feComposite')
        .attr('in', 'outline2')
        .attr('in2', 'SourceGraphic')
        .attr('operator', 'over')
        .attr('result', 'output')
    
    // Shadow filter (1)
    var filter3 = defs.append('filter')
        .attr('id', 'shadow01')
        .attr('filterUnits', 'userSpaceOnUse')
    filter3.append('feDropShadow')
        .attr('dx', '10')
        .attr('dy', '10')
        .attr('stdDeviation', '5')
        .attr('flood-color', 'rgba(150, 150, 150, 0.8')
        .attr('flood-opacity', '0.35')


    // ********************************************
    // Chart creation
    // ********************************************

    /* Invert the range in order to start from high values and
       move to low values. */
    let yScale = d3.scaleLinear()
        .range([bodyHeight, 0])
        .domain([0, maxValue]);

    let axesColor = 'rgba(240, 240, 235, 1)'
    let chartColor = 'rgba(250, 250, 245, 1)'

    // Create the chart background
    chartBG = body.append('g');
    chartBG
        .append('rect')
        .attr('width', bodyWidth + yAxisWidth * 3)
        .attr('height', bodyHeight + xAxisHeight * 3)
        .style('fill', chartColor)
        .attr('transform', `translate(-${yAxisWidth * 2}, -${xAxisHeight})`)
    // Apply merge filter to axes backgrounds
    chartBG
        .style('filter', 'url(#outline)')

    let xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([0, bodyWidth])

    // Create the line
    valueline = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.val))

    // Bind the data
    path = body.append('path')
    .datum(data)
    .attr('d', d => valueline(d))
    // Don't let path close
    .attr('class', 'chartLine')
    // Add the glow
    .style('filter', 'url(#glow)')

    // Create the axes background
    // y axes background
    axesBG = body.append('g');
    axesBG
        .append('rect')
        .attr('width', yAxisWidth)
        .attr('height', bodyHeight)
        .style('fill', axesColor)
        .attr('transform', `translate(-${yAxisWidth}, 0)`)
    // y axes background
    axesBG
        .append('rect')
        .attr('width', bodyWidth + yAxisWidth)
        .attr('height', yAxisWidth)
        .style('fill', axesColor)
        .attr('transform', `translate(-${yAxisWidth}, ${bodyHeight})`)
    // Apply merge filter to axes backgrounds
    axesBG
        .style('filter', 'url(#outline)')
        .style('filter', 'url(#shadow01)')

    // Create the y axis
    body.append('g')
        .call(d3.axisLeft(yScale))
        .selectAll('path')
        .attr('stroke', 'rgba(50, 50, 50, 0.7)')
        .attr('stroke-width', '1px')

    

    body.append('g')
        .attr('transform', 'translate(0, ' + bodyHeight + ')')
        .call(d3.axisBottom(xScale)
            .tickFormat(d3.timeFormat('%Y')))
        .append('text')
        .attr('class', 'axis-label')
        .text('Year')
        .attr('fill', 'rgba(50, 50, 50, 0.9)')
        .attr('x', bodyWidth/2)
        .attr('y', 40)

        
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
