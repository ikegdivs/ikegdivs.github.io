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

    // Listen for requests to run the simulation.
    const runElement = document.getElementById("nav-project-runsimulation");
    runElement.addEventListener('click', runSimulation, false);
    function runSimulation() {
        processInput(document.getElementById('inpFile').value);
    }

    // Listen for requests to open an .inp file.
    const inputElement = document.getElementById("nav-file-input");
    inputElement.addEventListener('change', handleFiles, false);
    function handleFiles() {
        const fileList = this.files;

        let fr = new FileReader();
        fr.onload=function(){
            if(fr.result){inpText = 
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
        swmmjs.loadModel(swmmjs.Module)
        //swmmjs.run(swmmjs.Module);
    } catch (e) {
        console.log('/input.inp creation failed');
    }
}


