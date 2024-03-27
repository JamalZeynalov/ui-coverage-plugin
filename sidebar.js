// JavaScript code for sidebar functionality

function getTestCaseTitle(baseUrl, testCaseId) {
    const url = `${baseUrl}/api/rs/testcase/${testCaseId}`;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, false); // Set the third parameter to false for synchronous request

    xhr.send();

    if (xhr.status === 200) {
        const testCaseInfo = JSON.parse(xhr.responseText);
        return testCaseInfo.name;
    } else {
        console.error('Failed to fetch test case information:', xhr.statusText);
        return null;
    }
}

function updateSidebarContent(baseUrl, testCasesIds) {
    var sidebarContent = document.querySelector('.sidebar-content');
    sidebarContent.innerHTML = '<ul>';

    // Loop through each test case ID in the array
    testCasesIds.forEach(function (caseId) {
        var title = getTestCaseTitle(baseUrl, caseId);
        // Create a list item with a link to the test case
        var listItem = '' +
            '<li style="font-size: 20px; padding-bottom: 20px">' +
            '<a target="_blank" href="' + baseUrl + '/testcase/' + caseId + '">' + caseId + '</a> ' + title +
            '</li>' +
            '';

        // Append the list item to the sidebar content
        sidebarContent.innerHTML += listItem;
    });

    sidebarContent.innerHTML += '</ul>';
}


document.addEventListener('DOMContentLoaded', function () {
    var urlParams = new URLSearchParams(window.location.search);
    var baseUrl = urlParams.get('baseUrl');
    var testCasesIds = urlParams.get('testCasesIds').split(',');

    // Update the sidebar content with the initial 'xpath' value
    updateSidebarContent(baseUrl, testCasesIds);
});


