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
                callback(null); // Pass null to the callback function if no records are found
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