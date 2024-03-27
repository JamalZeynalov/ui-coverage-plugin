// JavaScript code for sidebar functionality

function getTestCaseTitle(baseUrl, testCaseId) {
    const url = `${baseUrl}/api/rs/testcase/${testCaseId}`;

    if (testCaseId !== undefined) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false); // Set the third parameter to false for synchronous request

        xhr.send();

        if (xhr.status === 200) {
            var testCaseInfo = JSON.parse(xhr.responseText);
            return testCaseInfo.name;
        } else {
            console.error('Failed to fetch test case information:', xhr.statusText, xhr.responseText);
            return null;
        }

    }
}

function updateSidebarContent(baseUrl, testCases) {
    var sidebarContent = document.querySelector('.sidebar-content');
    sidebarContent.innerHTML = '<ul>';

    // Loop through each test case ID in the array
    testCases.forEach(function (caseId) {
        var title = getTestCaseTitle(baseUrl, caseId);
        // Create a list item with a link to the test case
        var listItem = '' + '<li style="font-size: 20px; padding-bottom: 20px">' + '<a target="_blank" href="' + baseUrl + '/testcase/' + caseId + '">' + caseId + '</a> ' + title + '</li>' + '';

        // Append the list item to the sidebar content
        sidebarContent.innerHTML += listItem;
    });

    sidebarContent.innerHTML += '</ul>';
}


document.addEventListener('DOMContentLoaded', function () {
    var urlParams = new URLSearchParams(window.location.search);
    var baseUrl = urlParams.get('baseUrl');
    var testCasesIds = urlParams.get('testCases').split(',');

    // Update the sidebar content with the initial 'xpath' value
    updateSidebarContent(baseUrl, testCasesIds);
});


