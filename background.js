function createIndexedDB(dbName, storeNames) {
    let request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = function (event) {
        let db = event.target.result;
        storeNames.forEach(function (storeName) {
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, {keyPath: 'id', autoIncrement: true});
                console.log('Object store "' + storeName + '" is created successfully.');
            }
        });
    };

    request.onsuccess = function (event) {
        let db = event.target.result;
        db.close(); // Close the database after upgrade transaction (if any)
    };

    request.onerror = function (event) {
        console.log('Error opening database: ' + event.target.error);
    };
}

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
        let db = event.target.result; // Correctly access the database object

        // continue working with database using db object
        var transaction = db.transaction([storeName], 'readonly');
        var store = transaction.objectStore(storeName);
        var getData = store.get(1);

        getData.onsuccess = function (event) {
            var data = event.target.result;
            console.log("Data read successfully: ", data);
            callback(data); // Pass the data to the callback function
        };

        getData.onerror = function (event) {
            console.log("Error reading data: " + event.target.error);
            callback(null); // Pass null to the callback function in case of error
        };
    };

    request.onerror = function (event) {
        console.log("Error opening database: " + event.target.error);
        callback(null); // Pass null to the callback function in case of error
    };
}

// "UiCoverageDB"

// var data = {id: 1, name: 'John Doe', age: 32};

createIndexedDB("UiCoverageDB", ["jsonFileContent", "jsonFileName"]);

// insert_record("UiCoverageDB", "jsonData", data)
// insert_record("UiCoverageDB", "jsonFileName", {"name": "null"})
//
// read_record('UiCoverageDB', 'jsonData', function (data) {
//     // Handle the retrieved data here
//     console.log('Retrieved data:', data);
// });
//
// read_record('UiCoverageDB', 'jsonFileName', function (jsonFileName) {
//     // Handle the retrieved data here
//     console.log('Retrieved jsonFileName:', jsonFileName);
// });
