// When the document is loaded:
// Create some data
// Draw a line chart with the data.
document.addEventListener("DOMContentLoaded", function(){
    // Personalization variables.
    let fileName = null;
    let authorName = null;
    let description = null;

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


