

let d3viz001 = d3.select("#d3viz001");
let data = null;

d3.csv('./data/RAW_us_confirmed_cases.csv').then(function (file) {
    // Add state names to drop down
    populateDropDown("dropdown_states", file);
    data = file;
    // trim data to Oregon
    trimdata = trimData(file, 'Province_State', 'Oregon');
    sortData(trimdata, 'Admin2');
    makeTable(trimdata);
    dropdownitemPrep();
})

/* Populating the drop-down */
function populateDropDown(idString, data){
    /*Get a list of unique states. */
    let options = [...new Set(data.map(d => d.Province_State))].sort();
    
    /*for every unique entry of 'Province_State', add an entry to the drop down. */
    options.forEach(function makeDropEntry(item, index){
        document.getElementById(idString).insertAdjacentHTML('beforeend', '<a class="dropdown-item" href="#">'+item+'</a>');
    } )
}

/*When the dropdown for the states is selected, update the main table and the dropdown text*/
function dropdownitemPrep(){
    $('.dropdown-item').on('click', function(event){
        /* Don't let the default screen refresh happen */
        event.preventDefault();
        var btnObj = $(this).parent().siblings('button');
        $(btnObj).text($(this).text());
        $(btnObj).val($(this).text());

        trimdata = trimData(data, 'Province_State', $(this).text());
        sortData(trimdata, 'Admin2');
        makeTable(trimdata);
    })

}

/*Trimming the data by state*/
function trimData(data, key, value){
    data = data.filter(function(record){
        return record[key] === value;
    })
    return data;
}

/*Sorting the data using d3*/
function sortData(data, key){
    data.sort(function(v1, v2){
        return d3.ascending(v1[key], v2[key])
    })
}

function makeTable(data){
    function tabulate(data, columns) {
        /*Clear out the d3viz001 object*/
        document.getElementById('d3viz001').innerHTML = '';
        /*Create the table and add it to the viz object */
        var table = d3.select('#d3viz001').append('table');
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
        d3.select('#d3viz001 table').node().classList.add('table');
        /* Alternate colors of rows. */
        d3.select('#d3viz001 table').node().classList.add('table-striped');
        /* Color rows when hovered */
        d3.select('#d3viz001 table').node().classList.add('table-hover');
        /* Ensure column headers are given column scope */
        d3.selectAll('#d3viz001 thead tr th').attr('scope', 'col');

        return table;
    }

    // render the tables
    tabulate(data, ['UID', 'Province_State', 'Admin2']);
}
