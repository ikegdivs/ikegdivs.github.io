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
    $('.modal-backdrop').remove();
    

    /////////////////////////////////////////////
    // Project Tree controls.
    /////////////////////////////////////////////

    // Alter display property of a group of elements.
    function hideOrShow(classDesc, displayType){
        items = document.getElementsByClassName(classDesc);
        Array.from(items).forEach(item => {
            item.style.display = displayType;
            item.value = '';
        })
    }

    // Clicking on the Title/Notes li in the Project tree opens a text dialog.
    /*let pmTitle = document.getElementById("pmTitle");

    pmTitle.onclick = (e)=>{
        // Make the edit texts disappear
        hideOrShow('modaledit', 'none');
        // Make the labels disappear.
        hideOrShow('modallabel', 'none');

        
        document.getElementById('modallabel01').style.display = 'block'; 
        document.getElementById('modaledit01').style.display = 'block';

        document.getElementById('testid').innerText = this.id; 

        document.getElementById('modallabel01').innerText = 'Title'; 
        document.getElementById('modaledit01').value = swmmjs.model.TITLE[0]['TitleNotes'];

        document.getElementById('modaledit01').onkeyup = ()=>{
            swmmjs.model.TITLE[0]['TitleNotes'] = document.getElementById('modaledit01').value;
        }
    }*/

    // Clicking Options li in the Project tree opens a text dialog.
    let pmOptions = document.getElementById('pmOptions');

    pmOptions.onclick = (e)=>{
        // Make the edit texts disappear
        hideOrShow('modaledit', 'none');
        // Make the labels disappear.
        hideOrShow('modallabel', 'none');

        
        document.getElementById('modallabel01').style.display = 'block'; 
        document.getElementById('modaledit01').style.display = 'block';

        document.getElementById('testid').innerText = this.id; 

        document.getElementById('modallabel01').innerText = 'Title'; 
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
                authorName = info[0].Name;
                fileName = info[0].FileName;
                description = info[0].Description;
            })
    }

    // Listen for requests to open the default file.
    const demoElement = document.getElementById("nav-file-demo");
    demoElement.addEventListener('click', loadDemo, false);
    function loadDemo() {
        jQuery.get('./data/Mod.inp', function(contents){
            processInput(contents);
        })
    }

    // Listen for requests to open an .inp file.
    const inputElement = document.getElementById("nav-file-input");
    inputElement.addEventListener('change', handleFiles, false);
    function handleFiles() {
        const fileList = this.files;

        let fr = new FileReader();
        fr.onload=function(){
            if(fr.result){
                processInput(fr.result)
            }
        }

        fr.readAsText(fileList[0]);
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


