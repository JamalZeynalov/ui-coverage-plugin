document.addEventListener('DOMContentLoaded', function () {
    var jsonFileInput = document.getElementById('jsonFileInput');
    var checkButton = document.getElementById('checkButton');

    var selectedFile = null;

    jsonFileInput.addEventListener('change', function (event) {
        selectedFile = event.target.files[0];
    });

    checkButton.addEventListener('click', function () {
        if (!selectedFile) {
            alert('Please select a JSON file.');
            return;
        }

        var reader = new FileReader();
        reader.onload = function (event) {
            try {
                var jsonData = JSON.parse(event.target.result);
                highlightElements(jsonData);
            } catch (error) {
                alert('Error parsing JSON file: ' + error.message);
            }
        };

        reader.readAsText(selectedFile);
    });

    function highlightElements(jsonData) {
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
                    args: [xpath]
                });
            });
        });
    }

    // Function to highlight elements on the page based on XPath
    function highlightElementsInTab(xpath) {
        var elements = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
        var element = elements.iterateNext();
        while (element) {
            element.style.backgroundColor = 'green';
            element.setAttribute('data-highlighted', 'true');

            // Add click event listener to each highlighted element
            element.addEventListener('click', function (event) {
                var sidebarWidth = 20; // Adjust as needed
                var sidebar = document.createElement('div');
                sidebar.style.position = 'fixed';
                sidebar.style.top = '0';
                sidebar.style.right = '0';
                sidebar.style.width = sidebarWidth + '%';
                sidebar.style.height = '100%';
                sidebar.style.backgroundColor = 'yellow'; // Customize as needed
                sidebar.style.zIndex = '9999'; // Ensure it appears above other content
                sidebar.style.transition = 'right 0.5s ease'; // Add transition effect

                var sidebarURL = chrome.runtime.getURL('sidebar.html') + '?xpath=' + encodeURIComponent(xpath);

                // Load content from sidebar.html
                fetch(sidebarURL)
                    .then(response => response.text())
                    .then(data => {
                        sidebar.innerHTML = data;
                    })
                    .catch(error => {
                        console.error('Error loading sidebar content:', error);
                    });

                document.body.appendChild(sidebar);

                // Animate sidebar opening
                setTimeout(function () {
                    sidebar.style.right = '0';
                }, 100);
            });

            element = elements.iterateNext();
        }
    }

});
