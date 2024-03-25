// JavaScript code for sidebar functionality

function updateSidebarContent(baseUrl, xpath) {
    var sidebarContent = document.querySelector('.sidebar-content');
    sidebarContent.innerHTML = '' +
        '<ul style="font-size: 20px">' +
        '<li>' +
        '<a target="_blank" href="' + baseUrl + '">' + xpath + '</a>' +
        '</li>' +
        '</ul>';
}

var urlParams = new URLSearchParams(window.location.search);
var xpath = urlParams.get('xpath');
var baseUrl = urlParams.get('baseUrl');

// Update the sidebar content with the initial 'xpath' value
updateSidebarContent(xpath, baseUrl);
