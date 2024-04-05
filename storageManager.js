function insert_record(dbName, storeName, recordData) {
    let request = indexedDB.open(dbName, 1);

    request.onsuccess = function (event) {
        let db = event.target.result;
        // Perform data insertion within a transaction
        let transaction = db.transaction([storeName], 'readwrite');
        let store = transaction.objectStore(storeName);

        transaction.oncomplete = function (event) {
            console.log('Data added successfully.');
        };

        transaction.onerror = function (event) {
            console.log('Error adding data: ' + event.target.error);
        };

        store.put(recordData);
    };

    request.onerror = function (event) {
        console.log('Error opening database: ' + event.target.error);
    };
}


function read_record(dbName, storeName, callback) {
    let request = indexedDB.open(dbName, 1);
    request.onsuccess = function (event) {
        let db = event.target.result;
        let transaction = db.transaction([storeName], 'readonly');
        let store = transaction.objectStore(storeName);

        // Create a cursor to iterate through the records in reverse order
        let cursorRequest = store.openCursor(null, 'prev');

        cursorRequest.onsuccess = function (event) {
            let cursor = event.target.result;
            if (cursor) {
                // Cursor points to the latest record, so you can access its value
                let latestRecord = cursor.value;
                console.log('Latest record:', latestRecord);
                callback(latestRecord); // Pass the data to the callback function
            } else {
                console.log('No records found in the store.');
            }
        };

        cursorRequest.onerror = function (event) {
            console.error('Error reading records:', event.target.error);
            callback(null); // Pass null to the callback function in case of error
        };
    };

    request.onerror = function (event) {
        console.error('Error opening database:', event.target.error);
        callback(null); // Pass null to the callback function in case of error
    };
}

// Function to clear the object store
function clearObjectStore(dbName, storeName) {
    let request = indexedDB.open(dbName, 1);

    request.onsuccess = function (event) {
        let db = event.target.result;
        let transaction = db.transaction([storeName], 'readwrite');
        let store = transaction.objectStore(storeName);

        let clearRequest = store.clear();
        clearRequest.onsuccess = function (event) {
            console.log('Object store cleared successfully.');
        };
        clearRequest.onerror = function (event) {
            console.error('Error clearing object store:', event.target.error);
        };
    };

    request.onerror = function (event) {
        console.error('Error opening database:', event.target.error);
    };
}


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