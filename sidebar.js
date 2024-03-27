// JavaScript code for sidebar functionality

function updateSidebarContent(baseUrl, pageUrl, xpath) {
    chrome.storage.local.get(['jsonFileContent'], function (result) {
        var sidebarContent = document.querySelector('.sidebar-content');

        var storedData = JSON.parse(result.jsonFileContent)[pageUrl];

        let usedIds = new Set();
        let testCases = [];
        if (xpath !== null) {
            testCases = storedData[xpath];
            // Loop through each test case ID in the array
        } else {
            // collect tests for all xpaths
            var xpaths = Object.keys(storedData);
            xpaths.forEach(function (xpath) {
                var cases = storedData[xpath];
                cases.forEach(function (caseData) {
                    if (!usedIds.has(caseData.allure_id)) {
                        testCases.push(caseData);
                        usedIds.add(caseData.allure_id);
                    }
                });
            });
        }
        testCases.sort((a, b) => parseInt(a.allure_id) - parseInt(b.allure_id));

        var originalUrl = testCases[0]["original_page_url"];
        sidebarContent.innerHTML = '' + '<p>Original URL: ' + '<a href=' + originalUrl + ' target="_blank">' + originalUrl + ' </a>' + '</p><hr>';

        sidebarContent.innerHTML += '<ul>';
        testCases.forEach(function (testCase) {
            var title = testCase["test_name"];
            var caseId = testCase["allure_id"];
            // Create a list item with a link to the test case
            var listItem = '' + '<li style="font-size: 20px; padding-bottom: 20px">' + '<a target="_blank" href="' + baseUrl + '/testcase/' + caseId + '">' + caseId + '</a> ' + title + '</li><hr>' + '';

            // Append the list item to the sidebar content
            sidebarContent.innerHTML += listItem;
        });
        sidebarContent.innerHTML += '</ul>';
    });

}


document.addEventListener('DOMContentLoaded', function () {
    var urlParams = new URLSearchParams(window.location.search);
    var baseUrl = urlParams.get('baseUrl');
    var xpath = urlParams.get('xpath');
    xpath = (xpath === 'null') ? null : xpath;

    // Update the sidebar content with the initial 'xpath' value
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        // Extract the URL of the active tab
        var parsedUrl = new URL(tabs[0].url);
        var path = parsedUrl.pathname.replace(/\d+/g, 'X')

        // Remove trailing slash if it exists
        if (path.endsWith('/')) {
            path = path.slice(0, -1);
        }
        var pageUrl = parsedUrl.origin + path;

        updateSidebarContent(baseUrl, pageUrl, xpath);
    });
});


