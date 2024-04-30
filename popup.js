function openSidebar(baseUrl, xpath = null) {
    /**
     * Open the sidebar with the given base URL and XPath.
     *
     * @param {string} baseUrl - The base URL of the website.
     * @param {string} xpath - The XPath of the element to be highlighted.
     * */
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
    /**
     * Show a tooltip with the given text at the position of the target element.
     */
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
    /**
     * Add click event listener to the "Check" button.
     * This button will highlight the elements on the page based on the JSON data.
     * The JSON data is retrieved from the IndexedDB database.
     * The highlighted elements will be clickable and will open the sidebar with the details.
     * The "Show All" button will open the sidebar with all the covered elements.
     * The sidebar can be closed by clicking the close button.
     * @type {HTMLElement}
     */
    const checkButton = document.getElementById('checkButton');
    const showAllButton = document.getElementById('showAllButton');

    const baseUrl = localStorage.getItem('baseUrl');

    // Add click event listener to each highlighted element
    showAllButton.addEventListener('click', function (event) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            // Extract the URL of the active tab
            read_record('UiCoverageDB', 'jsonFileContent', function (jsonFileContent) {
                if (!jsonFileContent) {
                    alert('No data found. Please select a JSON file!');
                    return;
                }
                chrome.scripting.executeScript({
                    target: {tabId: tabs[0].id}, function: openSidebar, args: [baseUrl]
                });
            });
        });
    });

    read_record('UiCoverageDB', 'jsonFileContent', function (jsonFileContent) {
        read_record('UiCoverageDB', 'jsonFileName', function (jsonFileName) {
            checkButton.addEventListener('click', function () {
                let selectedFileContent = {}
                if (!jsonFileName) {
                    alert('No data found. Please select a JSON file!');
                    return;
                } else {
                    selectedFileContent = jsonFileContent;
                }
                highlightElements(selectedFileContent, baseUrl);
            });

            function highlightElements(jsonData, baseUrl) {
                /** Highlight the elements on the page based on the JSON data.
                 * @param {Object} jsonData - The JSON data containing the locators for each URL.
                 * @param {string} baseUrl - The base URL of the website.
                 */
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
                    alert('All elements highlighted!');
                });
            }

            // Function to highlight elements on the page based on XPath
            function highlightElementsInTab(jsonFileContent, baseUrl, pageUrl, xpath) {
                /** Highlight the elements on the page based on the JSON data.
                 * The highlighted elements will be clickable and will open the sidebar with the details.
                 * @param {Object} jsonFileContent - The JSON data containing the locators for each URL.
                 * @param {string} baseUrl - The base URL of the website.
                 * @param {string} pageUrl - The URL of the current page.
                 * @param {string} xpath - The XPath of the element to be highlighted.
                 */
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
