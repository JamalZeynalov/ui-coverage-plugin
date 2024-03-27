function openSidebar(baseUrl, xpath, testCasesIds) {
    // close if already open
    var sidebarFrame = window.document.getElementById('sidebarFrame');
    if (sidebarFrame) {
        sidebarFrame.parentNode.removeChild(sidebarFrame);
    }

    // Create a new iframe element
    var iframe = document.createElement('iframe');
    iframe.setAttribute('id', 'sidebarFrame');
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.right = '0';
    iframe.style.width = '600px';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.zIndex = '9999'; // Ensure the sidebar is displayed above all other content
    iframe.style.backgroundColor = 'rgb(255,255,255)';
    iframe.style.overflowX = 'hidden';
    iframe.style.transition = 'right 0.5s ease'; // Add transition effect
    iframe.style.fontSize = '20px';

    var sidebarUrl = chrome.runtime.getURL('sidebar.html') + '?baseUrl=' + encodeURIComponent(baseUrl) + '&xpath=' + encodeURIComponent(xpath) + '&testCasesIds=' + encodeURIComponent(testCasesIds);

    iframe.setAttribute('src', sidebarUrl); // Use chrome.runtime.getURL to get the correct path
    document.body.appendChild(iframe);
}

document.addEventListener('DOMContentLoaded', function () {
    const jsonFileInput = document.getElementById('jsonFileInput');
    const jsonFileInputLabel = document.getElementById('fileInputLabel');
    const resetJsonFileInput = document.getElementById('resetJsonFileInput');
    const checkButton = document.getElementById('checkButton');
    const baseUrl = localStorage.getItem('baseUrl');
    const allureLoginButton = document.getElementById('allureLoginButton');

    var selectedFileName = localStorage.getItem('jsonFileName');
    if (selectedFileName) {
        jsonFileInput.title = selectedFileName;
        jsonFileInputLabel.textContent = selectedFileName;
    } else {
        jsonFileInputLabel.textContent = 'No file selected';
    }

    // Event listener for "jsonFileInput" change event
    jsonFileInput.addEventListener('change', function (event) {
        jsonFileInputLabel.textContent = localStorage.getItem('jsonFileName');
    });

    allureLoginButton.addEventListener('click', function () {
        chrome.tabs.create({url: baseUrl});
    });

    // Event listener for changes in the jsonFileInput element
    jsonFileInput.addEventListener('change', function (event) {
        var selectedFile = event.target.files[0]; // Get the selected file
        var reader = new FileReader();

        reader.onload = function (event) {
            // Event handler for when the file reading is completed
            var fileContent = event.target.result; // Get the file content from the reader
            localStorage.setItem('jsonFileName', selectedFile.name);
            localStorage.setItem('jsonFileContent', fileContent);
            jsonFileInputLabel.textContent = selectedFile.name; // Update the label
        };

        reader.readAsText(selectedFile);
        console.log('File content stored in localStorage:', localStorage.getItem('jsonFileContent'));
    });

    // Event listener for "resetJsonFileInput" click event
    resetJsonFileInput.addEventListener('click', function () {
        localStorage.removeItem('jsonFileName'); // Remove stored file name
        localStorage.removeItem('jsonFileContent'); // Remove stored file content
        jsonFileInputLabel.textContent = 'No file selected'; // Update the label
        console.log('Selected file cleared.');
    });

    checkButton.addEventListener('click', function () {
        var selectedFileContent = {}
        if (!localStorage.getItem('jsonFileName')) {
            alert('Please select a JSON file!' + localStorage.getItem('jsonFileContent'));
            return;
        } else {
            selectedFileContent = localStorage.getItem('jsonFileContent');
        }
        try {
            var jsonData = JSON.parse(selectedFileContent);
            highlightElements(jsonData, baseUrl);
        } catch (error) {
            alert('Error parsing JSON file: ' + error.message);
        }
    });

    function highlightElements(jsonData, baseUrl) {
        // Get information about the currently active tab
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            // Extract the URL of the active tab
            var currentURL = tabs[0].url;

            // Retrieve the list of locators for the current URL from the JSON data
            var locators = jsonData[currentURL];

            // Check if locators exist for the current URL
            if (!locators) {
                var fileContents = JSON.stringify(jsonData, null, 2);
                alert('No locators found for the current URL.' + '\n\nLoaded file content:\n' + fileContents + '\n\nCurrent URL: ' + currentURL);
                return;
            }

            // Iterate over each XPath and its associated array of objects
            for (var xpath in locators) {
                var casesInfo = locators[xpath];
                var caseIds = [];

                // Iterate over each object in the array
                casesInfo.forEach(function (object) {
                    // Get the allure_id property from the object and add it to the idList array
                    caseIds.push(object.allure_id);
                });
                // Iterate over each object in the array
                chrome.scripting.executeScript({
                    target: {tabId: tabs[0].id},
                    function: highlightElementsInTab,
                    args: [baseUrl, xpath, caseIds]
                });
            }

        });
    }

    // Function to highlight elements on the page based on XPath
    function highlightElementsInTab(baseUrl, xpath, caseIds) {
        var elements = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
        var element = elements.iterateNext();

        while (element) {
            element.style.backgroundColor = 'green';
            element.setAttribute('data-highlighted', 'true');
            element.removeAttribute("href");

            // Add click event listener to each highlighted element
            element.addEventListener('click', function (event) {
                openSidebar(baseUrl, xpath, caseIds);
            });
            element = elements.iterateNext();
        }
    }
});
