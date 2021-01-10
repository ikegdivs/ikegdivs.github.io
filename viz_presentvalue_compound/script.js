/*When the document is loaded*/
jQuery(function(){
    let d3viz001 = d3.select("#d3viz001");
    let d3viz002 = d3.select("#d3viz002");
    let viz002svg001 = d3.select("#viz002svg001");
    let currentAsset = null;

    // UserWorkspace
    // The UserWorkspace outlines the data that the user 
    // is currently working with
    class UserWorkspace {
        constructor(id, currentAssetId){
            this.id = id;
            this.currentAssetId = currentAssetId;
        }
    }
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

    // assetData contains the main parameters for the asset within the financial model.
    // This is an annuity asset, with annual payments
    // sd: start date
    // ed: end date
    // pa: payment
    // ir: interest rate
    class AssetData{
        constructor(sd, ed, pa, ir, series = []){
            this.sd = sd;
            this.ed = ed;
            this.pa = pa;
            this.ir = ir;
            this.series = series;
            // Base values for slider adjusments
            this.sd_base = sd;
            this.ed_base = ed;
            this.pa_base = pa;
            this.ir_base = ir;
        }
    }

    // An assetGroup holds assets. For this program, an assetGroup
    // can be used to iterate through assets and place them in a model.
    class AssetGroup{
        constructor(id, assets = []){
            this.id = id;
            this.assets = assets;
        }
    }

    // A model is applied to assets in order to modify the series data 
    // in the asset. This is likely to mean that asset series data
    // will eventually be a many-to-one relationship with the asset,
    // but for now running a model on an asset just modifies it's
    // series data. It may also be necessary to create an "Asset Output"
    // class which an asset can have multiple versions of
    // and which are stamped by the model id that produced that data.
    class PresentValueModel{
        constructor(id, sd, ed){
            this.id = id;
            this.sd = sd;
            this.ed = ed;
        }

        // calcVals should be thought of as the prototype output of a model:
        // the yearly value (or other time-based) of the asset(s).
        // This is the value called on by the non-complex charting methods.
        // input:
        // asset: the asset being examined by this model
        calcVals(asset){ 
            // Create a set of dataElements with a count equal to the number of years in the model.
            let startYear = asset.sd.getFullYear();
            let endYear = asset.ed.getFullYear();
            let interval = endYear - startYear;

            // Clear out any asset series data
            asset.series = [];

            for(let i = 0; i <= interval; i++){
                // Create a new date i years from the model start
                var theDate = new Date(asset.sd.getTime());
                theDate.setYear(theDate.getFullYear() + i);
                // Set the value for this asset
                let val = this.pva(asset.ir, asset.pa, interval - i);
                asset.series.push(new dataElement(theDate, parseFloat(val.toFixed(2))));
            }
        }

        // Calculate the present value of an annuity
        // ir: interest rate
        // pa: payment amount
        // periodNumber: the period we are calculating the present value for
        pva(ir, pa, periodNumber){ 
            let r1rn = (ir * Math.pow(1 + ir, periodNumber));
            let val = pa * ( 1 / ir - 1 / r1rn) 
            return val;
        }
    }

    // *****************************************************
    // Tabulator
    // *****************************************************
    //define some sample data
    var tabledata = [
        {id:1, name:"Oli Bob", age:"12", col:"red", dob:""},
        {id:2, name:"Mary May", age:"1", col:"blue", dob:"14/05/1982"},
        {id:3, name:"Christine Lobowski", age:"42", col:"green", dob:"22/05/1982"},
        {id:4, name:"Brendon Philips", age:"125", col:"orange", dob:"01/08/1980"},
        {id:5, name:"Margret Marmajuke", age:"16", col:"yellow", dob:"31/01/1999"},
    ];

    //create Tabulator on DOM element with id "example-table"
    var table = new Tabulator("#example-table", {
        height:205, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
        data:tabledata, //assign data to table
        layout:"fitColumns", //fit columns to width of table (optional)
        columns:[ //Define Table Columns
            {title:"Name", field:"name", width:150},
            {title:"Age", field:"age", hozAlign:"left", formatter:"progress"},
            {title:"Favourite Color", field:"col"},
            {title:"Date Of Birth", field:"dob", sorter:"date", hozAlign:"center"},
        ],
        rowClick:function(e, row){ //trigger an alert message when the row is clicked
            alert("Row " + row.getData().id + " Clicked!!!!");
        },
    });

    // ******************************************************
    // Initialization
    // ******************************************************

    // Create a mockup of the model and assets
    thisModel = new PresentValueModel( 0, new Date(2010, 0, 1), new Date( 2020, 0, 1));
    theseAssets = new AssetGroup(0);
    asset01 = new AssetData(  new Date(2011, 0, 1), new Date(2019, 0, 1), 100, 0.15 );
    asset02 = new AssetData(  new Date(2009, 0, 1), new Date(2025, 0, 1), 200, 0.2 );
    workspace = new UserWorkspace(0, 0);
    // Add the assets the the asset group
    theseAssets.assets.push(asset01);
    theseAssets.assets.push(asset02);

    currentAsset = theseAssets.assets[0];

    // Run the model using the default parameters
    // on the assets in the AssetGroup
    theseAssets.assets.forEach(function(asset){
        asset.series = [];
        thisModel.calcVals(asset);
    })

    // Create the graphic representation of the model
    drawModel(theseAssets.assets, thisModel);

    // *********************************************
    // Form input
    // *********************************************

    // If the user changes the slider, change the start date
    $('#formRangeModelStart').on('input', function(event){
        thisYear = currentAsset.sd_base.getFullYear();
        sliderVal = parseFloat((event.currentTarget.value)).toFixed(2) - 50;
        currentAsset.sd = new Date(thisYear + sliderVal, 0, 1);
        thisModel.calcVals(currentAsset);
        drawModel(theseAssets.assets, thisModel);
    })

    // If the user changes the model start year update the model
    $('#modelStart').on('input', function(event){
        // Change both the base and the model
        currentAsset.sd = new Date(event.currentTarget.value, 0, 1);
        currentAsset.sd_base = currentAsset.sd;
        thisModel.calcVals(currentAsset);
        drawModel(theseAssets.assets, thisModel);
    })

    // If the user changes the end date slider, change the end date
    $('#formRangeModelEnd').on('input', function(event){
        thisYear = currentAsset.ed_base.getFullYear();
        sliderVal = parseFloat((event.currentTarget.value)).toFixed(2) - 50;
        currentAsset.ed = new Date(thisYear + sliderVal, 0, 1);
        thisModel.calcVals(currentAsset);
        drawModel(theseAssets.assets, thisModel);
    })

    // If the user changes the model end year update the model
    $('#modelEnd').on('input', function(event){
        // Change both the base and the model
        currentAsset.ed = new Date(event.currentTarget.value, 0, 1);
        currentAsset.ed_base = currentAsset.ed;
        thisModel.calcVals(currentAsset);
        drawModel(theseAssets.assets, thisModel);
    })

    // If the user changes the interest rate slider, change the interest rate
    $('#formRangeInterestRate').on('input', function(event){
        thisVal = parseFloat(currentAsset.ir_base);
        sliderVal = parseFloat((event.currentTarget.value)).toFixed(2) - 50;
        currentAsset.ir = thisVal + sliderVal/500;
        thisModel.calcVals(currentAsset);
        drawModel(theseAssets.assets, thisModel);
    })

    // If the user changes the interest rate, update the model
    $('#interestRate').on('input', function(event){
        // Change both the base and the model
        currentAsset.ir = parseFloat(event.currentTarget.value);
        currentAsset.ir_base = currentAsset.ir;
        thisModel.calcVals(currentAsset);
        drawModel(theseAssets.assets, thisModel);
    })

    // If the user changes the annuity payment slider, change the annuity payment
    $('#formRangeAnnuityPayment').on('input', function(event){
        thisVal = parseFloat(currentAsset.pa_base);
        sliderVal = parseFloat((event.currentTarget.value)).toFixed(2) - 50;
        currentAsset.pa = thisVal * (1 + sliderVal/50);
        thisModel.calcVals(currentAsset);
        drawModel(theseAssets.assets, thisModel);
    })

    // If the user changes the annuity payment, update the model
    $('#annuityPayment').on('input', function(event){
        // Change both the base and the model
        currentAsset.pa = parseFloat(event.currentTarget.value);
        currentAsset.pa_base = currentAsset.pa;
        thisModel.calcVals(currentAsset);
        drawModel(theseAssets.assets, thisModel);
    })

    // If the user clicks the 'next asset' button, change currentAsset to the next asset in 'theseAssets'
    $('#nextAsset').on('click', function(event){
        event.preventDefault();
        thisAssetId = workspace.currentAssetId;
        // If thisAssetId + 1 is greater than or equal to the number of assets in 
        // theseAssets, thisAssetId = 0, otherwise add 1 to thisAssetId
        if(thisAssetId + 1 >= theseAssets.assets.length){
            thisAssetId = 0;
        } else {
            thisAssetId++;
        }

        workspace.currentAssetId = thisAssetId;
        currentAsset = theseAssets.assets[thisAssetId];

        drawModel(theseAssets.assets, thisModel);
    })

    // *********************************************
    // Internal functions
    // *********************************************

    function drawModel(data, model){
        // Create a table for the source data.
        makeTable('d3viz001', currentAsset.series, ['year', 'val']);

        representData(viz002svg001, data);
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
    // Chart creation
    // ********************************************

    // Invert the range in order to start from high values and
    // move to low values. 
    let x = data[0].series;

    let thismax = d3.max(data[0].series, d => d.val);

    // Find the max of all of the y values in order to set the y scale
    let yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d3.max(d.series, d => d.val))]).nice()
        .range([bodyHeight, 0]);

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

    // Find the max and min of all of the x values in order to set the x scale
    let xScale = d3.scaleTime()
        .domain([d3.min(data, d => d3.min(d.series, d => d.date)), d3.max(data, d => d3.max(d.series, d => d.date))]).nice()
        .range([0, bodyWidth]);

    // Create the line
    var valueline = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.val))

    let lines = body.append('g')
        .attr('class', 'lines')

    lines.selectAll('.line-group')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'line-group')
        .append('path')
        .attr('class', 'chartLine')
        .attr('d', d => valueline(d.series))
        .style('stroke', 'black')
        //.style('stroke', (d, i) => color(i))

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
