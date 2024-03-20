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
            // Підсвічуємо елементи і додаємо обробник подій для підсвічених елементів
            locators.forEach(function (xpath) {
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
            element = elements.iterateNext();
        }
    }

});
