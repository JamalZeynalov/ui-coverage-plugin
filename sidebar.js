// JavaScript code for sidebar functionality

function updateSidebarContent(baseUrl, pageUrl, xpath) {
    /** Update the sidebar content with the test cases that interacted with the element.
     * @param {string} baseUrl - The base URL of the website.
     * @param {string} pageUrl - The URL of the current page.
     * @param {string} xpath - The XPath of the element.
     */
    read_record('UiCoverageDB', 'jsonFileContent', function (jsonFileContent) {
        let sidebarContent = document.querySelector('.sidebar-content');
        let storedData = jsonFileContent[pageUrl];
        let summary = '';

        let usedIds = new Set();
        let testCases = [];
        if (xpath !== null) {
            // collect tests for the specific xpath
            testCases = storedData[xpath];
            let testWord = testCases.length === 1 ? 'test case' : 'test cases';
            summary = '<b>' + testCases.length + ' ' + testWord + ' interacted with this element. Locator:</b>' +
                '<br>' +
                '<p style="font-size: 16px">' + xpath + ' </p><hr>';
        } else {
            // collect tests for all xpaths
            let xpaths = Object.keys(storedData);
            xpaths.forEach(function (xpath) {
                let cases = storedData[xpath];
                cases.forEach(function (caseData) {
                    if (!usedIds.has(caseData.allure_id)) {
                        testCases.push(caseData);
                        usedIds.add(caseData.allure_id);
                    }
                });
            });
            let originalUrl = testCases[0]["original_page_url"];
            summary = '<b>' + testCases.length + ' test cases interacted with '
                + xpaths.length + ' element(s) on this page</b>' + '<br>' +
                '<p>Original URL: <a href=' + originalUrl + ' target="_blank">' + originalUrl + ' </a></p><hr>';
        }
        testCases.sort((a, b) => parseInt(a.allure_id) - parseInt(b.allure_id));


        sidebarContent.innerHTML = summary;

        sidebarContent.innerHTML += '<ul>';
        testCases.forEach(function (testCase) {
            let title = testCase["test_name"];
            let caseId = testCase["allure_id"];
            // Create a list item with a link to the test case
            let listItem = '' + '<li style="font-size: 20px; padding-bottom: 20px">' + '<a target="_blank" href="' + baseUrl + '/testcase/' + caseId + '">' + caseId + '</a> ' + title + '</li><hr>' + '';

            // Append the list item to the sidebar content
            sidebarContent.innerHTML += listItem;
        });
        sidebarContent.innerHTML += '</ul>';
    });
}


document.addEventListener('DOMContentLoaded', function () {
    /** Update the sidebar content with the base URL and XPath.
     */
    let urlParams = new URLSearchParams(window.location.search);
    let baseUrl = urlParams.get('baseUrl');
    let xpath = urlParams.get('xpath');
    xpath = (xpath === 'null') ? null : xpath;

    // Update the sidebar content with the initial 'xpath' value
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
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

        updateSidebarContent(baseUrl, pageUrl, xpath);
    });
});


