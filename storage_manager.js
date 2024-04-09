document.addEventListener('DOMContentLoaded', function () {
    let jsonFileInput = document.getElementById('jsonFileInput');
    let jsonFileInputLabel = document.getElementById('fileInputLabel');
    const resetJsonFileButton = document.getElementById('resetJsonFileInput');


    read_record('UiCoverageDB', 'jsonFileName', function (selectedFileName) {
        if (selectedFileName) {
            // jsonFileInput.title = selectedFileName.name;
            jsonFileInputLabel.textContent = selectedFileName.name;
        } else {
            jsonFileInputLabel.textContent = 'No File Selected';
        }
    });

    // Event listener for changes in the jsonFileInput element
    jsonFileInput.addEventListener('change', function (event) {
        let selectedFile = event.target.files[0]; // Get the selected file
        let reader = new FileReader();

        reader.onload = function (event) {
            // Event handler for when the file reading is completed
            let fileContent = event.target.result; // Get the file content from the reader

            try {
                let jsonData = JSON.parse(fileContent);

                // Save jsonFileContent to Chrome IndexedDB
                insert_record("UiCoverageDB", "jsonFileContent", jsonData);
                insert_record("UiCoverageDB", "jsonFileName", {"name": selectedFile.name})
                console.log('Selected file is saved to IndexedDB.' + selectedFile.name);
                jsonFileInputLabel.textContent = selectedFile.name; // Update the label
            } catch (error) {
                alert('Error parsing JSON file: ' + error.message);
            }
        };
        reader.readAsText(selectedFile);
    });

    // Event listener for "resetJsonFileButton" click event
    resetJsonFileButton.addEventListener('click', function () {
        clearObjectStore('UiCoverageDB', 'jsonFileContent');
        clearObjectStore('UiCoverageDB', 'jsonFileName');
        jsonFileInputLabel.textContent = 'No File Selected'; // Update the label
        console.log('Selected file is cleared.');
    });

});