// When the document is loaded:
// Create some data
// Draw a line chart with the data.
document.addEventListener("DOMContentLoaded", function(){
    // Personalization variables.
    let fileName = null;
    let authorName = null;
    let description = null;

    /////////////////////////////////////////////
    // Modal controls.
    /////////////////////////////////////////////
    // Get the modal
    let modal = document.getElementById("myModal");

    // Get the <span> element that closes the modal
    let span = document.getElementsByClassName("close")[0];

    
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

    /////////////////////////////////////////////
    // Project Tree controls.
    /////////////////////////////////////////////

    // Clicking on the Title/Notes li in the Project tree opens a text dialog.
    let pmTitle = document.getElementById("pmTitle");

    pmTitle.onclick = (e)=>{
        modal.style.display = 'block';
        document.getElementById('testid').innerText = this.id; 

        //;;Junction       Invert     Dmax       Dinit      Dsurch     Aponded 
        hideOrShow('modallabel', 'block');

        document.getElementById('modallabel01').innerText = 'Title'; 

        hideOrShow('modaledit', 'block');

        document.getElementById('modaledit01').value = swmmjs.model.TITLE[0]['TitleNotes'];

        document.getElementById('modaledit01').onkeyup = ()=>{
            swmmjs.model.TITLE[0]['TitleNotes'] = document.getElementById('modaledit01').value;
        }
    }

    // Setting up to process input file.
    Module.onRuntimeInitialized = _ => {
        // Process the metadata file
        // Load info.json into an object
        fetch('data/info.json')
            .then(response => response.json())
            .then((info) => {
                // For every item in mainpages.json, create a carousel-item
                authorName = info[0].Name;
                fileName = info[0].FileName;
                description = info[0].Description;

                //processInput('data/' + fileName);
            })
    }

    // Listen for requests to open an .inp file.
    const inputElement = document.getElementById("input");
    inputElement.addEventListener('change', handleFiles, false);
    function handleFiles() {
        const fileList = this.files;

        let fr = new FileReader();
        fr.onload=function(){
            processInput(fr.result)
        }

        fr.readAsText(fileList[0]);
        x = swmmjs.model;
    }

    // Listen for requests to save an .inp file.
    const saveElement = document.getElementById("save");
    saveElement.addEventListener('click', saveFile, false);
    function saveFile() {
        swmmjs.svg.save();
    }
})

// Read the input file (text). 
// Parse the data into memory. 
// Run the model.

function processInput(inpText){
    try
    {
        document.getElementById('inpFile').value = inpText;
        swmmjs.run();
    } catch (e) {
        console.log('/input.inp creation failed');
    }
}

// Project tree display controls
let toggler = document.getElementsByClassName('caret');
let iter;

for (iter = 0; iter < toggler.length; iter++){
    toggler[iter].addEventListener('click', function(){
        this.parentElement.querySelector('.nested')
            .classList.toggle('active');
        this.classList.toggle('active');
        //this.querySelector('.nested')
        //    .classList.toggle('active');
        this.classList.toggle('caret-down');
    })
}


