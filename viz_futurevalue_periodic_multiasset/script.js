/*When the document is loaded*/
jQuery(function(){
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
            //this.year = moment(date, "DD/MM/YYYY").year();
        }
    }

    // AssetData contains the main parameters for the asset within the financial model.
    // Assets should be more mixable.
    // pp: initial purchasce price
    // sd: start date
    // ed: end date
    // pa: payment
    // dr: discount rate
    class AssetData{
        constructor(id, sd, ed, pp, pa, dr){
            this.id = id;
            this.sd = sd;
            this.ed = ed;
            this.pp = pp;
            this.pa = pa;
            this.dr = dr;
            // Base values for slider adjusments
            this.sd_base = sd;
            this.ed_base = ed;
            this.pp_base = pp;
            this.pa_base = pa;
            this.dr_base = dr;
        }

        resetBase(){
            this.sd_base = this.sd;
            this.ed_base = this.ed;
            this.pp_base = this.pp;
            this.pa_base = this.pa;
            this.dr_base = this.dr;
        }

        reapplyBase(){
            this.sd = this.sd_base;
            this.ed = this.ed_base;
            this.pp = this.pp_base;
            this.pa = this.pa_base;
            this.dr = this.dr_base;
        }
    }

    // AssetModelData is an association of assets and models
    // and the resulting data of those assets and models
    class AssetModelData{
        constructor(assetid, modelid, series = []){
            this.assetid = assetid;
            this.modelid = modelid;
            this.series = series;
        }
    }

    // A periodic compounding model is applied to assets in order to modify or create
    // series data associated with both the model and the asset.
    // For periodic compounding, the interest is maintained as a yearly
    // rate, while the periods are identified as the count of periods
    // per year.
    class PeriodicCompoundingModel{
        constructor(id, sd, ed, pd){
            // Model ID
            this.id = id;
            // Model start date
            this.sd = sd;
            // Model end date
            this.ed = ed;
            // Model yearly periods (0 for continuously compounded)
            this.pd = pd;
            // Base values for sliders. This should be a separate class
            this.pd_base = pd;
        }

        // calcVals is the prototype output of a model:
        // input: 
        //   asset: the asset being examined by the model
        // output: 
        //   assetModelData: an array that will be placed in an AssetModelData class.
        calcVals(asset){
            // Prepare the model parameters for the asset.
            // Since this is a compounding model, it may
            // be a good idea to consider the month and date of 
            // the asset start and asset end. I'll need to modify this a little for that to work.
            // This means that while the previous models used startYear, endYear,
            // this one should just stick with asset.sd and asset.ed (startDate and endDate).
            let startDate = moment(asset.sd);
            let endDate = moment(asset.ed);
            let interval = endDate.diff(startDate, 'years', true);

            // Testing moment.js fractional year difference.
            console.log(interval);

            // Prepare the output object
            let assetModelData = [];

            for(let i = 0; i <= interval; i++){
                // Create a new date i years from the model start
                let theDate = moment(asset.sd, "MM/DD/YYYY").add('years', i);
                
                // Set the value for this asset using the present value perpetuity function
                let val = this.fvperiodic(asset.pp, asset.dr, this.pd, i);
                assetModelData.push(new dataElement(theDate.format('MM/DD/YYYY'), parseFloat(val.toFixed(2))));
            }

            return assetModelData;
        }

        // Calculate the periodic compounding of an asset
        // pp: initial purchase price
        // dr: discount rate
        // pd: number of counpounding periods per year
        // i: the current year number (assuming the first year i == 0)
        fvperiodic(pp, dr, pd, i){ 
            let val = 0;
            // If the interest is continually compounded (period is 0), use the continuous compounding formula.
            if(pd < 1){
                val = pp * Math.exp(dr * i)
            }else{
                val = pp * Math.pow(1 + dr/pd, pd*i);
            }
            return val;
        }
    }
    // A perpetuity model is applied to assets in order to modify or create series data
    // assiciated with both the model and the asset.
    class PerpetuityModel{
        constuctor(id, sd, ed){
            this.id = id;
            this.sd = sd;
            this.ed = ed;
        }

        // calcVals is the prototype output of a model:
        // the yearly present value of the asset(s).
        // This is the value called on by the non-complex charting methods.
        // input: 
        //   asset: the asset being examined by the model
        // output:
        //   assetModelData: an array that will be placed in an
        //                   AssetModelData class (usually).
        calcVals(asset){
            // Prepare the model parameters for the asset
            // A perpetuity is forever, but a model is not.
            // And neither is a perpetuity, anyway.
            let startYear = moment(asset.sd);
            let endYear = moment(asset.ed);
            let interval = endYear.diff(startYear, 'years', true);

            // Testing moment.js fractional year difference.
            console.log(interval);

            // Prepare the output object
            let assetModelData = [];

            for(let i = 0; i <= interval; i++){
                // Create a new date i years from the model start
                let theDate = moment(asset.sd, "MM/DD/YYYY").add('years', i);
                
                // Set the value for this asset using the present value perpetuity function
                let val = this.pvp(asset.dr, asset.pa);
                assetModelData.push(new dataElement(theDate.format('MM/DD/YYYY'), parseFloat(val.toFixed(2))));
            }

            return assetModelData;
        }

        // Calculate the present value of a perpetuity
        // dr: discount rate
        // pa: payment amount
        pvp(dr, pa){ 
            let val = pa  / dr;
            return val;
        }
    }

    // A model is applied to assets in order to modify the series data 
    // associated with the asset.
    class AnnuityModel{
        constructor(id, sd, ed){
            this.id = id;
            this.sd = sd;
            this.ed = ed;
        }

        // calcVals should be thought of as the prototype output of a model:
        // the yearly value (or other time-based) of the asset(s).
        // This is the value called on by the non-complex charting methods.
        // input:
        //   asset: the asset being examined by this model
        calcVals(asset){ 
            // Create a set of dataElements with a count equal to the number of years in the model.
            let startYear = asset.sd.getFullYear();
            let endYear = asset.ed.getFullYear();
            let interval = endYear - startYear;
            // Prepare the output object
            let assetModelData = [];

            for(let i = 0; i <= interval; i++){
                // Create a new date i years from the model start
                var theDate = new Date(asset.sd.getTime());
                theDate.setYear(theDate.getFullYear() + i);
                // Set the value for this asset
                let val = this.pva(asset.dr, asset.pa, interval - i);
                assetModelData.push(new dataElement(theDate, parseFloat(val.toFixed(2))));
            }

            return assetModelData;
        }

        // Calculate the present value of an annuity
        // dr: discount rate
        // pa: payment amount
        // periodNumber: the period we are calculating the present value for
        pva(dr, pa, periodNumber){ 
            let r1rn = (dr * Math.pow(1 + dr, periodNumber));
            let val = pa * ( 1 / dr - 1 / r1rn) 
            return val;
        }
    }

    // AssetModelingSystem
    // An AssetModelingSystem holds a series of models and assets
    // and is used to perform actions that reference both the assets and the models.
    class AssetModelingSystem{
        constructor(id = 0, assets = [], models = [], assetModelDataGroup = []){
            this.id = id;
            this.assets = assets;
            this.models = models;
            this.assetModelDataGroup = assetModelDataGroup;
        }

        // insertAssetModelData
        // checks to make sure an AssetModelData object has a 
        // unique pair of model id and asset id.
        // inserts AssetModelData with unique ids into the 
        // assetModelDataGroup array.
        // input:
        //   assetModelData: computed asset/model data
        // output:
        //   returns:
        //     0: insert successful
        //     1: insert failed
        insertAssetModelData(assetModelData){
            // Look for an AssetModelData object with the same ids
            let idsTaken = this.assetModelDataGroup.find(obj => { return obj.assetid === assetModelData.assetid && obj.modelid === tassetModelData.modelid}) || [];
            // If there is no other AssetModelData with matching asset and model ids
            // insert the asset into assetModelDataGroup
            if(idsTaken.length == 0){
                this.assetModelDataGroup.push(assetModelData);

                return 0;
            }

            // If there is another assetModelData object with this id, return 1;
            return 1;
        }

        // runAssetModelData
        // runs a model on a given asset.
        // the asset and the model must both exist in the AssetModelingSystem
        // and they must be paired into an AssetModelData object and
        // exist in the assetModelDataGroup array.
        // input:
        //   asset id: the id of the asset to run the model on
        //   model id: the id of the model the asset will be calculated against
        // output:
        //   returns:
        //     0: update successful
        //     1: update failed
        runAssetModelData(assetId, modelId){
            // Look for an AssetModelData object with the same ids
            let thisAmd = this.assetModelDataGroup.find(obj => { return obj.assetid === assetId && obj.modelid === modelId}) || [];
            let thisAsset = this.assets.find(obj => { return obj.id === assetId; }) || [];
            let thisModel = this.models.find(obj => { return obj.id === modelId; }) || [];
            
            // If there is no other AssetModelData with matching asset and model ids
            // or no models or assets with matching ids, return 1 (error).
            if(thisAmd.length == 0 || thisAsset.length == 0 || thisModel.length == 0){
                return 1;
            }

            thisAmd.series = thisModel.calcVals(thisAsset); 
            return 0;
        }

        // insertAsset
        // checks to make sure an asset has a unique id
        // inserts assets with unique ids into the assets array
        // input:
        //   asset: an asset of type AssetData
        // output:
        //   returns:
        //     0: insert successful
        //     1: insert failed
        insertAsset(asset){
            // Look for an asset with the same id
            let idTaken = this.assets.find(obj => { return obj.id === asset.id }) || [];
            // If there is no other asset with this id
            // insert the asset into assets
            if(idTaken.length == 0){
                this.assets.push(asset);

                return 0;
            }

            // If there is another asset with this id, return 1;
            return 1;
        }

        // getAssetById
        // finds an asset in the assets array using the asset id
        // input:
        //   integer: an id of an asset of type AssetData
        // output:
        //   returns:
        //     null: no asset with this id
        //     object of type AssetData mathing given id
        getAssetById(assetid){
            // Look for an asset with the same id
            let asset = this.assets.find(obj => { return obj.id === assetid }) || [];
            // If there is no other asset with this id
            // return null
            if(asset.length == 0){
                return null;
            }

            // If there is an asset with this id, return this asset;
            return asset;
        }

        // insertModel
        // checks to make sure a model has a unique id
        // inserts models with unique ids into the models array
        // input:
        //   model: a model of type PerpetuityyModel (this should be less restrictive)
        // output:
        //   returns:
        //     0: insert successful
        //     1: insert failed
        insertModel(model){
            // Look for a model with the same id
            let idTaken = this.models.find(obj => { return obj.id === model.id } ) || [];
            // If there is no other model with this id
            // insert the model into models
            if(idTaken.length == 0){
                this.models.push(model);

                return 0;
            }

            // If there is another model with this id, return 1;
            return 1;
        }

        // getUniqueAssetId
        // looks through the assets array for a new id.
        // input: none
        // output: 
        //  integer for unique id of asset
        getUniqueAssetId(){
            // If there are no objects in the array, 
            // return 0;
            if(this.assets.length == 0){
                return 0;
            }
            // If there are assets in the array, return the maximum id + 1
            let maxid = Math.max.apply(Math, this.assets.map(function(d){ return d.id; }));
            return maxid + 1;
        }

        // getUniqueModelId
        // looks through the models array for a new id.
        // input: none
        // output: 
        //  integer for unique id of model
        getUniqueModelId(){
            // If there are no objects in the array, 
            // return 0;
            
            if(this.models.length == 0){
                return 0;
            }
            // If there are models in the array, return the maximum id + 1
            let maxid = Math.max.apply(Math, models.map(function(d){ return d.id; }));
            return maxid + 1;
        }
    }

    // ******************************************************
    // Initialization
    // ******************************************************

    // Create a new AssetModelingSystem
    ams = new AssetModelingSystem(0);

    // Create a sample model
    thisModel = new PeriodicCompoundingModel( ams.getUniqueModelId(), "01/04/2010", "01/05/2020", 0);
    ams.insertModel(thisModel);

    // Create some sample assets
    asset01 = new AssetData(ams.getUniqueAssetId(),  "06/01/2011", "08/01/2019", 100, 0, 0.15 );
    ams.insertAsset(asset01);
    asset02 = new AssetData(ams.getUniqueAssetId(),  "07/01/2009", "09/01/2025", 200, 0, 0.2 );
    ams.insertAsset(asset02);

    // Create new groups of asset-model data
    amd1 = new AssetModelData(asset01.id, thisModel.id);
    ams.insertAssetModelData(amd1);
    amd2 = new AssetModelData(asset02.id, thisModel.id);
    ams.insertAssetModelData(amd2);

    workspace = new UserWorkspace(0, 0);
    // Add the assets the the asset group
    // Set the current asset for the model
    currentAsset = ams.getAssetById(workspace.currentAssetId);

    // Run the model using the default parameters
    // on the assets in the ams.assets
    ams.assets.forEach(function(asset){
        ams.models.forEach(function(model){
            ams.runAssetModelData(asset.id, model.id);
        })
    })

    // *****************************************************
    // Tabulator
    // *****************************************************

    var table = new Tabulator("#example-table", {
        height:205, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
        //reactiveData:true, // enable reactive data
        data:ams.assets, //assign data to table
        layout:"fitColumns", //fit columns to width of table (optional)
        columns:[ //Define Table Columns
            {title:"Start Date (m/d/yyyy)", field:"sd", sorter:"date", editor:"input", formatter:"datetime", formatterParams:{inputFormat:"DD/MM/YYYY",outputFormat:"DD/MM/YYYY", invalidPlaceholder:"(invalid date)",}},
            {title:"End Date (m/d/yyyy)", field:"ed", sorter:"date", editor: "input", formatter:"datetime", formatterParams:{inputFormat:"DD/MM/YYYY",outputFormat:"DD/MM/YYYY", invalidPlaceholder:"(invalid date)",}},
            {title:"Initial Value", field:"pp", editor:"number", editorParams:{min:0, elementAttributes:{maxLength:"16",}, verticalNavigation:"table",}},
            {title:"Discount Rate", field:"dr", editor:"number", editorParams:{min:0, elementAttributes:{maxLength:"16",}, verticalNavigation:"table",}},
        ],
        // If the user edits the data, update the charts
        dataChanged:function(data){
            data.forEach(function(el){
                ams.assets[el.id].pp = el.pp;
                ams.assets[el.id].dr = el.dr;
                ams.assets[el.id].sd = el.sd;
                ams.assets[el.id].ed = el.ed;
            })
            
            ams.runAssetModelData(currentAsset.id, thisModel.id);
            drawModel(ams.assetModelDataGroup);
        },
        // If the user clicks on a row, set that row as the current asset (currentAsset).
        rowClick:function(e, row){ 
            //resetChanges();
            currentAsset = ams.assets[row.getData().id];
            // Selecting an asset should change the color of the selected asset:
            // Both the row and the line on the chart.
            ams.runAssetModelData(currentAsset.id, thisModel.id);
            resetRangeSliders();
            
            drawModel(ams.assetModelDataGroup);
        },
    });


    
    // *****************************************************
    // Chart slider buttons
    // *****************************************************

    $('#resetChanges').on('click', function(event){
        event.preventDefault();
        resetChanges();
    })

    // Don't let the buttons stay depressed
    $('.btn').mouseup(function(){$(this).blur()})

    function resetChanges(){
        resetRangeSliders();
        currentAsset.reapplyBase();
        currentAsset = ams.getAssetById(currentAsset.id);
        ams.runAssetModelData(currentAsset.id, thisModel.id);
        drawModel(ams.assetModelDataGroup);
    }

    $('#confirmChanges').on('click', function(event){
        event.preventDefault();
        currentAsset.resetBase();
        ams.runAssetModelData(currentAsset.id, thisModel.id);
        drawModel(ams.assetModelDataGroup);
        table.replaceData(ams.assets);
        resetRangeSliders();
    })

    $("#addAsset").on('click', function(event){
        resetChanges();
        event.preventDefault();
        // Create the new asset
        assetx = new AssetData(ams.assets.length,  "01/01/2010", "01/01/2015", 1000, 0, 0.3 );
        ams.assets.push(assetx);
        // Assign the new asset as the current asset
        currentAsset = assetx;
        table.addRow({id: assetx.id, sd:assetx.sd, ed:assetx.ed, pp:assetx.pp, dr:assetx.dr}, true);
        
        // Create assetModelData for this new asset
        amd2 = new AssetModelData(assetx.id, thisModel.id);
        // Insert the assetModelData into the asset modeling system
        ams.insertAssetModelData(amd2);
        // Run the model on the asset
        ams.runAssetModelData(assetx.id, thisModel.id);
        resetRangeSliders();
        
        drawModel(ams.assetModelDataGroup);
    })
    
    // Create the graphic representation of the model
    drawModel(ams.assetModelDataGroup);

    // *********************************************
    // Form input
    // *********************************************

    // If the user changes the slider, change the start date
    $('#formRangeModelStart').on('input', function(event){
        // Get and interpret the value of the slider.
        sliderVal = parseFloat((event.currentTarget.value)).toFixed(2) - 50;

        // Get a relative year based upon the crrent base (sd_base)
        let theDate = moment(currentAsset.sd_base, "MM/DD/YYYY").add('years', sliderVal).format('MM/DD/YYYY');

        // Update the currentAsset sd value
        currentAsset.sd = theDate;

        // Rerun the model
        ams.runAssetModelData(currentAsset.id, thisModel.id);

        // Change the table data too
        table.replaceData(ams.assets);
        drawModel(ams.assetModelDataGroup);
    })

    // If the user changes the end date slider, change the end date
    $('#formRangeModelEnd').on('input', function(event){
        // Get and interpret the value of the slider.
        sliderVal = parseFloat((event.currentTarget.value)).toFixed(2) - 50;

        // Get a relative year based upon the crrent base (sd_base)
        let theDate = moment(currentAsset.ed_base, "MM/DD/YYYY").add('years', sliderVal).format('MM/DD/YYYY');

        // Update the currentAsset sd value
        currentAsset.ed = theDate;

        // Rerun the model
        ams.runAssetModelData(currentAsset.id, thisModel.id);

        // Change the table data too
        table.replaceData(ams.assets);
        drawModel(ams.assetModelDataGroup);
    })

    // If the user changes the discount rate slider, change the discount rate
    $('#formRangeDiscountRate').on('input', function(event){
        thisVal = parseFloat(currentAsset.dr_base);
        sliderVal = parseFloat((event.currentTarget.value)).toFixed(2) - 50;
        currentAsset.dr = thisVal + sliderVal/500;
        ams.runAssetModelData(currentAsset.id, thisModel.id);
        // Change the table data too
        table.replaceData(ams.assets);
        drawModel(ams.assetModelDataGroup);
    })

    // If the user changes the periods per year slider, change the number o periods in the model
    $('#formRangeModelPeriods').on('input', function(event){
        thisVal = parseFloat(thisModel.pd_base);
        sliderVal = parseFloat(Math.floor(event.currentTarget.value/5)).toFixed(2);
        thisModel.pd = thisVal + sliderVal;
        // Since we are changing the model, rerun all of the assets through the model
        ams.assets.forEach(function(asset){
            ams.runAssetModelData(asset.id, thisModel.id);
            console.log(ams.assetModelDataGroup[0].series);
        })
        // Change the table data too
        table.replaceData(ams.assets);
        drawModel(ams.assetModelDataGroup);
        console.log(thisModel.pd);
    })

    // *********************************************
    // Internal functions
    // *********************************************

    function drawModel(amsassetModelDataGroup){
        representData(viz002svg001, amsassetModelDataGroup, currentAsset.id);
    }

    // Reset range sliders
    function resetRangeSliders(){
        $('#formRangeModelStart').val('50');
        $('#formRangeModelEnd').val('50');
        $('#formRangeDiscountRate').val('50');
        $('#formRangeModelPeriods').val('0');
    }
})



function representData(location, data, selectedid = 0){
    location.attr('viewBox', '0 0 500 300');
    let body = d3.select('#body')
    
    let bodyHeight = 200;
    let bodyWidth = 400;
    //let maxValue = d3.max(data, d => d.val);
    let yAxisWidth = 45;
    let xAxisHeight = 30;

    // clear out the groups
    document.getElementById('body').innerHTML ='';
    document.getElementById('legend').innerHTML = '';

    // ********************************************
    // Chart creation
    // ********************************************

    // Color gradient
    let cScale = d3.scaleOrdinal()
        .domain([d => d.assetid])
        .range(d3.schemeSet1)

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

    // Find the max and min of all of the x values in order to set the x scale
    let xScale = d3.scaleTime()
        .domain([d3.min(data, d => d3.min(d.series, d => Date.parse(d.date))), d3.max(data, d => d3.max(d.series, d => Date.parse(d.date)))]).nice()
        .range([0, bodyWidth]);

    // Create the legend svg object
    let legendSVG = d3.select('#legend')
        .append('svg')
    legendSVG
        .selectAll('colorBars')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', 10)
        .attr('cy', function(d, i) { return 100 + i * 25})
        .attr('r', 7)
        .style('fill', d => d.assetid > -1 ? cScale(d.assetid) : 'white')
    legendSVG
        .selectAll('legendLabels')
        .data(data)
        .enter()
        .append('text')
        .attr('x', 30)
        .attr('y', function(d, i){ return 100 + i * 25})
        .text( d => d.assetid )
        .attr('color', 'black')
        .attr('text-anchor', 'left')
        .style('alignment-baseline', 'middle')

    // Create the line
    var valueline = d3.line()
    .x(d => xScale(Date.parse(d.date)))
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
        .attr('nodeid', d => d.assetid)
        .style('stroke', d => d.assetid > -1 ? cScale(d.assetid) : 'white')

    // If a specific asset is selected, color it blue
    lines.selectAll('.line-group')
        .selectAll('[nodeid="'+selectedid+'"]')
        .attr('selected', 'true')
        .style('stroke', 'blue')
        .style('stroke-width', '2px');


    // Create the axes background
    // y axes background
    axesBG = body.append('g');
    axesBG
        .append('rect')
        .attr('width', yAxisWidth)
        .attr('height', bodyHeight + yAxisWidth)
        .style('fill', axesColor)
        .attr('transform', `translate(-${yAxisWidth}, -${yAxisWidth * 0.5})`)
    // y axes background
    axesBG
        .append('rect')
        .attr('width', bodyWidth + yAxisWidth * 1.5)
        .attr('height', yAxisWidth)
        .style('fill', axesColor)
        .attr('transform', `translate(-${yAxisWidth}, ${bodyHeight})`)
    // Apply merge filter to axes backgrounds
    axesBG
        .style('filter', 'url(#axesFilter)')

    // Create the y axis and label
    yAxis = body.append('g')
        .call(d3.axisLeft(yScale))
    yAxis.selectAll('path')
        .attr('stroke', 'rgba(50, 50, 50, 0.7)')
        .attr('stroke-width', '1px')
    yAxis.append('text')
        .attr('class', 'axis-label')
        .text('Present Value ($)')
        .attr('font-weight', '800')
        .attr('fill', 'rgba(50, 50, 50, 0.9)')
        .attr('x', -bodyHeight/2)
        .attr('y', -33)
        .attr('transform', 'rotate(-90)')

    // X axis and label
    body.append('g')
        .attr('transform', 'translate(0, ' + bodyHeight + ')')
        .call(d3.axisBottom(xScale)
            .tickFormat(d3.timeFormat('%Y')))
        .append('text')
        .attr('class', 'axis-label')
        .attr('font-weight', '800')
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

    // Axes filter
    var axesFilter = defs.append('filter')
        .attr('id', 'axesFilter')
        .attr('filterUnits', 'userSpaceOnUse')
    axesFilter.append('feDropShadow')
        .attr('dx', '10')
        .attr('dy', '10')
        .attr('stdDeviation', '5')
        .attr('flood-color', 'rgba(150, 150, 150, 0.8')
        .attr('flood-opacity', '0.35')
        .attr('result', 'out3')
    axesFilter.append('feMorphology')
        .attr('in', 'SourceAlpha')
        .attr('operator', 'dilate')
        // This border is 2 pixels wide
        .attr('radius', '1')
        .attr('result', 'e1')
    axesFilter.append('feMorphology')
        .attr('in', 'SourceAlpha')
        .attr('operator', 'dilate')
        // This border starts at the edges of the group
        .attr('radius', '0')
        .attr('result', 'e2')
    axesFilter.append('feComposite')
        .attr('in', 'e1')
        .attr('in2', 'e2')
        .attr('operator', 'xor')
        .attr('result', 'outline')
    axesFilter.append('feColorMatrix')
        .attr('type', 'matrix')
        .attr('in', 'outline')
        .attr('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.3 0')
        .attr('result', 'outline2')
    axesFilter.append('feComposite')
        .attr('in', 'outline2')
        .attr('in2', 'SourceGraphic')
        .attr('operator', 'over')
        .attr('result', 'output')
    axesFilter.append('feComposite')
        .attr('in', 'outline2')
        .attr('in2', 'out3')
        .attr('operator', 'over')
        .attr('result', 'output2')
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
