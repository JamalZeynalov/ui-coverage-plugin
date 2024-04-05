function openSidebar(baseUrl, xpath = null) {
    // close if already open
    let sidebarFrame = window.document.getElementById('sidebarFrame');
    if (sidebarFrame) {
        sidebarFrame.parentNode.removeChild(sidebarFrame);
    }

    // Create a new iframe element
    let iframe = document.createElement('iframe');
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

    let url = encodeURIComponent(baseUrl);
    let xpathEncoded = encodeURIComponent(xpath);

    let sidebarUrl = chrome.runtime.getURL('sidebar.html') + '?baseUrl=' + url + '&xpath=' + xpathEncoded;

    iframe.setAttribute('src', sidebarUrl); // Use chrome.runtime.getURL to get the correct path
    document.body.appendChild(iframe);
}

function showTooltip(targetElement, text) {
    let tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.innerHTML = text;
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = 'black';
    tooltip.style.color = 'white';
    tooltip.style.padding = '5px';
    tooltip.style.borderRadius = '5px';
    tooltip.style.zIndex = '9999';
    tooltip.style.top = targetElement.clientY + 'px';
    tooltip.style.left = targetElement.clientX + 'px';
    document.body.appendChild(tooltip);
}

document.addEventListener('DOMContentLoaded', function () {
    // let jsonFileInput = document.getElementById('jsonFileInput');
    // let jsonFileInputLabel = document.getElementById('fileInputLabel');
    // const resetJsonFileButton = document.getElementById('resetJsonFileInput');
    const checkButton = document.getElementById('checkButton');
    const showAllButton = document.getElementById('showAllButton');

    const baseUrl = localStorage.getItem('baseUrl');


    // let selectedFileName = localStorage.getItem('jsonFileName');
    // if (selectedFileName) {
    //     jsonFileInput.title = selectedFileName;
    //     jsonFileInputLabel.textContent = selectedFileName;
    // } else {
    //     jsonFileInputLabel.textContent = 'No file selected';
    // }

    // Event listener for "jsonFileInput" change event
    // jsonFileInput.addEventListener('change', function (event) {
    //     jsonFileInputLabel.textContent = localStorage.getItem('jsonFileName');
    // });

    // // Event listener for changes in the jsonFileInput element
    // jsonFileInput.addEventListener('change', function (event) {
    //     let selectedFile = event.target.files[0]; // Get the selected file
    //     let reader = new FileReader();
    //
    //     reader.onload = function (event) {
    //         // Event handler for when the file reading is completed
    //         let fileContent = event.target.result; // Get the file content from the reader
    //         // Save jsonFileContent to Chrome Extension Storage
    //         // localStorage.setItem('jsonFileName', selectedFile.name);
    //         // chrome.storage.local.set({'jsonFileContent': fileContent}, function () {
    //         //     console.log('fileContent is saved to Chrome Extension Storage');
    //         // });
    //
    //         jsonFileInputLabel.textContent = selectedFile.name; // Update the label
    //     };
    //
    //     reader.readAsText(selectedFile);
    // });

    // Add click event listener to each highlighted element
    showAllButton.addEventListener('click', function (event) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            // Extract the URL of the active tab
            chrome.scripting.executeScript({
                target: {tabId: tabs[0].id}, function: openSidebar, args: [baseUrl]
            });
        });
    });

    // // Event listener for "resetJsonFileButton" click event
    // resetJsonFileButton.addEventListener('click', function () {
    //     localStorage.removeItem('jsonFileName'); // Remove stored file name
    //     localStorage.removeItem('jsonFileContent'); // Remove stored file content
    //     jsonFileInputLabel.textContent = 'No file selected'; // Update the label
    //     console.log('Selected file cleared.');
    // });


    read_record('UiCoverageDB', 'jsonFileContent', function (jsonFileContent) {
        read_record('UiCoverageDB', 'jsonFileName', function (jsonFileName) {

            checkButton.addEventListener('click', function () {
                let selectedFileContent = {}
                if (!jsonFileName) {
                    alert('Please select a JSON file!' + JSON.stringify(jsonFileContent));
                    return;
                } else {
                    selectedFileContent = jsonFileContent;
                }
                highlightElements(selectedFileContent, baseUrl);
            });


            function highlightElements(jsonData, baseUrl) {
                // Get information about the currently active tab
                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                    // Extract the URL of the active tab
                    // Extract the URL of the active tab
                    let parsedUrl = new URL(tabs[0].url);
                    let path = parsedUrl.pathname.replace(/\d+/g, 'X')

                    if (path.includes('#')) {
                        path = path.split('#').slice(0, -1).join('');
                    }

                    // Remove trailing slash if it exists
                    if (path.endsWith('/')) {
                        path = path.slice(0, -1);
                    }
                    let pageUrl = parsedUrl.origin + path;

                    // Retrieve the list of locators for the current URL from the JSON data
                    let locators = jsonData[pageUrl];

                    // Check if locators exist for the current URL
                    if (!locators) {
                        let URLs = Object.keys(jsonData).join('\n');
                        alert('No locators found for the current URL: ' + pageUrl + '\nCovered pages:\n' + URLs);
                        return;
                    }
                    // Iterate over each XPath and its associated array of objects
                    for (let xpath in locators) {
                        // Iterate over each object in the array
                        chrome.scripting.executeScript({
                            target: {tabId: tabs[0].id},
                            function: highlightElementsInTab,
                            args: [jsonFileContent, baseUrl, pageUrl, xpath]
                        });
                    }
                });
            }

            // Function to highlight elements on the page based on XPath
            function highlightElementsInTab(jsonFileContent, baseUrl, pageUrl, xpath) {
                let isBlock = jsonFileContent[pageUrl][xpath][0]['is_block'];
                let originalXpath = jsonFileContent[pageUrl][xpath][0]['original_xpath'];

                let elements = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);

                let element = elements.iterateNext();
                if (!element) {
                    // If the generated XPath does not match any elements, try the original XPath
                    elements = document.evaluate(originalXpath, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
                    element = elements.iterateNext();
                }
                while (element) {
                    element.setAttribute('data-highlighted', 'true');
                    if (isBlock) {
                        element.style.backgroundColor = '#5FC4015D';
                    } else {
                        element.style.backgroundColor = 'green';
                        element.removeAttribute("href");

                        // Add click event listener to each highlighted element
                        element.addEventListener('click', function (event) {
                            // event.preventDefault();
                            openSidebar(baseUrl, xpath);
                        });

                        // Add mouseover event listener to show tooltip
                        element.addEventListener('mouseover', function (event) {
                            showTooltip(event, originalXpath);
                        });

                        // Add mouseout event listener to hide tooltip
                        element.addEventListener('mouseout', function (event) {
                            let tooltip = document.querySelector('.custom-tooltip');
                            if (tooltip) {
                                tooltip.remove();
                            }
                        });
                    }
                    element = elements.iterateNext();
                }
            }
        });
    });
});
