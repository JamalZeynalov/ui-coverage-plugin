function createIndexedDB(dbName, storeNames) {
    // Open (or create) the database
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

/*
    * Create an IndexedDB database with the name "UiCoverageDB" and two object stores:
    * 1. jsonFileContent
    * 2. jsonFileName
 */
createIndexedDB("UiCoverageDB", ["jsonFileContent", "jsonFileName"]);
