// Parser for SWMM INP files
d3.inp = function() {
    function inp() {
    }

    inp.bindVals = function(){
        // Get the modal
        var modal = document.getElementById("myModal");

        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];

        
        // Alter display property of a group of elements.
        function hideOrShow(classDesc, displayType){
            items = document.getElementsByClassName(classDesc);
            Array.from(items).forEach(item => {
                item.style.display = displayType;
                item.value = '';
            })
        }

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
            modal.style.display = "none";
            // Make the edit texts disappear
            hideOrShow('modaledit', 'none');
            // Make the labels disappear.
            hideOrShow('modallabel', 'none');
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
                // Make the edit texts disappear
                hideOrShow('modaledit', 'none');
                // Make the labels disappear.
                hideOrShow('modallabel', 'none');
            }
        }

        //Add input and label elements to modal using an ID structure.
        // For modals that do not use an ID strcture, try populateModal().
        // Input to this function is an array of objects of the format:
        //
        // [{inputName: 'Invert',           The name of the variable when accessed through the parent object.
        //   labelText: 'Invert',           The text that will show in the label for the input.
        //   inputType: 'text',             The type of data that is expected for the input object.
        //   parentObject: 'JUNCTIONS'}]    The name of the parent object.
        // To use this structure, call swmmjs.model.[parentObject][itemID][inputName]
        function populateModalID(inputArray, itemID){
            // iterator
            let index = 0;
            // parent element is the modal dialog
            let parent = document.getElementById('generalModal');
            // current row element
            let thisRow = null;
            // current column element.
            let thisCol = null;
            // generic element
            let thisEl = null;

            if(!parent){
                console.log('Could not populate general modal');
                return null;
            }

            // Remove save button event listeners via cloning
            $('#save-general-modal').off();
            let oEl = document.getElementById('save-general-modal');
            let nEl = oEl.cloneNode(true);
            oEl.parentNode.replaceChild(nEl, oEl);
            // Clean up the modal
            while(parent.firstChild){
                parent.removeChild(parent.firstChild);
            }

            // Add an input element
            thisEl = parent.appendChild(document.createElement('p'));
            thisEl.classList.add('modalinfo')
            thisEl.id = 'testid';
            thisEl.innerText = itemID; 

            // For every entry in the inputArray
            inputArray.forEach(item => {
                // Create the modalLabelId and modalEditId strings
                let modalLabelId = 'modallabel' + (index + 1).toString().padStart(2, '0');
                let modalEditId =  'modaledit' + (index + 1).toString().padStart(2, '0');

                // If this is the first entry in this row, create the form-row object
                if(index % 2 == 0){
                    thisRow = parent.appendChild(document.createElement('div'));
                    thisRow.classList.add('form-row');
                }

                // Add a column div
                thisCol = thisRow.appendChild(document.createElement('div'));
                thisCol.classList.add('col-md-6');
                thisCol.classList.add('mb-6');

                // Add a label element
                thisEl = thisCol.appendChild(document.createElement('label'));
                thisEl.classList.add('modallabel');
                thisEl.id = modalLabelId;
                thisEl.setAttribute('for', modalEditId);
                thisEl.innerText = item.labelText;

                // Add an input element
                thisEl = thisCol.appendChild(document.createElement('input'));
                thisEl.classList.add('form-control')
                thisEl.classList.add('modaledit')
                thisEl.id = modalEditId;
                thisEl.setAttribute('name', modalEditId);
                thisEl.setAttribute('type', item.inputType);

                if(item.parentObject==='TAGS'){
                    // With tags, links and nodes can both have the same id, so the menu needs to 
                    // know if the tag is for a node or a junction.
                    if(item.inputName==='Node'){
                        // Check for object.type='Node' and object.ID = itemID;
                        function tagQuery(thisObj){
                            return thisObj.Type==='Node' && thisObj.ID === itemID; 
                        }
                        // For every tag element
                        let thisArray = Object.values(swmmjs.model[item.parentObject]);

                        let thisEl = thisArray.findIndex(tagQuery);
                        if(thisEl >= 0){
                            document.getElementById(modalEditId).value = swmmjs.model[item.parentObject][thisEl].Tag;
                        } else {
                            document.getElementById(modalEditId).value = '';
                        }
                    }
                } else {
                    // If type === 'button', give the button some text
                    if(item.inputType==='button'){
                        thisEl.value = 'Edit';
                        thisEl.classList.add('btn-secondary');
                        thisEl.setAttribute('data-toggle', 'modal');
                        thisEl.setAttribute('data-target', '#myModal2');

                        // Add an event to handle clicks. These usually bring up a modal for editing.
                        $(thisEl).click(function(e){
                            // Create object definitions to populate the modal
                            let modalJSON = [];
                            populateSecondaryModalID(modalJSON, itemID);
                        })


                    } else{
                        // If type is 'text', just place the value into the text box.
                        thisEl.value = swmmjs.model[item.parentObject][itemID][item.inputName]
                    }
                }

                // Add a tooltip element
                thisEl = thisCol.appendChild(document.createElement('div'));
                thisEl.classList.add('valid-tooltip');
                thisEl.innerText = 'Valid entry';

                // Save the values if the 'Save' button is clicked.
                document.getElementById('save-general-modal').addEventListener('click', ()=>{
                    if(item.parentObject==='TAGS'){
                        if(document.getElementById(modalEditId).value.length > 0){
                            // With tags, links and nodes can both have the same id, so the menu needs to 
                            // know if the tag is for a node or a junction.
                            if(item.inputName==='Node'){
                                // Check for object.type='Node' and object.ID = itemID;
                                function tagQuery(thisObj){
                                    return thisObj.Type==='Node' && thisObj.ID === itemID; 
                                }
                                // For every tag element
                                let thisArray = Object.values(swmmjs.model[item.parentObject]);

                                let thisEl = thisArray.findIndex(tagQuery);
                                if(thisEl >= 0){
                                    swmmjs.model[item.parentObject][thisEl].Tag = document.getElementById(modalEditId).value;
                                } else {
                                    let arraySize = Object.keys(swmmjs.model[item.parentObject]).length
                                    swmmjs.model[item.parentObject][arraySize] = [];
                                    swmmjs.model[item.parentObject][arraySize].Type = 'Node';
                                    swmmjs.model[item.parentObject][arraySize].ID = itemID;
                                    swmmjs.model[item.parentObject][arraySize].Tag = document.getElementById(modalEditId).value;
                                }
                            }
                        }
                    } else {
                        if(swmmjs.model[item.parentObject][itemID][item.inputName]){
                            swmmjs.model[item.parentObject][itemID][item.inputName] = document.getElementById(modalEditId).value;
                        }
                        
                    }
                })

                // Increase the iterator.
                index++;
            })
        }

        //Add input and label elements to modal using an ID structure.
        // For modals that do not use an ID strcture, try populateModal().
        // Input to this function is an array of objects of the format:
        //
        // [{inputName: 'Invert',           The name of the variable when accessed through the parent object.
        //   labelText: 'Invert',           The text that will show in the label for the input.
        //   inputType: 'text',             The type of data that is expected for the input object.
        //   parentObject: 'JUNCTIONS'}]    The name of the parent object.
        // To use this structure, call swmmjs.model.[parentObject][itemID][inputName]
        function populateSecondaryModalID(inputArray, itemID){
            // iterator
            let index = 0;
            // parent element is the modal dialog
            let parent = document.getElementById('generalModal2');
            // current row element
            let thisRow = null;
            // current column element.
            let thisCol = null;
            // generic element
            let thisEl = null;

            if(!parent){
                console.log('Could not populate general modal');
                return null;
            }

            // Remove save button event listeners via cloning
            $('#save-general-modal2').off();
            let oEl = document.getElementById('save-general-modal2');
            let nEl = oEl.cloneNode(true);
            oEl.parentNode.replaceChild(nEl, oEl);
            // Clean up the modal
            while(parent.firstChild){
                parent.removeChild(parent.firstChild);
            }

            // Add an input element
            thisEl = parent.appendChild(document.createElement('p'));
            thisEl.classList.add('modalinfo')
            thisEl.id = 'testid2';
            thisEl.innerText = itemID; 

            // For every entry in the inputArray
            inputArray.forEach(item => {
                // Create the modalLabelId and modalEditId strings
                let modalLabelId = 'modal2label' + (index + 1).toString().padStart(2, '0');
                let modalEditId =  'modal2edit' + (index + 1).toString().padStart(2, '0');

                // If this is the first entry in this row, create the form-row object
                if(index % 2 == 0){
                    thisRow = parent.appendChild(document.createElement('div'));
                    thisRow.classList.add('form-row');
                }

                // Add a column div
                thisCol = thisRow.appendChild(document.createElement('div'));
                thisCol.classList.add('col-md-6');
                thisCol.classList.add('mb-6');

                // Add a label element
                thisEl = thisCol.appendChild(document.createElement('label'));
                thisEl.classList.add('modallabel');
                thisEl.id = modalLabelId;
                thisEl.setAttribute('for', modalEditId);
                thisEl.innerText = item.labelText;

                // Add an input element
                thisEl = thisCol.appendChild(document.createElement('input'));
                thisEl.classList.add('form-control')
                thisEl.classList.add('modaledit')
                thisEl.id = modalEditId;
                thisEl.setAttribute('name', modalEditId);
                thisEl.setAttribute('type', item.inputType);
                
                // If type is 'text', just place the value into the text box.
                thisEl.value = swmmjs.model[item.parentObject][itemID][item.inputName];

                // Add a tooltip element
                thisEl = thisCol.appendChild(document.createElement('div'));
                thisEl.classList.add('valid-tooltip');
                thisEl.innerText = 'Valid entry';

                // Save the values if the 'Save' button is clicked.
                document.getElementById('save-general-modal').addEventListener('click', ()=>{
                    if(swmmjs.model[item.parentObject][itemID][item.inputName]){
                        swmmjs.model[item.parentObject][itemID][item.inputName] = document.getElementById(modalEditId).value;
                    }
                })

                // Increase the iterator.
                index++;
            })
        }

        //Add input and label elements to modal using an ID structure.
        // Input to this function is an array of objects of the format:
        //
        // [{inputName: 'Invert',           The name of the variable when accessed through the parent object.
        //   labelText: 'Invert',           The text that will show in the label for the input.
        //   inputType: 'text',             The type of data that is expected for the input object.
        //   parentObject: 'JUNCTIONS'}]    The name of the parent object.
        // To use this structure, call swmmjs.model.[parentObject][inputName]
        function populateModal(inputArray){
            // iterator
            let index = 0;
            // parent element is the modal dialog
            let parent = document.getElementById('generalModal');
            // current row element
            let thisRow = null;
            // current column element.
            let thisCol = null;
            // generic element
            let thisEl = null;
            let oEl = document.getElementById('save-general-modal');
            let nEl = oEl.cloneNode(true);

            if(!parent){
                console.log('Could not populate general modal');
                return null;
            }

            // Remove save button event listeners via cloning
            $('#save-general-modal').off();
            oEl.parentNode.replaceChild(nEl, oEl);
            // Clean up the modal
            while(parent.firstChild){
                parent.removeChild(parent.firstChild);
            }

            // Add an input element
            thisEl = parent.appendChild(document.createElement('p'));
            thisEl.classList.add('modalinfo')

            // For every entry in the inputArray
            inputArray.forEach(item => {
                // Create the modalLabelId and modalEditId strings
                let modalLabelId = 'modallabel' + (index + 1).toString().padStart(2, '0');
                let modalEditId =  'modaledit' + (index + 1).toString().padStart(2, '0');

                // If this is the first entry in this row, create the form-row object
                if(index % 2 == 0){
                    thisRow = parent.appendChild(document.createElement('div'));
                    thisRow.classList.add('form-row');
                }

                // Add a column div
                thisCol = thisRow.appendChild(document.createElement('div'));
                thisCol.classList.add('col-md-6');
                thisCol.classList.add('mb-6');

                // Add a label element
                thisEl = thisCol.appendChild(document.createElement('label'));
                thisEl.classList.add('modallabel');
                thisEl.id = modalLabelId;
                thisEl.setAttribute('for', modalEditId);
                thisEl.innerText = item.labelText;

                // Add an input element
                thisEl = thisCol.appendChild(document.createElement('input'));
                thisEl.classList.add('form-control')
                thisEl.classList.add('modaledit')
                thisEl.id = modalEditId;
                thisEl.setAttribute('name', modalEditId);
                thisEl.setAttribute('type', item.inputType);
                thisEl.value = swmmjs.model[item.parentObject][item.inputName].Value

                // Add a tooltip element
                thisEl = thisCol.appendChild(document.createElement('div'));
                thisEl.classList.add('valid-tooltip');
                thisEl.innerText = 'Valid entry';

                // Save the values if the 'Save' button is clicked.
                document.getElementById('save-general-modal').addEventListener('click', ()=>{
                    swmmjs.model[item.parentObject][item.inputName].Value = document.getElementById(modalEditId).value;
                })

                // Increase the iterator.
                index++;
            })
        }

        //Bind project elements for click response.
        $('#pmTitle').click(function(e){
            // Show the modal.
            $('myModal').modal('toggle');
        })

        $('#pmOptions').click(function(e){
            // Place 'Options' in the subselectcaption text.
            $('#subselectcaption').text('Options');

            // Create the structure of the subselect list.
            let listJSON = [];
            listJSON.push({labelText: 'General',    elementId: 'subselectlist-general'});
            listJSON.push({labelText: 'Dates',    elementId: 'subselectlist-dates'});
            listJSON.push({labelText: 'Time Steps',    elementId: 'subselectlist-timesteps'});
            listJSON.push({labelText: 'Dynamic Wave',    elementId: 'subselectlist-dynamicwave'});
            listJSON.push({labelText: 'Interface Files',    elementId: 'subselectlist-interfacefiles'});
            listJSON.push({labelText: 'Reporting',    elementId: 'subselectlist-reporting'});

            populateSelectList(listJSON);
        })

        $('#pmClimatology').click(function(e){
            // Place 'Options' in the subselectcaption text.
            $('#subselectcaption').text('Climatology');

            // Create the structure of the subselect list.
            let listJSON = [];
            listJSON.push({labelText: 'Temperature',    elementId: 'subselectlist-temperature'});
            listJSON.push({labelText: 'Evaporation',    elementId: 'subselectlist-evaporation'});
            listJSON.push({labelText: 'Wind Speed',    elementId: 'subselectlist-windspeed'});
            listJSON.push({labelText: 'Snow Melt',    elementId: 'subselectlist-snowmelt'});
            listJSON.push({labelText: 'Areal Depletion',    elementId: 'subselectlist-arealdepletion'});

            populateSelectList(listJSON);
        })

        $('#pmJunctions').click(function(e){
            // Place 'Options' in the subselectcaption text.
            $('#subselectcaption').text('Junctions');
            let listJSON = [];

            // Create the structure of the subselect list.
            if(!!swmmjs.model.JUNCTIONS){
                Object.entries(swmmjs.model.JUNCTIONS).forEach(item => {
                    listJSON.push({labelText: item[0],    elementId: 'subselectlist-junction' + item.key, function: modalEditJunction});
                })
            }

            

            populateSelectList(listJSON);
        })

        $('#pmOutfalls').click(function(e){
            // Place 'Options' in the subselectcaption text.
            $('#subselectcaption').text('Outfalls');
            let listJSON = [];

            // Create the structure of the subselect list.
            if(!!swmmjs.model.OUTFALLS){
                Object.entries(swmmjs.model.OUTFALLS).forEach(item => {
                    listJSON.push({labelText: item[0],    elementId: 'subselectlist-outfall' + item.key});
                })
            }
            populateSelectList(listJSON);
        })

        $('#pmDividers').click(function(e){
            // Place 'Options' in the subselectcaption text.
            $('#subselectcaption').text('Dividers');
            let listJSON = [];

            // Create the structure of the subselect list.
            if(!!swmmjs.model.DIVIDERS){
                Object.entries(swmmjs.model.DIVIDERS).forEach(item => {
                    listJSON.push({labelText: item[0],    elementId: 'subselectlist-divider' + item.key});
                })
            }
            populateSelectList(listJSON);
        })

        $('#pmStorageUnits').click(function(e){
            // Place 'Options' in the subselectcaption text.
            $('#subselectcaption').text('Storage Units');
            let listJSON = [];

            // Create the structure of the subselect list.
            if(!!swmmjs.model.STORAGE){
                Object.entries(swmmjs.model.STORAGE).forEach(item => {
                    listJSON.push({labelText: item[0],    elementId: 'subselectlist-storageunits' + item.key});
                })
            }

            populateSelectList(listJSON);
        })

        $('#pmConduits').click(function(e){
            // Place 'Options' in the subselectcaption text.
            $('#subselectcaption').text('Conduits');
            let listJSON = [];

            // Create the structure of the subselect list.
            if(!!swmmjs.model.CONDUITS){
                Object.entries(swmmjs.model.CONDUITS).forEach(item => {
                    listJSON.push({labelText: item[0],    elementId: 'subselectlist-conduits' + item.key});
                })
            }

            populateSelectList(listJSON);
        })

        $('#pmPumps').click(function(e){
            // Place 'Options' in the subselectcaption text.
            $('#subselectcaption').text('Pumps');
            let listJSON = [];

            // Create the structure of the subselect list.
            
            if(!!swmmjs.model.PUMPS){
                Object.entries(swmmjs.model.PUMPS).forEach(item => {
                    listJSON.push({labelText: item[0],    elementId: 'subselectlist-pumps' + item.key});
                })
            }

            populateSelectList(listJSON);
        })

        $('#pmOrifices').click(function(e){
            // Place 'Options' in the subselectcaption text.
            $('#subselectcaption').text('Orifices');
            let listJSON = [];

            // Create the structure of the subselect list.
            if(!!swmmjs.model.ORIFICES){
                Object.entries(swmmjs.model.ORIFICES).forEach(item => {
                    listJSON.push({labelText: item[0],    elementId: 'subselectlist-orifices' + item.key});
                })
            }

            populateSelectList(listJSON);
        })

        $('#pmWeirs').click(function(e){
            // Place 'Options' in the subselectcaption text.
            $('#subselectcaption').text('Weirs');
            let listJSON = [];

            // Create the structure of the subselect list.
            if(!!swmmjs.model.WEIRS){
                Object.entries(swmmjs.model.WEIRS).forEach(item => {
                    listJSON.push({labelText: item[0],    elementId: 'subselectlist-weirs' + item.key});
                })
            }

            populateSelectList(listJSON);
        })

        $('#pmOutlets').click(function(e){
            // Place 'Options' in the subselectcaption text.
            $('#subselectcaption').text('Outlets');
            let listJSON = [];

            // Create the structure of the subselect list.
            if(!!swmmjs.model.OUTLETS){
                Object.entries(swmmjs.model.OUTLETS).forEach(item => {
                    listJSON.push({labelText: item[0],    elementId: 'subselectlist-outlets' + item.key});
                })
            }

            populateSelectList(listJSON);
        })

        //Add input and label elements to modal using an ID structure.
        // Input to this function is an array of objects of the format:
        //
        // [{labelText: 'General',                      The printed name of the element.
        //   elementId: 'subselectlist-general',        The id of the element.
        //   [optional]function: modalEditJunction}]    The function fired on click.
        // To use this structure, call swmmjs.model.[parentObject][inputName]
        function populateSelectList(inputArray){
            // Identify where objects will be placed.
            let parent = document.getElementById('subselectlist');
            // Generic Element
            let el;

            // Clean up the list
            while(parent.firstChild){
                parent.removeChild(parent.firstChild);
            }

            // For every entry in the inputArray
            inputArray.forEach(item => {

                // Add list element
                el = parent.appendChild(document.createElement('li'));
                el.classList.add('nav-item');
    
                // Add a
                el = el.appendChild(document.createElement('a'));
                el.classList.add('nav-link');
                el.setAttribute('aria-current', 'page');
                el.setAttribute('href', '#');
    
                // Add div
                el = el.appendChild(document.createElement('div'));
                el.setAttribute('data-toggle', 'modal');
                el.setAttribute('data-target', '#myModal');
                el.setAttribute('id', item.elementId);
                el.innerText = item.labelText;
                // If a function was passed in itemArray, use it on click
                if(typeof item.function !== 'undefined'){
                    $(el).click(function(e){
                        item.function(item.labelText);
                    })
                }
            })
        }

        function menuOptionsGeneral(){

            // Show the modal.
            $('myModal').modal('toggle');
            let modalJSON = [];
            modalJSON.push({inputName: 'INFILTRATION',      labelText: 'Infiltration',              inputType: 'text',  parentObject: 'OPTIONS'});
            modalJSON.push({inputName: 'ALLOW_PONDING',     labelText: 'Allow Ponding',             inputType: 'text',  parentObject: 'OPTIONS'});
            modalJSON.push({inputName: 'CONTROLS',          labelText: 'Report Control Actions',    inputType: 'text',  parentObject: 'REPORT'});
            modalJSON.push({inputName: 'INPUT',             labelText: 'Report Input Summary',      inputType: 'text',  parentObject: 'REPORT'});
            modalJSON.push({inputName: 'MIN_SLOPE',         labelText: 'Minimum Conduit Slope %',   inputType: 'text',  parentObject: 'OPTIONS'});
            modalJSON.push({inputName: 'FLOW_ROUTING',      labelText: 'Routing Model',             inputType: 'text',  parentObject: 'OPTIONS'});
            populateModal(modalJSON);
        }

        var modalEditJunction = function(id){
            // Create object definitions to populate the modal
            let modalJSON = [];
            modalJSON.push({inputName: 'Description',   labelText: 'Description',    inputType: 'text', parentObject: 'JUNCTIONS'});
            modalJSON.push({inputName: 'Node',       labelText: 'Tag',        inputType: 'text',   parentObject: 'TAGS'});
            modalJSON.push({inputName: 'Inflows',   labelText: 'Inflows',    inputType: 'button', parentObject: 'JUNCTIONS'});
            modalJSON.push({inputName: 'Treatment', labelText: 'Treatment',  inputType: 'button', parentObject: 'JUNCTIONS'});

            modalJSON.push({inputName: 'Invert',    labelText: 'Invert El.',     inputType: 'text', parentObject: 'JUNCTIONS'});
            modalJSON.push({inputName: 'Dmax',      labelText: 'Max. Depth',     inputType: 'text', parentObject: 'JUNCTIONS'});
            modalJSON.push({inputName: 'Dinit',     labelText: 'Initial Depth',  inputType: 'text', parentObject: 'JUNCTIONS'});
            modalJSON.push({inputName: 'Dsurch',    labelText: 'Surcharge Depth',inputType: 'text', parentObject: 'JUNCTIONS'});
            modalJSON.push({inputName: 'Aponded',   labelText: 'Ponded Area',    inputType: 'text', parentObject: 'JUNCTIONS'});
            populateModalID(modalJSON, id);
        }

        $('.node_, .polygon_, .link_').click(function(e){
            // Show the modal.
            $('#myModal').modal('toggle');

            // Check if the classList contains gjunction
            if(this.classList.contains('gjunction')){
                modalEditJunction(this.id);
            }

            // Check if the classList contains goutfall
            if(this.classList.contains('goutfall')){
                // Create object definitions to populate the modal
                let modalJSON = [];
                modalJSON.push({inputName: 'Invert',    labelText: 'Invert',    inputType: 'text', parentObject: 'OUTFALLS'});
                modalJSON.push({inputName: 'Type',      labelText: 'Type',      inputType: 'text', parentObject: 'OUTFALLS'});
                modalJSON.push({inputName: 'Stage Data',labelText: 'StageData', inputType: 'text', parentObject: 'OUTFALLS'});
                modalJSON.push({inputName: 'Gated',     labelText: 'Gated',     inputType: 'text', parentObject: 'OUTFALLS'});
                populateModalID(modalJSON, this.id);
            }

            // Check if the classList contains gpolygon
            if(this.classList.contains('gpolygon')){ 
                // Create object definitions to populate the modal
                let modalJSON = [];
                modalJSON.push({inputName: 'RainGage',  labelText: 'Rain Gage',     inputType: 'text', parentObject: 'SUBCATCHMENTS'});
                modalJSON.push({inputName: 'Outlet',    labelText: 'Outlet',        inputType: 'text', parentObject: 'SUBCATCHMENTS'});
                modalJSON.push({inputName: 'Area',      labelText: 'Area',          inputType: 'text', parentObject: 'SUBCATCHMENTS'});
                modalJSON.push({inputName: 'PctImperv', labelText: '% Impervious',  inputType: 'text', parentObject: 'SUBCATCHMENTS'});
                modalJSON.push({inputName: 'Width',     labelText: 'Width',         inputType: 'text', parentObject: 'SUBCATCHMENTS'});
                modalJSON.push({inputName: 'PctSlope',  labelText: '% Slope',       inputType: 'text', parentObject: 'SUBCATCHMENTS'});
                modalJSON.push({inputName: 'CurbLen',   labelText: 'Curb Length',   inputType: 'text', parentObject: 'SUBCATCHMENTS'});
                modalJSON.push({inputName: 'SnowPack',  labelText: 'Snow Pack',     inputType: 'text', parentObject: 'SUBCATCHMENTS'});
                modalJSON.push({inputName: 'NImperv',   labelText: 'n Impervious',  inputType: 'text', parentObject: 'SUBAREAS'});
                modalJSON.push({inputName: 'NPerv',     labelText: 'n Pervious',    inputType: 'text', parentObject: 'SUBAREAS'});
                modalJSON.push({inputName: 'SImperv',   labelText: 'Dstore-Imperv', inputType: 'text', parentObject: 'SUBAREAS'});
                modalJSON.push({inputName: 'SPerv',     labelText: 'Dstor-Perv',    inputType: 'text', parentObject: 'SUBAREAS'});
                modalJSON.push({inputName: 'PctZero',   labelText: '%Zero-Imperv',  inputType: 'text', parentObject: 'SUBAREAS'});
                modalJSON.push({inputName: 'RouteTo',   labelText: 'Subarea Routing', inputType: 'text', parentObject: 'SUBAREAS'});
                modalJSON.push({inputName: 'PctRouted', labelText: 'Percent Routed', inputType: 'text', parentObject: 'SUBAREAS'});
                populateModalID(modalJSON, this.id);
            }

            // Check if the classList contains gconduit
            if(this.classList.contains('gconduit')){ 
                modalJSON.push({inputName: 'FromNode',  labelText: 'Inlet Node',     inputType: 'text', parentObject: 'CONDUITS'});
                modalJSON.push({inputName: 'ToNode',    labelText: 'Outlet Node',    inputType: 'text', parentObject: 'CONDUITS'});
                modalJSON.push({inputName: 'Description', labelText: 'Description',  inputType: 'text', parentObject: 'CONDUITS'});
                modalJSON.push({inputName: 'Tag',       labelText: 'Tag',            inputType: 'text', parentObject: 'CONDUITS'});
                modalJSON.push({inputName: 'Shape',     labelText: 'Shape',          inputType: 'text', parentObject: 'XSECTIONS'});
                modalJSON.push({inputName: 'Geom1',     labelText: 'Max. Depth',     inputType: 'text', parentObject: 'XSECTIONS'});
                modalJSON.push({inputName: 'Length',    labelText: 'Length',         inputType: 'text', parentObject: 'CONDUITS'});
                modalJSON.push({inputName: 'Roughness', labelText: 'Roughness',      inputType: 'text', parentObject: 'CONDUITS'});
                modalJSON.push({inputName: 'InOffset',  labelText: 'Inlet Offset',   inputType: 'text', parentObject: 'CONDUITS'});
                modalJSON.push({inputName: 'OutOffset', labelText: 'Outlet Offset',  inputType: 'text', parentObject: 'CONDUITS'});
                modalJSON.push({inputName: 'InitFlow',  labelText: 'Initial Flow',   inputType: 'text', parentObject: 'CONDUITS'});
                modalJSON.push({inputName: 'MaxFlow',   labelText: 'Maximum Flow',   inputType: 'text', parentObject: 'CONDUITS'});
                if(!!swmmjs.model.LOSSES[this.id]){
                    swmmjs.model.LOSSES[this.id] = {Kin: 0, Kout: 0, Kavg: 0, FlapGate: '', SeepRate: 0};
                }
                modalJSON.push({inputName: 'Kin',       labelText: 'Entry Loss Coef.', inputType: 'text', parentObject: 'LOSSES'});
                modalJSON.push({inputName: 'Kout',      labelText: 'Exit Loss Coef.',  inputType: 'text', parentObject: 'LOSSES'});
                modalJSON.push({inputName: 'Kavg',      labelText: 'Avg. Loss Coef.',  inputType: 'text', parentObject: 'LOSSES'});
                modalJSON.push({inputName: 'SeepRate',  labelText: 'Seepage Loss Rate',inputType: 'text', parentObject: 'LOSSES'});
                modalJSON.push({inputName: 'FlapGate',  labelText: 'Flap Gate',        inputType: 'text', parentObject: 'LOSSES'});
                modalJSON.push({inputName: 'CulvertCode', labelText: 'Culvert Code',   inputType: 'text', parentObject: 'SUBAREAS'});
            }
        })
    }

    inp.parse = function(text) {
        var regex = {
            section: /^\s*\[\s*([^\]]*)\s*\].*$/,
            value: /\s*([^\s]+)([^;]*).*$/,
            description: /^\s*;.*$/,
            comment: /^\s*;;.*$/
        },
        parser = {
            LOSSES: function(section, key, line) {
                var m = [];
                line = key + line;
                m.push(line)
                m.push(line.slice(17,28))
                m.push(line.slice(28,39))
                m.push(line.slice(39,50))
                m.push(line.slice(50,61))
                m.push(line.slice(61,line.length))
                if (m && m.length)
                        section[key] = {Kin: parseFloat(m[1]), Kout: m[2].trim(), Kavg: m[3].trim(), FlapGate: m[4].trim(), SeepRate: m[5].trim()};
            },
            TITLE: function(section, key, line) {
                var m = line.match(/(.*)+/);
                if (m && m.length > 1)
                    section[0] = {TitleNotes: key + line};
            },
            OPTIONS: function(section, key, line) {
                    var m = line.match(/\s+([//\-:a-zA-Z0-9\.]+)/);
                    if (m && m.length)
                        section[key] = {Value: m[1]};
            },
            EVAPORATION: function(section, key, line) {
                    var m = line.match(/\s+([//\-:a-zA-Z0-9\.]+)/);
                    if (m && m.length)
                        section[key] = {Value: m[1]};
            },
            RAINGAGES: function(section, key, line) {
                    var m = line.match(/\s+([a-zA-Z0-9\.]+)\s+([:0-9\.]+)\s+([0-9\.]+)\s+([\sA-Za-z0-9\.]+)/);
                    if (m && m.length)
                        section[key] = {Format: m[1], Interval: m[2], SCF: m[3], Source: m[4]};
            },
            INFILTRATION: function(section, key, line) {
                    var m = line.match(/\s+([0-9\.]+)\s+([0-9\.]+)\s+([0-9\.]+)\s+([0-9\.]+)\s+([0-9\.]+)/);
                    if (m && m.length)
                        section[key] = {MaxRate: parseFloat(m[1]), MinRate: parseFloat(m[2]), Decay: parseFloat(m[3]), DryTime: parseFloat(m[4]), MaxInfil: parseFloat(m[5])};
            },
            JUNCTIONS: function(section, key, line, curDesc) {
                    var m = line.match(/\s+([0-9\.]+)\s+([0-9\.]+)\s+([0-9\.]+)\s+([0-9\.]+)\s+([0-9\.]+)/);
                    if (m && m.length)
                        section[key] = {Invert: parseFloat(m[1]), Dmax: parseFloat(m[2]), Dinit: parseFloat(m[3]), Dsurch: parseFloat(m[4]), Aponded: parseFloat(m[5]), Description: curDesc};
            },
            OUTFALLS: function(section, key, line) {
                var m = [];
                line = key + line;
                m.push(line)
                m.push(line.slice(17,28))
                m.push(line.slice(28,39))
                m.push(line.slice(39,56))
                m.push(line.slice(56,line.length))
                if (m && m.length)
                        section[key] = {Invert: parseFloat(m[1]), Type: m[2].trim(), StageData: m[3].trim(), Gated: m[4].trim()};
            },
            COORDINATES: function(section, key, line) {
                var m = line.match(/\s*(-?[0-9\.]+)\s+(-?[0-9\.]+)/);
                if (m && m.length && 3 === m.length)
                    section[key] = {x: parseFloat(m[1]), y: parseFloat(m[2])};
            },
            Polygons: function(section, key, line) {
                var m = line.match(/\s*(-?[0-9\.]+)\s+(-?[0-9\.]+)/);
                        if (!section[key]) 
                            section[key] = [];
                        if (Object.keys(section[key]).length === 0)
                            section[key] = [];
                if (m && m.length && 3 === m.length) {
                            var coord = {x: parseFloat(m[1]), y: parseFloat(m[2])};
                    section[key].push(coord);
                        }
            },
            LABELS: function(section, key, line) {
                var m = line.match(/\s+([-?[0-9\.]+)\s+"([^"]+)"/);
                if (m && m.length && 3 === m.length)
                    section[section.length] = {x: parseFloat(key), y: parseFloat(m[1]), label: m[2]};
            },
            CONDUITS: function(section, key, line) {
                var m = line.match(/\s*([^\s;]+)\s+([^\s;]+)\s+([0-9\.]+)\s+([0-9\.]+)\s+([0-9\.]+)\s+([0-9\.]+)\s+([0-9\.]+)\s+([^;]).*/);
                if (m && m.length && (8 === m.length || 9 === m.length)) {
                    section[key] = {FromNode: m[1], ToNode: m[2], 
                    Length: parseFloat(m[3]), Roughness: parseFloat(m[4]),
                    InOffset: parseFloat(m[5]), OutOffset: parseFloat(m[6]), InitFlow: m[7], MaxFlow: m[8]};
                }
            },
            SUBCATCHMENTS: function(section, key, line) {
                var m = line.match(/\s*([^\s;]+)\s+([0-9\.]+)\s+([0-9\.]+)\s+([0-9\.]+)\s+([0-9\.]+)\s+([0-9\.]+)\s+([0-9\.]+)\s+([^;]).*/);
                if (m && m.length && 9 === m.length) {
                    section[key] = {RainGage: m[1], Outlet: parseFloat(m[2]), 
                    Area: parseFloat(m[3]), PctImperv: parseFloat(m[4]),
                    Width: parseFloat(m[5]), PctSlope: parseFloat(m[6]), CurbLen: parseFloat(m[7]), SnowPack: m[8]};
                }
            },
            SUBAREAS: function(section, key, line) {
                var m = [];
                line = key + line;
                m.push(line)
                m.push(line.slice(17,24))
                m.push(line.slice(24,35))
                m.push(line.slice(35,46))
                m.push(line.slice(46,57))
                m.push(line.slice(57,68))
                m.push(line.slice(68,79))
                m.push(line.slice(79,96))
                m.push(line.slice(96,107))
                m.push(line.slice(107,118))
                m.push(line.slice(118,line.length))
                if (m && m.length)
                        section[key] = {NImperv: parseFloat(m[1]), 
                                        NPerv: parseFloat(m[2]), 
                                        SImperv: parseFloat(m[3]), 
                                        SPerv: parseFloat(m[4]), 
                                        PctZero: parseFloat(m[5]), 
                                        RouteTo: m[6].trim(), 
                                        PctRouted: m[7].trim()};
            },
            PUMPS: function(section, key, line) {
                var m = line.match(/\s*([^\s;]+)\s+([^\s;]+)\s+([^\s;]+)\s+([^\s;]+).*/);
                if (m && m.length && 5 === m.length) {
                    section[key] = {Node1: m[1], Node2: m[2], Curve: m[3], Status: m[4]};
                }
            },
            XSECTIONS: function(section, key, line) {
                var m = line.match(/\s*([^\s;]+)\s+([^\s;]+)\s+([0-9\.]+)\s+([^\s;]+)\s+([^\s;]+)\s+([0-9\.]+).*/);
                if (m && m.length && 7 === m.length) {
                    section[key] = {Shape: m[1], Geom1: m[2], Geom2: m[3], Geom3: m[4], Geom4: m[5], Barrels: m[6]};
                }
            },
            POLLUTANTS: function(section, key, line) {
                var m = [];
                line = key + line;
                m.push(line)
                m.push(line.slice(17,24))
                m.push(line.slice(24,35))
                m.push(line.slice(35,46))
                m.push(line.slice(46,57))
                m.push(line.slice(57,68))
                m.push(line.slice(68,79))
                m.push(line.slice(79,96))
                m.push(line.slice(96,107))
                m.push(line.slice(107,118))
                m.push(line.slice(118,line.length))
                if (m && m.length)
                        section[key] = {Units: m[1].trim(), 
                                        Cppt: parseFloat(m[2]), 
                                        Cgw: parseFloat(m[3]), 
                                        Crdii: parseFloat(m[4]), 
                                        Kdecay: parseFloat(m[5]), 
                                        SnowOnly: m[6].trim(), 
                                        CoPollutant: m[7].trim(), 
                                        CoFrac: parseFloat(m[8]), 
                                        Cdwf: parseFloat(m[9]),  
                                        Cinit: parseFloat(m[10])};
            },
            LANDUSES: function(section, key, line) {
                var m = [];
                line = key + line;
                m.push(line)
                m.push(line.slice(17,28))
                m.push(line.slice(28,39))
                m.push(line.slice(39,line.length))
                if (m && m.length)
                        section[key] = {Interval: m[1].trim(), Available: m[2].trim(), Cleaned: m[3].trim()};
            },
            COVERAGES: function(section, key, line) {
                var m = [];
                line = key + line;
                m.push(line)
                m.push(line.slice(17,34))
                m.push(line.slice(34,line.length))
                if (m && m.length)
                        section[key] = {LandUse: m[1].trim(), Percent: parseFloat(m[2])};
            },
            LOADINGS: function(section, key, line) {
                var m = [];
                line = key + line;
                m.push(line)
                m.push(line.slice(17,34))
                m.push(line.slice(34,line.length))
                if (m && m.length)
                        section[key] = {Pollutant: m[1].trim(), InitLoad: parseFloat(m[2])};
            },
            BUILDUP: function(section, key, line) {
                var m = [];
                line = key + line;
                m.push(line)
                m.push(line.slice(0, 17))
                m.push(line.slice(17,34))
                m.push(line.slice(34,45))
                m.push(line.slice(45,56))
                m.push(line.slice(56,67))
                m.push(line.slice(67,78))
                m.push(line.slice(78,line.length))
                if (m && m.length)
                        section[Object.keys(section).length] = {
                                        LandUse: m[1].trim(), 
                                        Pollutant: m[2].trim(), 
                                        Function: m[3].trim(),
                                        Coeff1: parseFloat(m[4]) || 0,
                                        Coeff2: parseFloat(m[5]) || 0,
                                        Coeff3: parseFloat(m[6]) || 0,
                                        Normalizer: m[7].trim()};
            },  
            WASHOFF: function(section, key, line) {
                var m = [];
                line = key + line;
                m.push(line)
                m.push(line.slice(0, 17))
                m.push(line.slice(17,34))
                m.push(line.slice(34,45))
                m.push(line.slice(45,56))
                m.push(line.slice(56,67))
                m.push(line.slice(67,78))
                m.push(line.slice(78,line.length))
                if (m && m.length)
                        section[Object.keys(section).length] = {
                                        LandUse: m[1].trim(), 
                                        Pollutant: m[2].trim(), 
                                        Function: m[3].trim(),
                                        Coeff1: parseFloat(m[4]) || 0,
                                        Coeff2: parseFloat(m[5]) || 0,
                                        Ecleaning: parseFloat(m[6]) || 0,
                                        Ebmp: m[7].trim()};
            },    



            TIMESERIES: function(section, key, line) {
                var m = [];
                line = key + line;
                m.push(line)
                m.push(line.slice(17,28))
                m.push(line.slice(28,39))
                m.push(line.slice(39,line.length))
                if (m && m.length)
                        section[Object.keys(section).length] = {
                                        TimeSeries: key.trim(),
                                        Date: m[1].trim(), 
                                        Time: m[2].trim(),
                                        Value: parseFloat(m[3])};
            },  
            VERTICES: function(section, key, line) {
                var m = line.match(/\s*(-?[0-9\.]+)\s+(-?[0-9\.]+)/),
                v = section[key] || [],
                c = {};
                if (m && m.length && 3 === m.length) {
                    c.x = parseFloat(m[1]);
                    c.y = parseFloat(m[2]);
                }
                v[v.length] = c;
                section[key] = v;
            },
            REPORT: function(section, key, line) {
                    var m = line.match(/\s+([//\-:a-zA-Z0-9\.]+)/);
                    if (m && m.length)
                        section[key] = {Value: m[1]};
            },
            TAGS: function(section, key, line) {
                var m = [];
                line = key + line;
                m.push(line)
                m.push(line.slice(0, 11))
                m.push(line.slice(11,28))
                m.push(line.slice(28,line.length))
                if (m && m.length)
                        section[Object.keys(section).length] = {
                                        Type: m[1].trim(), 
                                        ID: m[2].trim(), 
                                        Tag: m[3].trim()};
            },
            SYMBOLS: function(section, key, line) {
                var m = [];
                line = key + line;
                m.push(line)
                m.push(line.slice(17,36))
                m.push(line.slice(36,line.length))
                if (m && m.length)
                        section[key] = {XCoord: parseFloat(m[1]), 
                                        YCoord: parseFloat(m[2])};
            },  
            TIMES: function(section, key, line) { // to do: check
                var m = line.match(/(CLOCKTIME|START|TIMESTEP)\s+([^\s].*[^\s])\s*/i);
                if (m && m.length && 3 === m.length) {
                    section[(key + ' ' + m[1]).toUpperCase()] = m[2];
                }
                else {
                    section[key.toUpperCase()] = line.replace(/^\s+/, '').replace(/\s+$/, '');
                }
            }
                // add other if neccesary
        },
        model = {COORDINATES: {}, LABELS: [], STORAGE: {}, OUTFALLS: {}},
        lines = text.split(/\r\n|\r|\n/),
            section = null;
        let curDesc = '';
        lines.forEach(function(line) {
            // If the entry is a comment, then attempt to assign it as the description for the current
            // object, or return nothing.
            if (regex.comment.test(line)) {
                curDesc = '';
                return;
            }
            else if (regex.description.test(line)) {
                // Get the comment without the semicolon
                curDesc = line.slice(1, line.length);

            } else if (regex.section.test(line)) {
                var s = line.match(regex.section);
                if ('undefined' === typeof model[s[1]])
                    model[s[1]] = {};
                section = s[1];
            } else if (regex.value.test(line)) {
                var v = line.match(regex.value);
                if (parser[section])
                    parser[section](model[section], v[1], v[2], curDesc);
                else
                    model[section][v[1]] = v[2];
                curDesc = '';
            };
        });

	    return model;
    };

    return inp;
};

// Read SWMM binary result files
d3.swmmresult = function() {
    function swmmresult() { }

    const SUBCATCH = 0,
        NODE     = 1,
        LINK     = 2,
        SYS      = 3,
        POLLUT   = 4,
        RECORDSIZE = 4;                       // number of bytes per file record

    TYPECODE = { // not used
        0: {1: 'Area'},
        1: {0: 'Junction',
            1: 'Outfall',
            2: 'Storage',
            3: 'Divider'},
        2: {0: 'Conduit',
            1: 'Pump',
            2: 'Orifice',
            3: 'Weir',
            4: 'Outlet'}
    };
            
    VARCODE = { 
        0: {0: 'Rainfall',
            1: 'Snow_depth',
            2: 'Evaporation_loss',
            3: 'Infiltration_loss',
            4: 'Runoff_rate',
            5: 'Groundwater_outflow',
            6: 'Groundwater_elevation',
            7: 'Soil_moisture',
            8: 'Pollutant_washoff'},
        1: {0: 'Depth_above_invert',
            1: 'Hydraulic_head',
            2: 'Volume_stored_ponded',
            3: 'Lateral_inflow',
            4: 'Total_inflow',
            5: 'Flow_lost_flooding'},
        2: {0: 'Flow_rate',
            1: 'Flow_depth',
            2: 'Flow_velocity',
            3: 'Froude_number',
            4: 'Capacity'},
        4: {0: 'Air_temperature',
            1: 'Rainfall',
            2: 'Snow_depth',
            3: 'Evaporation_infiltration',
            4: 'Runoff',
            5: 'Dry_weather_inflow',
            6: 'Groundwater_inflow',
            7: 'RDII_inflow',
            8: 'User_direct_inflow',
            9: 'Total_lateral_inflow',
            10: 'Flow_lost_to_flooding',
            11: 'Flow_leaving_outfalls',
            12: 'Volume_stored_water',
            13: 'Evaporation_rate',
            14: 'Potential_PET'}
    };
    
    _SWMM_FLOWUNITS = { // not used
            0: 'CFS',
            1: 'GPM',
            2: 'MGD',
            3: 'CMS',
            4: 'LPS',
            5: 'LPD'
    };    
    swmmresult.i4 = Module._malloc(4);
    swmmresult.string = Module._malloc(255);

    swmmresult.parse = function(filename, size) {
	var c = (FS.findObject(filename) ? FS.findObject(filename).contents : (typeof filename === "object"? filename : undefined)),
		r = {},
		er = swmmresult;
        
        this.offsetOID = 0;

        this.SWMM_Nperiods = 0,              // number of reporting periods
        this.SWMM_FlowUnits = 0,             // flow units code
        this.SWMM_Nsubcatch = 0,             // number of subcatchments
        this.SWMM_Nnodes = 0,                // number of drainage system nodes
        this.SWMM_Nlinks = 0,                // number of drainage system links
        this.SWMM_Npolluts = 0,              // number of pollutants tracked
        this.SWMM_StartDate = new Date(),              // start date of simulation
        this.SWMM_ReportStep = 0;            // reporting time step (seconds)	
        
        this.SubcatchVars = 0,               // number of subcatch reporting variable
        this.NodeVars = 0,                   // number of node reporting variables
        this.LinkVars = 0,                   // number of link reporting variables
        this.SysVars = 0,                    // number of system reporting variables
        this.StartPos = 0,                   // file position where results start
        this.BytesPerPeriod = 0;             // bytes used for results in each period
        
        var
            magic1, magic2, errCode, version;
        var
            offset, offset0;
            
        var stat = null;
        try {
            if (c)
                stat = FS.stat(filename);
        } catch (e) {
            stat = size || "undefined";
            console.log(e);
        }
        
        if (stat) {
            var size = (stat.size ? stat.size : stat);
            if (size < 14*RECORDSIZE) {
                return 1;
            }
            this.offsetOID = er.readInt(c, size-6*RECORDSIZE, RECORDSIZE);
            offset0 = er.readInt(c, size-5*RECORDSIZE, RECORDSIZE);
            this.StartPos = er.readInt(c, size-4*RECORDSIZE, RECORDSIZE);
            this.SWMM_Nperiods = er.readInt(c, size-3*RECORDSIZE, RECORDSIZE);
            errCode = er.readInt(c, size-2*RECORDSIZE, RECORDSIZE);
            magic2 = er.readInt(c, size-RECORDSIZE, RECORDSIZE);
            magic1 = er.readInt(c, 0, RECORDSIZE);
            
            if (magic1 !== magic2) return 1;
            else if (errCode !== 0) return 1;
            else if (this.SWMM_Nperiods===0) return 1;
            
            version = er.readInt(c, RECORDSIZE, RECORDSIZE);
            this.SWMM_FlowUnits = er.readInt(c, 2*RECORDSIZE, RECORDSIZE);
            this.SWMM_Nsubcatch = er.readInt(c, 3*RECORDSIZE, RECORDSIZE);
            this.SWMM_Nnodes = er.readInt(c, 4*RECORDSIZE, RECORDSIZE);
            this.SWMM_Nlinks = er.readInt(c, 5*RECORDSIZE, RECORDSIZE);
            this.SWMM_Npolluts = er.readInt(c, 6*RECORDSIZE, RECORDSIZE);
            
            // Skip over saved subcatch/node/link input values
            offset = (this.SWMM_Nsubcatch+2) * RECORDSIZE     // Subcatchment area
                       + (3*this.SWMM_Nnodes+4) * RECORDSIZE  // Node type, invert & max depth
                       + (5*this.SWMM_Nlinks+6) * RECORDSIZE; // Link type, z1, z2, max depth & length
            offset = offset0 + offset;

            this.SubcatchVars = er.readInt(c, offset, RECORDSIZE);
            this.NodeVars = er.readInt(c, offset + (this.SubcatchVars*RECORDSIZE), RECORDSIZE);
            this.LinkVars = er.readInt(c, offset + (this.SubcatchVars*RECORDSIZE) + (this.NodeVars*RECORDSIZE), RECORDSIZE);
            this.SysVars = er.readInt(c, offset + (this.SubcatchVars*RECORDSIZE) + (this.NodeVars*RECORDSIZE) + (this.LinkVars*RECORDSIZE), RECORDSIZE);
            
            offset = this.StartPos - 3*RECORDSIZE;
            var days = (er.readInt(c, offset, 2*RECORDSIZE)+1);
            this.SWMM_StartDate = new Date('12/31/1899');
            this.SWMM_StartDate = new Date(this.SWMM_StartDate.setDate(this.SWMM_StartDate.getDate() + days));
            this.SWMM_ReportStep = er.readInt(c, offset + 2*RECORDSIZE, RECORDSIZE);
            
            this.SubcatchVars = (8 + this.SWMM_Npolluts);
            this.NodeVars = (6 + this.SWMM_Npolluts);
            this.LinkVars = (5 + this.SWMM_Npolluts);
            this.SysVars = 15;
            
            this.BytesPerPeriod = RECORDSIZE*(2 + 
                    this.SWMM_Nsubcatch*this.SubcatchVars +
                    this.SWMM_Nnodes*this.NodeVars +
                    this.SWMM_Nlinks*this.LinkVars +
                    this.SysVars); 
            
            var variables = {};
            var nr = this.offsetOID;
            // Object names
            var subcatch = {}, node = {}, link = {}, pollut = {};
            for (var i =0; i< this.SWMM_Nsubcatch; i++) {
                var no = er.readInt(c, nr, RECORDSIZE);
                subcatch[i] = [ Module.intArrayToString(Array.prototype.slice.call(c,nr, nr + no + RECORDSIZE)).replace(/[^a-z0-9_\.]/gi, '') ];
                nr = nr + no + RECORDSIZE;
            }
            variables['SUBCATCH'] = {};
            variables['SUBCATCH']['items'] = subcatch;
            
            for (var i =0; i< this.SWMM_Nnodes; i++) {
                var no = er.readInt(c, nr, RECORDSIZE);
                node[i] = [ Module.intArrayToString(Array.prototype.slice.call(c,nr, nr + no + RECORDSIZE)).replace(/[^a-z0-9_\.]/gi, '') ];
                nr = nr + no + RECORDSIZE;
            }
            variables['NODE'] = {};
            variables['NODE']['items'] = node;
            
            for (var i =0; i< this.SWMM_Nlinks; i++) {
                var no = er.readInt(c, nr, RECORDSIZE);
                link[i] = [ Module.intArrayToString(Array.prototype.slice.call(c,nr, nr + no + RECORDSIZE)).replace(/[^a-z0-9_\.]/gi, '') ];
                nr = nr + no + RECORDSIZE;
            }
            variables['LINK'] = {};
            variables['LINK']['items'] = link;
            
            for (var i =0; i< this.SWMM_Npolluts; i++) {
                var no = er.readInt(c, nr, RECORDSIZE);
                pollut[i] = Module.intArrayToString(Array.prototype.slice.call(c,nr, nr + no + RECORDSIZE)).replace(/[^a-z0-9_\.]/gi, '');
                nr = nr + no + RECORDSIZE;
            }
            variables['POLLUT'] = {};
            variables['POLLUT']['items'] = pollut;
            
            while (nr<offset0) {
                var nm = er.readInt(c, nr, RECORDSIZE);
                variables.nm = nm;
                nr = nr + RECORDSIZE;
            }
            // Object properties
            nr = offset0;
            
            var vals = [];
            
            no = er.readInt(c, nr, RECORDSIZE);
            nr = nr + RECORDSIZE;
            vals.push(no);
            no = er.readInt(c, nr, RECORDSIZE);
            nr = nr + RECORDSIZE;
            vals.push(no);
            variables['SUBCATCH']['init'] = vals;
            
            vals = [];
            for (var i =0; i< this.SWMM_Nsubcatch; i++) {
                var no = er.readInt(c, nr, RECORDSIZE);
                nr = nr + RECORDSIZE;
                vals.push(no);
            }
            variables['SUBCATCH']['properties'] = vals;
            
            vals = [];
            no = er.readInt(c, nr, RECORDSIZE);
            nr = nr + RECORDSIZE;
            vals.push(no);
            no = er.readInt(c, nr, RECORDSIZE);
            nr = nr + RECORDSIZE;
            vals.push(no);
            no = er.readInt(c, nr, RECORDSIZE);
            nr = nr + RECORDSIZE;
            vals.push(no);
            no = er.readInt(c, nr, RECORDSIZE);
            nr = nr + RECORDSIZE;
            vals.push(no);
            variables['NODE']['init'] = vals;
            
            vals = [];
            for (var i =0; i< this.SWMM_Nnodes; i++) {
                var el = {};
                var val = [];
                var no = er.readInt(c, nr, RECORDSIZE);
                nr = nr + RECORDSIZE;
                val.push(no);
                no = er.readFloat(c, nr, RECORDSIZE);
                nr = nr + RECORDSIZE;
                val.push(no);
                no = er.readFloat(c, nr, RECORDSIZE);
                nr = nr + RECORDSIZE;
                val.push(no);
                el[variables['NODE']['items'][i]] = val;
                vals.push(el);
            }
            variables['NODE']['properties'] = vals;

            vals = [];
            no = er.readInt(c, nr, RECORDSIZE);
            nr = nr + RECORDSIZE;
            vals.push(no);
            no = er.readInt(c, nr, RECORDSIZE);
            nr = nr + RECORDSIZE;
            vals.push(no);
            no = er.readInt(c, nr, RECORDSIZE);
            nr = nr + RECORDSIZE;
            vals.push(no);
            no = er.readInt(c, nr, RECORDSIZE);
            nr = nr + RECORDSIZE;
            vals.push(no);
            no = er.readInt(c, nr, RECORDSIZE);
            nr = nr + RECORDSIZE;
            vals.push(no);
            no = er.readInt(c, nr, RECORDSIZE);
            nr = nr + RECORDSIZE;
            vals.push(no);
            variables['LINK']['init'] = vals;

            vals = [];
            for (var i =0; i< this.SWMM_Nlinks; i++) {
                var el = {};
                var val = [];
                var no = er.readInt(c, nr, RECORDSIZE);
                nr = nr + RECORDSIZE;
                val.push(no);
                no = er.readFloat(c, nr, RECORDSIZE);
                nr = nr + RECORDSIZE;
                val.push(no);
                no = er.readFloat(c, nr, RECORDSIZE);
                nr = nr + RECORDSIZE;
                val.push(no);
                no = er.readFloat(c, nr, RECORDSIZE);
                nr = nr + RECORDSIZE;
                val.push(no);
                no = er.readFloat(c, nr, RECORDSIZE);
                nr = nr + RECORDSIZE;
                val.push(no);
                el[variables['LINK']['items'][i]] = val;
                vals.push(el);
            }
            variables['LINK']['properties'] = vals;
            
            r['objects'] = variables;
            
            //reporting variables - 
            //SubcatchVars = 8;
            //NodeVars = 6;
            //LinkVars = 5;
            this.StartPosResult = this.StartPos;
            for (var i = 1; i <= this.SWMM_Nperiods; i++) {
                r[i] = {};
                var no = undefined;
                var vals = {};
                var el = [];
                
                this.StartPosResult += 2*RECORDSIZE;
                
                for (var j = 0; j < this.SWMM_Nsubcatch; j++) {
                    el = [];
                    for (var k = 0; k < this.SubcatchVars ; k++) { //2 = 1 number of subcatchment variables + 1 polluants
                        no = er.getswmmresultoffset(SUBCATCH, j, k, i);
                        el.push(er.readFloat(c, no, RECORDSIZE));
                    }
                    vals[variables['SUBCATCH']['items'][j]] = el;
                }
                r[i]['SUBCATCH'] = vals;

                vals = {};
                for (var j = 0; j <  this.SWMM_Nnodes; j++) {
                    el = [];
                    for (var k = 0; k < this.NodeVars; k++) {
                        no = er.getswmmresultoffset(NODE, j, k, i);
                        el.push(er.readFloat(c, no, RECORDSIZE));
                    }
                    vals[variables['NODE']['items'][j]] = el;
                }
                r[i]['NODE'] = vals;

                vals = {};
                for (var j = 0; j <  this.SWMM_Nlinks; j++) {
                    el = [];
                    for (var k = 0; k < this.LinkVars; k++) {
                        no = er.getswmmresultoffset(LINK, j, k, i);
                        el.push(er.readFloat(c, no, RECORDSIZE));
                    }
                    vals[variables['LINK']['items'][j]] = el;
                }
                r[i]['LINK'] = vals;

                vals = {};
                el = [];
                for (var k = 0; k < this.SysVars; k++) {
                    no = er.getswmmresultoffset(SYS, j, k, i);
                    el.push(er.readFloat(c, no, RECORDSIZE));
                }
                r[i]['SYS'] = el;

                this.StartPosResult = no + RECORDSIZE;
            }
        }
        
        return r;
    };

    swmmresult.getswmmresultoffset = function(iType, iIndex, vIndex, period ) {
        var offset1, offset2;
        offset1 = this.StartPosResult; // + (period-1)*this.BytesPerPeriod + 2*RECORDSIZE;
        
        if ( iType === SUBCATCH ) 
          offset2 = (iIndex*(this.SubcatchVars) + vIndex);
        else if (iType === NODE) 
          offset2 = (this.SWMM_Nsubcatch*this.SubcatchVars + iIndex*this.NodeVars + vIndex);
        else if (iType === LINK)
          offset2 = (this.SWMM_Nsubcatch*this.SubcatchVars + this.SWMM_Nnodes*this.NodeVars + iIndex*this.LinkVars + vIndex);
        else if (iType === SYS) 
            offset2 = (this.SWMM_Nsubcatch*this.SubcatchVars + this.SWMM_Nnodes*this.NodeVars + this.SWMM_Nlinks*this.LinkVars + vIndex);
        
        return offset1 + RECORDSIZE * offset2;
    };
    
    swmmresult.readInt = function(content, offset, recordsize) {
        Module.HEAP8.set(new Int8Array(content.slice(offset, offset + recordsize)), swmmresult.i4);
        return Module.getValue(swmmresult.i4, 'i32');
    };

    swmmresult.readFloat = function(content, offset, recordsize) {
        Module.HEAP8.set(new Int8Array(content.slice(offset, offset + recordsize)), swmmresult.i4);
        return Module.getValue(swmmresult.i4, 'float');
    };

    return swmmresult;
};

var margin = {top: 1, right: 1, bottom: 6, left: 1},
    width = 300 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var formatNumber = d3.format(",.3f"),
    format = function(d) {
        var units = swmmjs.model['OPTIONS']['Units'].replace(/\s*/g,'') || 'CMD',
                u = swmmjs.unit(units, $('#linkResult').val().toUpperCase());
        return formatNumber(d)+' '+u;
    },
    color = d3.scaleOrdinal(d3.schemeCategory10);

var swmmjs = function() {
    swmmjs = function() {
    };

    swmmjs.INPUT = 1;
    
    swmmjs.nodesections = ['JUNCTIONS', 'STORAGE'];
    swmmjs.linksections = ['CONDUITS', 'PUMPS'];

    swmmjs.mode = swmmjs.INPUT;
    swmmjs.success = false;
    swmmjs.results = false;
    swmmjs.colors = {'NODES': false, 'LINKS': false};
    swmmjs.model = false;
    swmmjs.currentScale = 1;
    swmmjs.currentPosition = [];
    swmmjs.renderLegend = false;
    swmmjs.defaultColor = '#636363';
    
    swmmjs.setMode = function(mode) {
        swmmjs.mode = mode;
        if(swmmjs.renderLegend)
            $('#legend').show();
        else
            $('#legend').hide();
            
        swmmjs.render();
    };

    // Render the map
    swmmjs.svg = function() {
	    var svg = function() {
	};
	
	// ======================================================================================================
	// This product includes color specifications and designs 
	// developed by Cynthia Brewer (http://colorbrewer.org/).
	// See ../../COPYING for licensing details.
	// RdYlGn
	svg.colors =  {'NODES': ["#d7191c","#fdae61","#ffffbf","#a6d96a","#1a9641"],
	// RdBu
	    'LINKS': ["#ca0020","#f4a582","#f7f7f7","#92c5de","#0571b0"]};
	// ======================================================================================================

	svg.width = window.innerWidth || document.documentElement.clientWidth || d.getElementsByTagName('body')[0].clientWidth;
	svg.height = 500;
	svg.nodemap = {};
	svg.lastNodeId = 0;
	svg.links = [];
	svg.nodes = [];
	svg.nodeSize = 1;
        svg.minx = undefined;
        svg.maxx = undefined;
        svg.miny = undefined;
        svg.maxy = undefined;
        svg.top = undefined;
        svg.strokeWidth = undefined;

	svg.removeAll = function(el) {
	    el.selectAll('line').remove();
	    el.selectAll('circle').remove();
	    el.selectAll('rect').remove();
	    el.selectAll('polygon').remove();
	    el.selectAll('text').remove();
	    el.selectAll('g').remove();
	};

	svg.tooltip = function(element) {
            var a = (element ? element.attributes : this.attributes),
                text = (a ? a['title'].value : '');
        
	    if(swmmjs.INPUT !== swmmjs.mode && swmmjs.success) {
		var fmt = d3.format('0.3f'),
                    nodeResult = $('#nodeResult').val().toUpperCase(),
                    v = (swmmjs.results[$('#time').val()] ? (swmmjs.results[$('#time').val()]['NODE'][text] ? swmmjs.results[$('#time').val()]['NODE'][text][nodeResult] : '') : '');
                text = fmt(v);
	    }

            document.getElementById('tooltip').style.display = 'block';
            document.getElementById('tooltip').style.backgroundColor = 'white';
            document.getElementById('tooltip').style.position = 'absolute';
            document.getElementById('tooltip').style.left = (swmmjs.currentPosition[0]+10) + 'px';
            document.getElementById('tooltip').style.top = (swmmjs.currentPosition[1]+10) + 'px';
            document.getElementById('tooltip').innerHTML = text;

	};

	svg.clearTooltips = function(element) {
            document.getElementById('tooltip').style.display = 'none';
	};


    svg.save = function() {
        let model = swmmjs.model;
        let inpString = '';
        let secStr = '';
        
        secStr = '[TITLE]';
        inpString += '[TITLE]\n'
        inpString += model.TITLE[0]['TitleNotes'];
        inpString += '\n';
        inpString += '\n';
        
        secStr = 'OPTIONS';
        inpString +='[OPTIONS]\n;;Option             Value\n'
        for (let entry in model[secStr]) {
            inpString += entry.padEnd(21, ' ');
            inpString += model[secStr][entry].Value;
            inpString += '\n';
        }
        inpString += '\n';

        secStr = 'EVAPORATION';
        inpString +='[EVAPORATION]\n;;Evap Data      Parameters\n;;-------------- ----------------\n'
        for (let entry in model[secStr]) {
            inpString += entry.padEnd(17, ' ');
            inpString += model[secStr][entry].Value;
            inpString += '\n';
        }
        inpString += '\n';

        secStr = 'RAINGAGES';
        inpString +='[RAINGAGES]\n;;Gage           Format    Interval SCF      Source\n;;-------------- --------- ------ ------ ----------\n'
        for (let entry in model[secStr]) {
            inpString += entry.padEnd(17, ' ');
            inpString += model[secStr][entry].Format.padEnd(10, ' ');
            inpString += model[secStr][entry].Interval.padEnd(7, ' ');
            inpString += model[secStr][entry].SCF.padEnd(7, ' ');
            inpString += model[secStr][entry].Source.padEnd(31, ' ');
            inpString += '\n';
        }
        inpString += '\n';

        secStr = 'SUBCATCHMENTS';
        inpString +='[SUBCATCHMENTS]\n;;Subcatchment   Rain Gage        Outlet           Area     %Imperv  Width    %Slope   CurbLen  Snow Pack       \n;;-------------- ---------------- ---------------- -------- -------- -------- -------- -------- ----------------\n'
        for (let entry in model[secStr]) {
            inpString += entry.padEnd(17, ' ');
            inpString += model[secStr][entry].RainGage.padEnd(17, ' ');
            inpString += model[secStr][entry].Outlet.toString().padEnd(17, ' ');
            inpString += model[secStr][entry].Area.toString().padEnd(9, ' ');
            inpString += model[secStr][entry].PctImperv.toString().padEnd(9, ' ');
            inpString += model[secStr][entry].Width.toString().padEnd(9, ' ');
            inpString += model[secStr][entry].PctSlope.toString().padEnd(9, ' ');
            inpString += model[secStr][entry].CurbLen.toString().padEnd(9, ' ');
            inpString += model[secStr][entry].SnowPack.padEnd(17, ' ');
            inpString += '\n';
        }
        inpString += '\n';

        secStr = 'SUBAREAS';
        inpString +='[SUBAREAS]\n;;Subcatchment   N-Imperv   N-Perv     S-Imperv   S-Perv     PctZero    RouteTo    PctRouted \n;;-------------- ---------- ---------- ---------- ---------- ---------- ---------- ----------\n'
        for (let entry in model[secStr]) {
            inpString += entry.padEnd(17, ' ');
            inpString += model[secStr][entry].NImperv.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].NPerv.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].SImperv.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].SPerv.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].PctZero.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].RouteTo.padEnd(11, ' ');
            inpString += model[secStr][entry].PctRouted.padEnd(11, ' ');
            inpString += '\n';
        }
        inpString += '\n';

        secStr = 'INFILTRATION';
        inpString +='[INFILTRATION]\n;;Subcatchment   MaxRate    MinRate    Decay      DryTime    MaxInfil  \n;;-------------- ---------- ---------- ---------- ---------- ----------\n'        
        for (let entry in model[secStr]) {
            inpString += entry.padEnd(17, ' ');
            inpString += model[secStr][entry].MaxRate.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].MinRate.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].Decay.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].DryTime.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].MaxInfil.toString().padEnd(11, ' ');
            inpString += '\n';
        }
        inpString += '\n';

        secStr = 'JUNCTIONS';
        inpString +='[JUNCTIONS]\n;;Junction       Invert     Dmax       Dinit      Dsurch     Aponded   \n;;-------------- ---------- ---------- ---------- ---------- ----------\n'        
        for (let entry in model[secStr]) {
            // If there is a description, save it.
            if(model[secStr][entry].Description.length > 0){
                inpString += ';' + model[secStr][entry].Description + '\n';
            }
            inpString += entry.padEnd(17, ' ');
            inpString += model[secStr][entry].Invert.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].Dmax.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].Dinit.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].Dsurch.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].Aponded.toString().padEnd(11, ' ');
            inpString += '\n';
        }
        inpString += '\n';

        secStr = 'OUTFALLS';
        inpString +='[OUTFALLS]\n;;Outfall        Invert     Type       Stage Data       Gated   \n;;-------------- ---------- ---------- ---------------- --------\n'        
        for (let entry in model[secStr]) {
            inpString += entry.padEnd(17, ' ');
            inpString += model[secStr][entry].Invert.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].Type.padEnd(11, ' ');
            inpString += model[secStr][entry].StageData.padEnd(17, ' ');
            inpString += model[secStr][entry].Gated.padEnd(9, ' ');
            inpString += '\n';
        }
        inpString += '\n';

        secStr = 'CONDUITS';
        inpString +='[CONDUITS]\n;;Conduit        From Node        To Node          Length     Roughness  InOffset   OutOffset  InitFlow   MaxFlow   \n;;-------------- ---------------- ---------------- ---------- ---------- ---------- ---------- ---------- ----------\n'        
        for (let entry in model[secStr]) {
            inpString += entry.padEnd(17, ' ');
            inpString += model[secStr][entry].FromNode.padEnd(17, ' ');
            inpString += model[secStr][entry].ToNode.padEnd(17, ' ');
            inpString += model[secStr][entry].Length.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].Roughness.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].InOffset.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].OutOffset.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].InitFlow.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].MaxFlow.toString().padEnd(11, ' ');
            inpString += '\n';
        }
        inpString += '\n';

        secStr = 'XSECTIONS';
        inpString +='[XSECTIONS]\n;;Link           Shape        Geom1            Geom2      Geom3      Geom4      Barrels   \n;;-------------- ------------ ---------------- ---------- ---------- ---------- ----------\n'        
        for (let entry in model[secStr]) {
            inpString += entry.padEnd(17, ' ');
            inpString += model[secStr][entry].Shape.padEnd(13, ' ');
            inpString += model[secStr][entry].Geom1.toString().padEnd(17, ' ');
            inpString += model[secStr][entry].Geom2.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].Geom3.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].Geom4.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].Barrels.toString().padEnd(11, ' ');
            inpString += '\n';
        }
        inpString += '\n';

        secStr = 'LOSSES';
        inpString +='[LOSSES]\n;;Link           Kin        Kout       Kavg       Flap Gate  SeepRate  \n;;-------------- ---------- ---------- ---------- ---------- ----------\n'        
        for (let entry in model[secStr]) {
            inpString += entry.padEnd(17, ' ');
            inpString += model[secStr][entry].Kin.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].Kout.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].Kavg.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].FlapGate.padEnd(11, ' ');
            inpString += model[secStr][entry].SeepRate.toString().padEnd(11, ' ');
            inpString += '\n';
        }
        inpString += '\n';

        secStr = 'POLLUTANTS';
        inpString +='[POLLUTANTS]\n;;Pollutant      Units  Cppt       Cgw        Crdii      Kdecay     SnowOnly   Co-Pollutant     Co-Frac    Cdwf       Cinit     \n;;-------------- ------ ---------- ---------- ---------- ---------- ---------- ---------------- ---------- ---------- ----------\n'        
        for (let entry in model[secStr]) {
            inpString += entry.padEnd(17, ' ');
            inpString += model[secStr][entry].Units.padEnd(7, ' ');
            inpString += model[secStr][entry].Cppt.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].Cgw.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].Crdii.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].Kdecay.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].SnowOnly.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].CoPollutant.padEnd(17, ' ');
            inpString += model[secStr][entry].CoFrac.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].Cdwf.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].Cinit.toString().padEnd(11, ' ');
            inpString += '\n';
        }
        inpString += '\n';

        secStr = 'LANDUSES';
        inpString +='[LANDUSES]\n;;               Cleaning   Fraction   Last      \n;;Land Use       Interval   Available  Cleaned   \n;;-------------- ---------- ---------- ----------\n'        
        for (let entry in model[secStr]) {
            inpString += entry.padEnd(17, ' ');
            inpString += model[secStr][entry].Interval.padEnd(11, ' ');
            inpString += model[secStr][entry].Available.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].Cleaned.padEnd(11, ' ');
            inpString += '\n';
        }
        inpString += '\n';

        secStr = 'COVERAGES';
        inpString +='[COVERAGES]\n;;Subcatchment   Land Use         Percent   \n;;-------------- ---------------- ----------\n'        
        for (let entry in model[secStr]) {
            inpString += entry.padEnd(17, ' ');
            inpString += model[secStr][entry].LandUse.padEnd(17, ' ');
            inpString += model[secStr][entry].Percent.toString().padEnd(11, ' ');
            inpString += '\n';
        }
        inpString += '\n';

        secStr = 'LOADINGS';
        inpString +='[LOADINGS]\n;;Subcatchment   Pollutant        InitLoad  \n;;-------------- ---------------- ----------\n'        
        for (let entry in model[secStr]) {
            inpString += entry.padEnd(17, ' ');
            inpString += model[secStr][entry].Pollutant.padEnd(17, ' ');
            inpString += model[secStr][entry].InitLoad.toString().padEnd(11, ' ');
            inpString += '\n';
        }
        inpString += '\n';

        secStr = 'BUILDUP';
        inpString +='[BUILDUP]\n;;Land Use       Pollutant        Function   Coeff1     Coeff2     Coeff3     Normalizer\n;;-------------- ---------------- ---------- ---------- ---------- ---------- ----------\n'        
        for (let entry in model[secStr]) {
            inpString += model[secStr][entry].LandUse.padEnd(17, ' ');
            inpString += model[secStr][entry].Pollutant.padEnd(17, ' ');
            inpString += model[secStr][entry].Function.padEnd(11, ' ');
            inpString += model[secStr][entry].Coeff1.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].Coeff2.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].Coeff3.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].Normalizer.padEnd(11, ' ');
            inpString += '\n';
        }
        inpString += '\n';

        secStr = 'WASHOFF';
        inpString +='[WASHOFF]\n;;Land Use       Pollutant        Function   Coeff1     Coeff2     Ecleaning  Ebmp      \n;;-------------- ---------------- ---------- ---------- ---------- ---------- ----------\n'        
        for (let entry in model[secStr]) {
            inpString += model[secStr][entry].LandUse.padEnd(17, ' ');
            inpString += model[secStr][entry].Pollutant.padEnd(17, ' ');
            inpString += model[secStr][entry].Function.padEnd(11, ' ');
            inpString += model[secStr][entry].Coeff1.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].Coeff2.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].Ecleaning.toString().padEnd(11, ' ');
            inpString += model[secStr][entry].Ebmp.padEnd(11, ' ');
            inpString += '\n';
        }
        inpString += '\n';

        secStr = 'TIMESERIES';
        inpString +='[TIMESERIES]\n;;Time Series    Date       Time       Value     \n;;-------------- ---------- ---------- ----------\n'        
        for (let entry in model[secStr]) {
            inpString += model[secStr][entry].TimeSeries.padEnd(17, ' ');
            inpString += model[secStr][entry].Date.padEnd(11, ' ');
            inpString += model[secStr][entry].Time.padEnd(11, ' ');
            inpString += model[secStr][entry].Value.toString().padEnd(11, ' ');
            inpString += '\n';
        }
        inpString += '\n';

        secStr = 'REPORT';
        inpString +='[REPORT]\n;;Reporting Options\n'
        for (let entry in model[secStr]) {
            inpString += entry.padEnd(21, ' ');
            inpString += model[secStr][entry].Value;
            inpString += '\n';
        }
        inpString += '\n';

        secStr = 'TAGS';
        inpString +='[TAGS]\n'
        for (let entry in Object.values(model[secStr])) {
            inpString += model[secStr][entry].Type.padEnd(11, ' ');
            inpString += model[secStr][entry].ID.padEnd(17, ' ');
            inpString += model[secStr][entry].Tag;
            inpString += '\n';
        }
        inpString += '\n';

        secStr = 'MAP';
        inpString +='[MAP]\n'
        for (let entry in model[secStr]) {
            inpString += entry.padEnd(21, ' ');
            inpString += model[secStr][entry].Value;
            inpString += '\n';
        }
        inpString += '\n';

        secStr = 'COORDINATES';
        inpString +='[COORDINATES]\n;;Node           X-Coord            Y-Coord           \n;;-------------- ------------------ ------------------\n'        
        for (let entry in model[secStr]) {
            inpString += entry.padEnd(17, ' ');
            inpString += model[secStr][entry].x.toString().padEnd(19, ' ');
            inpString += model[secStr][entry].y.toString().padEnd(19, ' ');
            inpString += '\n';
        }
        inpString += '\n';

        secStr = 'VERTICES';
        inpString +='[VERTICES]\n;;Link           X-Coord            Y-Coord           \n;;-------------- ------------------ ------------------\n'        
        for (let entry in model[secStr]) {
            for (let point in model[secStr][entry]){
                inpString += entry.padEnd(17, ' ');
                inpString += model[secStr][entry][point].x.toString().padEnd(19, ' ');
                inpString += model[secStr][entry][point].y.toString().padEnd(19, ' ');
                inpString += '\n';
            }
        }
        inpString += '\n';

        secStr = 'Polygons';
        inpString +='[Polygons]\n;;Subcatchment   X-Coord            Y-Coord           \n;;-------------- ------------------ ------------------\n'        
        for (let entry in model[secStr]) {
            for (let point in model[secStr][entry]){
                inpString += entry.padEnd(17, ' ');
                inpString += model[secStr][entry][point].x.toString().padEnd(19, ' ');
                inpString += model[secStr][entry][point].y.toString().padEnd(19, ' ');
                inpString += '\n';
            }
        }
        inpString += '\n';

        secStr = 'Symbols';
        inpString +='[Symbols]\n;;Gage           X-Coord            Y-Coord           \n;;-------------- ------------------ ------------------\n'        
        for (let entry in model[secStr]) {
            inpString += entry.padEnd(17, ' ');
            inpString += model[secStr][entry].x.toString().padEnd(19, ' ');
            inpString += model[secStr][entry].y.toString().padEnd(19, ' ');
            inpString += '\n';
        }
        inpString += '\n';

        let fileOut = 'AutoInp.inp';
        let blob = new Blob([inpString], {type: 'text/csv'});
        if(window.navigator.msSaveOrOpenBlob){
            window.navigator.msSaveBlob(blob, fileOut);
        } else {
            let elem = window.document.createElement('a');
            elem.href = window.URL.createObjectURL(blob);
            elem.download = fileOut;
            document.body.appendChild(elem);
            elem.click();
            document.body.removeChild(elem);

            //window.URL.revokeObjectURL(elem.href);
        }
    }

	svg.render = function() {
	    var el = d3.select('#svgSimple').select('g'),
		    model = swmmjs.model,		
		    linksections = ['CONDUITS', 'PUMPS'],
		    step = $('#time').val(),
		    nodeResult = $('#nodeResult').val().toUpperCase(),
		    linkResult = $('#linkResult').val().toUpperCase();
	    svg.removeAll(el);
            if (!el._groups[0][0]) { 
                // nothing found 
                d3.select('#svgSimple').append('g');
                el = d3.select('#svgSimple').select('g');
            }

	    if ('object' !== typeof model.COORDINATES)
		return;
            
            var coords = d3.values(model.COORDINATES),
		    x = function(c) {
                return c.x
            },
		    y = function(c) {
                return c.y
            };
            svg.minx = d3.min(coords, x);
            svg.maxx = d3.max(coords, x);
            svg.miny = d3.min(coords, y);
            svg.maxy = d3.max(coords, y);
            
            if (!svg.minx || !svg.maxx || !svg.miny || !svg.maxy)
                return;
            
            var height = (svg.maxy - svg.miny),
                width = (svg.maxx - svg.minx),
                scale = width * 0.1;
            
            svg.strokeWidth = height / 200;
            svg.top = svg.maxy + scale;

            d3.select('#svgSimple').attr('viewBox', (svg.minx - scale) + ' ' + 0 + ' ' + (width + 2 * scale) + ' ' + (height + 2 * scale));
	    el.attr('viewBox', (svg.minx - scale) + ' ' + 0 + ' ' + (width + 2 * scale) + ' ' + (height + 2 * scale));

	    svg.nodeSize = height / 75,
	    el.append('circle')
		    .attr('cx', svg.minx + width / 2)
		    .attr('cy', svg.top - height / 2)
		    .attr('r', svg.nodeSize)
		    .attr('style', 'fill: black');
	    var c = d3.select('circle');
	    if (c && c[0] && c[0][0] && c[0][0].getBoundingClientRect)
	    {
		var r = c[0][0].getBoundingClientRect();
		if (r && r.height && r.width) {
		    svg.nodeSize = svg.nodeSize / r.height * 10;
		}
	    }
	    svg.removeAll(el);

        // Render polygons
        if (model.Polygons) {
            for (var polygon in model.Polygons) {
                var c = model.Polygons[polygon],			
                        color = swmmjs.defaultColor;
                var points = '';
                Object.keys(c).forEach(function(key) {
                    points += c[key].x + ' ' + (svg.top - c[key].y) + ' ';
                });
                el.append('g').attr('id',polygon).attr('class', 'polygon_ gpolygon').append('polygon')
                            .attr('points', points)
                            .attr('title', polygon)
                            .attr('onmouseover', 'swmmjs.svg.tooltip(evt.target)')
                            .attr('onmouseout', 'swmmjs.svg.clearTooltips(evt.target)')
                            .attr('class', 'polygon')
                            .attr('fill', 'transparent')
                            .attr("stroke-width", 7)
                            .attr("stroke", color);
            }
        }

	    // Render links
	    for (var section in linksections) {
            var s = linksections[section];
            if (model[s]) {
                for (var link in model[s]) {
                var l = model[s][link],
                    node1 = l.FromNode || false,
                    node2 = l.ToNode || false,
                    c1 = model.COORDINATES[node1] || false,
                    c2 = model.COORDINATES[node2] || false,
                    v = (swmmjs.results[step] ? ( swmmjs.results[step]['LINK'] ? (swmmjs.results[step]['LINK'][link] ? swmmjs.results[step]['LINK'][link][linkResult] : 0) : 0 ) : 0),
                    r = swmmjs.colors['LINKS'],
                    linkColors = swmmjs.svg.colors['LINKS'],
                    color = (swmmjs.INPUT === swmmjs.mode ? swmmjs.defaultColor: linkColors[r(v)]);
                
                if (c1 && c2) {
                    var centerx = (c1.x + c2.x) / 2,
                        centery = (c1.y + c2.y) / 2,
                        angle = 180 / Math.PI * Math.atan2(c1.y - c2.y, c2.x - c1.x),
                        transform = 'rotate(' + angle + ' ' + centerx + ' ' + (svg.top - centery) + ')';
                    if (model['VERTICES'][link]) {
                    // Render polylines  
                                    // Haven't checked this one yet :D
                    var v = model['VERTICES'][link],
                        d = 'M ' + c1.x + ' ' + (svg.top - c1.y);
                    for (var point in v) {
                        var p = v[point];
                        d = d + ' L ' + p.x + ' ' + (svg.top - p.y);
                    }
                    d = d + ' L ' + c2.x + ' ' + (svg.top - c2.y);
                    el.append('g').attr('id', link).attr('class', 'link_ gvertice').append('path')
                        .attr('stroke', color)
                        .attr('fill', 'none')
                        .attr('d', d)
                                            .attr('class', 'vertice')
                        .attr('stroke-width', svg.strokeWidth);

                    } 
                                if ('CONDUITS' === s) {
                    el.append('g').attr('id', link).attr('class', 'link_ gconduit').append('line')
                        .attr('x1', c1.x)
                        .attr('y1', svg.top - c1.y)
                        .attr('x2', c2.x)
                        .attr('y2', svg.top - c2.y)
                                            .attr('title', link)
                                            .on('mouseover', swmmjs.svg.tooltip)
                                            .on('mouseout', swmmjs.svg.clearTooltips)
                        .attr('stroke', color)
                                            .attr('class', 'conduit')
                        .attr('stroke-width', svg.strokeWidth);
                    } else if ('PUMPS' === s) {
                                    // line
                    el.append('g').attr('id',link).attr('class', 'link_ PUMP').append('line')
                        .attr('x1', c1.x)
                        .attr('y1', svg.top - c1.y)
                        .attr('x2', c2.x)
                        .attr('y2', svg.top - c2.y)
                                            .attr('title', link)
                                            .on('mouseover', swmmjs.svg.tooltip)
                                            .on('mouseout', swmmjs.svg.clearTooltips)
                        .attr('stroke', color)
                                            .attr('class', 'conduit')
                        .attr('stroke-width', svg.strokeWidth);
                                    // pump
                    el.append('g').attr('id',link).attr('class', 'link_ gpump1').append('circle')
                        .attr('cx', centerx)
                        .attr('cy', svg.top - centery)
                        .attr('r', svg.nodeSize)
                                            .attr('class', 'pump1')
                        .attr('style', 'fill:'+color+';');
                    el.append('g').attr('id',link).attr('class', 'link_ gpump2').append('rect')
                        .attr('width', svg.nodeSize * 1.5)
                        .attr('height', svg.nodeSize)
                        .attr('x', centerx)
                        .attr('y', svg.top - centery - svg.nodeSize)
                                            .attr('data-x', centerx)
                                            .attr('data-y', centery)
                        .attr('transform', transform)
                                            .attr('class', 'pump2')
                        .attr('style', 'fill:'+color+';');
                    }
                }
                }
            }
	    }
	    // Render nodes
	    for (var coordinate in model.COORDINATES)
	    {
		var c = model.COORDINATES[coordinate],			
			v = (swmmjs.results[step] ? (swmmjs.results[step]['NODE'] ? (swmmjs.results[step]['NODE'][coordinate] ? swmmjs.results[step]['NODE'][coordinate][nodeResult] : 0) : 0) : 0),
			r = swmmjs.colors['NODES'],
			nodeColors = swmmjs.svg.colors['NODES'],
			color = (swmmjs.INPUT === swmmjs.mode ? swmmjs.defaultColor: nodeColors[r(v)]);
		if (model.STORAGE[coordinate]) {
		    el.append('g').attr('id', coordinate).attr('class', 'node_ gstorage').append('rect')
			    .attr('width', svg.nodeSize * 2)
			    .attr('height', svg.nodeSize * 2)
			    .attr('x', c.x - svg.nodeSize)
			    .attr('y', svg.top - c.y - svg.nodeSize)
			    .attr('data-x', c.x)
			    .attr('data-y', svg.top - c.y)
                            .attr('data-y0', c.y)
			    .attr('title', coordinate)
			    .attr('onmouseover', 'swmmjs.svg.tooltip(evt.target)')
			    .attr('onmouseout', 'swmmjs.svg.clearTooltips(evt.target)')
                    .attr('class', 'storage')
			    .attr('fill', color);
		} else if (model.OUTFALLS[coordinate]) {
		    el.append('g').attr('id',coordinate).attr('class', 'node_ goutfall').append('polygon')
			    .attr('points', (c.x - svg.nodeSize) + ' ' + (svg.top - c.y - svg.nodeSize) + ' ' +
			    (c.x + svg.nodeSize) + ' ' + (svg.top - c.y - svg.nodeSize) + ' ' +
			    c.x + ' ' + (svg.top - c.y + svg.nodeSize))
			    .attr('title', coordinate)
			    .attr('data-x', c.x)
			    .attr('data-y', svg.top - c.y)
                            .attr('data-y0', c.y)
			    .attr('onmouseover', 'swmmjs.svg.tooltip(evt.target)')
			    .attr('onmouseout', 'swmmjs.svg.clearTooltips(evt.target)')
                    .attr('class', 'outfall')
			    .attr('fill', color);
		} else if (model.JUNCTIONS[coordinate])  {
		    el.append('g').attr('id',coordinate).attr('class', 'node_ gjunction').append('circle')
			    .attr('cx', c.x)
			    .attr('cy', svg.top - c.y)
			    .attr('r', svg.nodeSize)
			    .attr('data-x', c.x)
			    .attr('data-y', svg.top - c.y)
			    .attr('title', coordinate)
			    .attr('onmouseover', 'swmmjs.svg.tooltip(evt.target)')
			    .attr('onmouseout', 'swmmjs.svg.clearTooltips(evt.target)')
                    .attr('class', 'junction')
			    .attr('fill', color);
		}
	    }
        // Render Title
            if (model.TITLE){
                var c = model.TITLE[0];
            }
        // Render Options
            for (var Option in model['OPTIONS']) {
                var l = model['OPTIONS'][Option]
            }
        // Render Evaporation
            for (var Evaporation in model['EVAPORATION']) {
                var l = model['EVAPORATION'][Evaporation]
            }
        // Render Raingages
            for (var Raingage in model['RAINGAGES']) {
                var l = model['RAINGAGES'][Raingage]
            }
        
        // Render Infiltration
            for (var Subcatchment in model['INFILTRATION']) {
                var l = model['INFILTRATION'][Subcatchment]
            }
        // Render Outfalls
            for (var Outfall in model['OUTFALLS']) {
                var l = model['OUTFALLS'][Outfall]
            }
        // Render Pollutants
            for (var Pollutant in model['POLLUTANTS']) {
                var l = model['POLLUTANTS'][Pollutant]
            }
        // Render Landuses
        for (var Landuse in model['LANDUSES']) {
            var l = model['LANDUSES'][Landuse]
        }
        // Render Coverages
        for (var Coverage in model['COVERAGES']) {
            var l = model['COVERAGES'][Coverage]
        }
        // Render Loadings
        for (var Loading in model['LOADINGS']) {
            var l = model['LOADINGS'][Loading]
        }
        // Render Buildup
        for (var LandUse in model['BUILDUP']) {
            var l = model['BUILDUP'][LandUse]
        }
        // Render Washoff
        for (var LandUse in model['WASHOFF']) {
            var l = model['WASHOFF'][LandUse]
        }
        // Render Time Series
        for (var TimeSeries in model['TIMESERIES']) {
            var l = model['TIMESERIES'][TimeSeries]
        }
        // Render Reporting Options
        for (var Option in model['REPORT']) {
            var l = model['REPORT'][Option]
        }
        // Render Symbols
        for (var Gage in model['SYMBOLS']) {
            var l = model['SYMBOLS'][Gage]
        }
	    
	    // Render labels
	    for (var label in model['LABELS']) {
		var l = model['LABELS'][label],
			t = (l['label'] ? l['label'] : '');
                if (t !== '') {
                    el.append('g').append('text')
                            .attr('x', (l['x']?l['x']:0) - svg.nodeSize * t.length / 3)
                            .attr('y', svg.top - (l['y']?l['y']:0) + svg.nodeSize * 2)
                            .text(t)
			    .attr('data-x', l['x'])
			    .attr('data-y', l['y'])
			    .attr('data-label', t)
                            .attr('style', 'font-family: Verdana, Arial, sans; font-size:' + (svg.nodeSize * 2) + 'px;')
                            .attr('class', 'label')
                            .attr('fill', swmmjs.defaultColor);
                }
	    }
            
            var vis = d3.select('#svgSimple');

            // zoom behaviour
            var zoom = d3.zoom().scaleExtent([0.1, 50]);
            zoom.on('zoom', function() { swmmjs.currentScale = d3.event.transform.k; swmmjs.applyScale(svg); });
            vis.call(zoom);

            swmmjs.applyScale(svg);
            
            vis.on('mousemove', function() {
                swmmjs.currentPosition = [d3.event.pageX, d3.event.pageY]; // log the mouse x,y position
                var svgEl = document.getElementById('svgSimple');
                var pt = svgEl.createSVGPoint();
                pt.x = d3.event.pageX;
                pt.y = d3.event.pageY;
                var globalPoint = pt.matrixTransform(svgEl.getScreenCTM().inverse());
                document.getElementById('xy').innerHTML = 'X: ' + (pt.x) + ', Y: ' + (pt.y);
            });
	};
        
        return svg;
    };
    
    swmmjs.applyScale = function(svg) {
        var scaleFactor = 1;
        //vertice
        d3.select('#svgSimple > g').selectAll('.vertice').each(function() { 
            this.setAttribute('stroke-width', scaleFactor * svg.strokeWidth / swmmjs.currentScale );
        });
        //conduit
        d3.select('#svgSimple > g').selectAll('.conduit').each(function() { 
            this.setAttribute('stroke-width', scaleFactor * svg.strokeWidth / swmmjs.currentScale );
        });
        //junction
        d3.select('#svgSimple > g').selectAll('.junction').each(function() { 
            this.setAttribute('r', svg.nodeSize / swmmjs.currentScale );
        });
        //outfall
        d3.select('#svgSimple > g').selectAll('.outfall').each(function() { 
            this.setAttribute('points', (parseFloat(this.dataset.x) - 1.5 * scaleFactor * svg.nodeSize / swmmjs.currentScale) + ' ' + 
                                (parseFloat(svg.top) - parseFloat(this.dataset.y0) - 1.5 * scaleFactor * svg.nodeSize / swmmjs.currentScale) + ' ' +
                                (parseFloat(this.dataset.x) + 1.5 * scaleFactor * svg.nodeSize / swmmjs.currentScale) + ' ' + 
                                (parseFloat(svg.top) - parseFloat(this.dataset.y0) - 1.5 * scaleFactor * svg.nodeSize / swmmjs.currentScale) + ' ' +
                                parseFloat(this.dataset.x) + ' ' + 
                                (parseFloat(svg.top) - parseFloat(this.dataset.y0) + 1.5 * scaleFactor * svg.nodeSize / swmmjs.currentScale));
        });
        //storage
        d3.select('#svgSimple > g').selectAll('.storage').each(function() { 
            this.setAttribute('height', svg.nodeSize / swmmjs.currentScale * 2);
            this.setAttribute('width', svg.nodeSize / swmmjs.currentScale * 2);
            this.setAttribute('x', parseFloat(this.dataset.x) - svg.nodeSize / swmmjs.currentScale);
            this.setAttribute('y', svg.top - parseFloat(this.dataset.y0) - svg.nodeSize / swmmjs.currentScale);
        });
        //pump
        d3.select('#svgSimple > g').selectAll('.pump1').each(function() { 
            this.setAttribute('r', svg.nodeSize / swmmjs.currentScale );
        });
        d3.select('#svgSimple > g').selectAll('.pump2').each(function() { 
            this.setAttribute('width', svg.nodeSize / swmmjs.currentScale * 1.5);
            this.setAttribute('height', svg.nodeSize / swmmjs.currentScale );
            this.setAttribute('y', svg.top - parseFloat(this.dataset.y) - svg.nodeSize / swmmjs.currentScale);
        });
        //label
        d3.select('#svgSimple > g').selectAll('.label').each(function() { 
            this.setAttribute('x', (parseFloat(this.dataset.x)?parseFloat(this.dataset.x):0) - svg.nodeSize / swmmjs.currentScale * this.dataset.label.length / 3);
            this.setAttribute('y', svg.top - (parseFloat(this.dataset.y)?parseFloat(this.dataset.y):0) + svg.nodeSize / swmmjs.currentScale * 2);
            this.setAttribute('style', 'font-family: Verdana, Arial, sans; font-size:' + (svg.nodeSize / swmmjs.currentScale * 2) + 'px;')
        });
        if (d3.event) {
            d3.select('#svgSimple > g')
              .attr('transform', d3.event.transform);
        }
    };
    
    swmmjs.svg = swmmjs.svg();

    swmmjs.renderAnalysis = function(renderLegendInput) {	
	var renderLegend = renderLegendInput || swmmjs.renderLegend;
	
	if (!swmmjs.success)
	    swmmjs.renderInput();
	else {
	    var time = $('#time').val(),
		nodes = (swmmjs.results[time] ? swmmjs.results[time]['NODE'] : null),
		links = (swmmjs.results[time] ? swmmjs.results[time]['LINK'] : null),		
		nodeResult = $('#nodeResult').val().toUpperCase(),
		linkResult = $('#linkResult').val().toUpperCase();
        
	    if (swmmjs.INPUT === swmmjs.mode)
		swmmjs.mode = swmmjs.ANALYSIS;
            
	    swmmjs.colors['NODES'] = d3.scaleQuantile().range(d3.range(5));
	    swmmjs.colors['NODES'].domain(d3.values(nodes).map(function(n) {
		return n[nodeResult];
	    }));
	    swmmjs.colors['LINKS'] = d3.scaleQuantile().range(d3.range(5));
	    swmmjs.colors['LINKS'].domain(d3.values(links).map(function(n) {
		return n[linkResult];
	    }));
	    svg = swmmjs.svg;
            
            if (nodeResult === '') {
                swmmjs.mode = swmmjs.INPUT;
            }
            
	    svg.render();
	    d3.select('#legend ul').remove();
	    if(renderLegend) {
		var legend = d3.select('#legend'),
			ul = legend.append('ul').attr('class', 'list-group'),
			fmt = d3.format('0.3f'),
			elements = ['Nodes', 'Links'];
		for(var el in elements) {
                    try {
                        var	el = elements[el],
                                singular = el.substr(0, el.length - 1)
                                range = swmmjs.colors[el.toUpperCase()],			    
                                quantiles = range.quantiles(),
                                v = [fmt(d3.min(range.domain()))];
                        ul.append('li').text(singular+' '+$('#'+singular.toLowerCase()+'Result').val()).attr('class', 'list-group-item active');
                        for(var q in quantiles)
                        {
                           v[v.length] = fmt(quantiles[q]);
                        }
                        v[v.length] = fmt(d3.max(range.domain()));
                        for(var i = 1; i < v.length; i++)
                        {
                            var li = ul.append('li')			    
                                    .attr('class', 'list-group-item'),
                                value = (parseFloat(v[i-1]) + parseFloat(v[i]))/2;
                            li.append('span')
                                    .attr('style', 'background:'+swmmjs.svg.colors[el.toUpperCase()][range(value)])
                                    .attr('class', 'legendcolor')
                                    .text(' ');
                            li.append('span')
                                .text(' '+v[i-1]+' to '+v[i]);
                        }
                    } catch (e) {
                        console.log(e);
                    }
                }
	    }		
	}
    };

    swmmjs.renderInput = function() {
	    swmmjs.svg.render();
    };

    swmmjs.readBin = function(success) {
	    swmmjs.results = (success ? d3.swmmresult().parse('/report.bin') : false);
    };

    swmmjs.render = function() {
        if (swmmjs.INPUT === swmmjs.mode)
            swmmjs.renderInput();
        else
            swmmjs.renderAnalysis();
    };
    
    swmmjs.setSuccess = function(success) {
        var time = d3.select('#time');
        swmmjs.success = success;
        swmmjs.readBin(success);
        time.selectAll('option').remove();
        swmmjs.model = d3.inp().parse(document.getElementById('inpFile').value)
        
        if (swmmjs.results) {
            var reportTime = (swmmjs.model['OPTIONS'] ? new Date(swmmjs.model['OPTIONS']['REPORT_START_DATE']+swmmjs.model['OPTIONS']['REPORT_STEP']) : undefined);
                var reportTimestep = (reportTime ? reportTime.getHours()*60 + reportTime.getMinutes() : undefined);
            for (var t in swmmjs.results) {
            time.append('option')
                        .attr('value', t)
                        .text(swmmjs.formatDate(reportTime));
            reportTime = new Date(reportTime.setMinutes(reportTime.getMinutes() + reportTimestep));
            } 
        }
        swmmjs.render();

        /////////////////////////////////////////
        // Bind model values
        d3.inp().bindVals();

        /////////////////////////////////////////
    };

    swmmjs.formatDate = function(date) {
        return (date.getDate()<10 ? "0" : "") + date.getDate() + "." + ((date.getMonth() +1)<10 ? "0" : "") + (date.getMonth() +1) + "." + (date.getYear()+1900) + " " + (date.getHours()<10 ? "0" : "") + date.getHours() + ":" + (date.getMinutes()<10 ? "0" : "") + date.getMinutes(); 
    };
    
    swmmjs.unit = function(units, parameter) {
	var u = '';
	switch(parameter) {
	    case 'INVERT':
		switch(units)
		{
                    default:
			u = 'm';
			break;
		}
		break;
	    case 'MAXDEPTH':
		switch(units)
		{
		   default:
		       u = 'm';
		       break;
		}
		break;
	   case 'ROUGHNESS':
	       switch(units)
	       {
		   default:
		       u = '';
		       break;
	       }
	       break;
	   case 'SLOPE':
	       switch(units)
	       {
		   default:
		       u = '%';
		       break;
	       }
	       break;
	}
	return u;
    };

    //swmmjs.run = function(Module) {
    swmmjs.run = function() {
        FS.quit();
        Module.arguments = ['/input.inp', '/report.txt', '/report.bin'];
        Module.preRun = [function () {
                try
                {
                    FS.createPath('/', '/', true, true);
                    FS.ignorePermissions = true;
                    var inp = document.getElementById('inpFile').value;
                    var f = FS.findObject('input.inp');
                    if (f) {
                        FS.unlink('input.inp');
                    }
                    FS.createDataFile('/', 'input.inp', inp, true, true);
                } catch (e) {
                    console.log('/input.inp creation failed');
                }
            }];
        Module.postRun = [function () {
                try {
                    swmmjs.renderAnalysis();
                    var rpt = Module.intArrayToString(FS.findObject('/report.txt').contents);
                    document.getElementById('rptFile').innerHTML = rpt;
                    Module['calledRun'] = false;
                } catch (e) {
                    console.log(e);
                }
            }];
        Module.print = (function () {
            var element = document.getElementById('output');
            if (element)
                element.value = ''; // clear browser cache
            return function (text) {
                if (arguments.length > 1)
                    text = Array.prototype.slice.call(arguments).join(' ');
                console.log(text);
                if (element) {
                    element.value += text + "\n";
                    element.scrollTop = element.scrollHeight; // focus on bottom
                }
            };
        })();
        Module.printErr = function (text) {
            if (arguments.length > 1)
                text = Array.prototype.slice.call(arguments).join(' ');
            console.error(text);
        };
        /*Module.canvas = (function () {
            var canvas = document.getElementById('canvas');

            // As a default initial behavior, pop up an alert when webgl context is lost. To make your
            // application robust, you may want to override this behavior before shipping!
            // See http://www.khronos.org/registry/webgl/specs/latest/1.0/#5.15.2
            canvas.addEventListener("webglcontextlost", function (e) {
                alert('WebGL context lost. You will need to reload the page.');
                e.preventDefault();
            }, false);

            return canvas;
        })();*/
        Module.setStatus = function (text) {
            var statusElement = document.getElementById('status');

            var progressElement = document.getElementById('progress');
            if (!Module.setStatus.last)
                Module.setStatus.last = {time: Date.now(), text: ''};
            if (text === Module.setStatus.last.text) {
                return;
            }
            var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
            var now = Date.now();
            if (m && now - Module.setStatus.last.time < 30)
                return; // if this is a progress update, skip it if too soon
            Module.setStatus.last.time = now;
            Module.setStatus.last.text = text;
            if (m) {
                text = m[1];
                progressElement.value = parseInt(m[2]) * 100;
                progressElement.max = parseInt(m[4]) * 100;
                progressElement.hidden = false;
            } else {
                progressElement.value = null;
                progressElement.max = null;
                progressElement.hidden = true;
            }
            statusElement.innerHTML = text;
            if (text === "") {
                swmmjs.setSuccess(true);
                exitRuntime();
                console.log(JSON.stringify(swmmjs.results));
            } 
        };
        Module.totalDependencies = 0;
        Module.monitorRunDependencies = function (left) {
            this.totalDependencies = Math.max(this.totalDependencies, left);
            Module.setStatus(left ? 'Preparing... (' + (this.totalDependencies - left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
        };

        Module.setStatus('Downloading...');
        window.onerror = function (event) {
            // TODO: do not warn on ok events like simulating an infinite loop or exitStatus
            Module.setStatus('Exception thrown, see JavaScript console');
            Module.setStatus = function (text) {
                if (text)
                    Module.printErr('[post-exception status] ' + text);
            };
        };

        Module['calledRun'] = false;
        Module['run']();
    };

    return swmmjs;
};

swmmjs = swmmjs();


