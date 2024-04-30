// Function to close the sidebar
window.closeSidebar = function closeSidebar() {
    /** Close the sidebar by removing the sidebar frame.
     */
    var sidebarFrame = window.document.getElementById('sidebarFrame');
    if (sidebarFrame) {
        sidebarFrame.parentNode.removeChild(sidebarFrame);
    }
}


document.addEventListener('DOMContentLoaded', function () {
    /** Add an event listener to the close button.
     * When the close button is clicked, the sidebar will be closed.
     */
    var closeBtn = document.querySelector('.close-btn');

    // Event listener for the close button
    closeBtn.addEventListener('click', function () {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            // Extract the URL of the active tab
            chrome.scripting.executeScript({
                target: {tabId: tabs[0].id},
                function: closeSidebar,
                args: []
            });
        });
    });

});
