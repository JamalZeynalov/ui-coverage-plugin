function openSidebar(xpath, baseUrl) {
    alert('openSidebar function called. ' + xpath + baseUrl);
    var sidebarWidth = 20; // Adjust as needed
    var sidebar = document.querySelector('.sidebar');

    // Check if the sidebar already exists
    if (!sidebar) {
        // If sidebar doesn't exist, create a new one
        sidebar = document.createElement('div');
        sidebar.classList.add('sidebar');
        sidebar.style.position = 'fixed';
        sidebar.style.top = '0';
        sidebar.style.right = '0';
        sidebar.style.width = sidebarWidth + '%';
        sidebar.style.height = '100%';
        sidebar.style.backgroundColor = '#f0f0f0'; // Customize as needed
        sidebar.style.overflowX = 'hidden';
        sidebar.style.transition = 'right 0.5s ease'; // Add transition effect
        sidebar.style.paddingTop = '60px';
        sidebar.style.zIndex = '9999'; // Ensure it appears above other content

        // Create and append the sidebar content
        var sidebarContent = document.createElement('div');
        sidebarContent.classList.add('sidebar-content');
        sidebar.appendChild(sidebarContent);

        document.body.appendChild(sidebar);
        // Animate sidebar opening
        setTimeout(function () {
            sidebar.style.right = '0';
        }, 100);
    }

    // Update the content of the sidebar with the new 'xpath' value and baseUrl
    updateSidebarContent(xpath, baseUrl);
}

function updateSidebarContent(xpath, baseUrl) {
    var sidebarContent = document.querySelector('.sidebar-content');
    if (sidebarContent) {
        // Update the content of the sidebar with the new 'xpath' value and baseUrl
        sidebarContent.innerHTML = '' +
            '<h2>Sidebar Content</h2><ul><li><a target="_blank" href="' + baseUrl + '">' + baseUrl + '</a></li></ul>' +
            '';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    var jsonFileInput = document.getElementById('jsonFileInput');
    var jsonFileInputLabel = document.getElementById('fileInputLabel');
    var resetJsonFileInput = document.getElementById('resetJsonFileInput');
    var checkButton = document.getElementById('checkButton');
    var baseUrl = localStorage.getItem('baseUrl') + '/testcase/9596';

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
        if (!selectedFileName) {
            alert('Please select a JSON file!' + localStorage.getItem('jsonFileContent'));
            return;
        } else {
            selectedFileContent = localStorage.getItem('jsonFileContent');
        }
        alert('highlightElements function called.' + selectedFileContent);
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
                alert('No locators found for the current URL.' +
                    '\n\nLoaded file content:\n' + fileContents +
                    '\n\nCurrent URL: ' + currentURL);
                return;
            }

            // Iterate through each locator and highlight the corresponding elements
            locators.forEach(function (xpath) {
                // Execute script in the context of the active tab to highlight elements
                chrome.scripting.executeScript({
                    target: {tabId: tabs[0].id},
                    function: highlightElementsInTab,
                    args: [xpath, baseUrl]
                });
            });
        });
    }

    // Function to highlight elements on the page based on XPath
    function highlightElementsInTab(xpath, baseUrl) {
        var elements = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
        var element = elements.iterateNext();
        while (element) {
            element.style.backgroundColor = 'green';
            element.setAttribute('data-highlighted', 'true');

            // Add click event listener to each highlighted element
            element.addEventListener('click', function (event) {
                openSidebar(xpath, baseUrl);
            });
            element = elements.iterateNext();
        }
    }

});
