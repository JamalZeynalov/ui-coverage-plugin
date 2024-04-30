// Function to open or close the custom window
function toggleCustomWindow(jsonFileContent) {
    /**
     * Check if the custom window already exists.
     * If it does, remove it. Otherwise, create a new custom window.
     * The custom window will display the covered pages from the JSON file.
     * The covered pages are the URLs for which locators are found in the JSON file.
     */
    var customWindow = window.document.getElementById('customWindow');

    // If the custom window already exists, remove it
    if (customWindow) {
        customWindow.parentNode.removeChild(customWindow);
    } else {
        // Create a new div element for the custom window
        customWindow = document.createElement('div');
        customWindow.setAttribute('id', 'customWindow');
        customWindow.style.position = 'fixed';
        customWindow.style.top = '50%';
        customWindow.style.left = '50%';
        customWindow.style.transform = 'translate(-50%, -50%)';
        customWindow.style.width = '600px';
        customWindow.style.height = '400px';
        customWindow.style.border = '1px solid black';
        customWindow.style.backgroundColor = 'white';
        customWindow.style.zIndex = '9999'; // Ensure the window is displayed above all other content
        customWindow.style.overflow = 'auto';
        customWindow.style.padding = '20px';
        customWindow.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        customWindow.style.textAlign = 'left'; // Align the list items vertically from left

        // Create a title for the custom window
        var title = document.createElement('h4');
        title.textContent = 'Covered Pages';
        title.style.marginBottom = '10px'; // Add some margin below the title
        title.style.fontWeight = 'bold'; // Make the title bold
        title.style.textAlign = 'center'; // Center the title

        // Create content for the custom window
        var content = window.document.createElement('div');

        var pages = Object.keys(jsonFileContent).sort();

        var pagesList = '<ul style="list-style-type: none; padding: 0;">'; // Remove default list style and padding

        pages.forEach(function (page) {
            pagesList += '<li style="margin-bottom: 5px;">' +
                '<a target="_blank" href="' + page + '">' + page + '</a>' +
                '<li>';
        });
        pagesList += '</ul>';

        content.innerHTML += pagesList;

        // Create a close button
        var closeButton = document.createElement('button');
        closeButton.setAttribute('id', 'close');
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.backgroundColor = 'transparent';
        closeButton.style.border = 'none';
        closeButton.style.outline = 'none';
        closeButton.style.padding = '0';
        closeButton.style.width = '30px';
        closeButton.style.height = '30px';
        closeButton.style.transition = 'background-color 0.3s';

        // Create the close button lines
        var closeLine1 = document.createElement('div');
        closeLine1.style.position = 'absolute';
        closeLine1.style.top = '50%';
        closeLine1.style.left = '50%';
        closeLine1.style.width = '20px';
        closeLine1.style.height = '2px';
        closeLine1.style.backgroundColor = '#000';
        closeLine1.style.transform = 'translate(-50%, -50%) rotate(45deg)';
        closeButton.appendChild(closeLine1);

        var closeLine2 = document.createElement('div');
        closeLine2.style.position = 'absolute';
        closeLine2.style.top = '50%';
        closeLine2.style.left = '50%';
        closeLine2.style.width = '20px';
        closeLine2.style.height = '2px';
        closeLine2.style.backgroundColor = '#000';
        closeLine2.style.transform = 'translate(-50%, -50%) rotate(-45deg)';
        closeButton.appendChild(closeLine2);

        // Add event listener to close the window when the button is clicked
        closeButton.addEventListener('click', function () {
            customWindow.parentNode.removeChild(customWindow);
        });

        // Append title, content, and close button to the custom window
        customWindow.appendChild(title);
        customWindow.appendChild(content);
        customWindow.appendChild(closeButton);

        // Append the custom window to the document body
        window.document.body.appendChild(customWindow);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    /**
     * Add a click event listener to the "Covered Pages" button.
     * When the button is clicked, read the JSON file content from the IndexedDB
     * and display the covered pages in a custom window.
     */
    const coveredPagesButton = document.getElementById('coveredPagesButton');
    coveredPagesButton.addEventListener('click', function () {
        read_record('UiCoverageDB', 'jsonFileContent', function (jsonFileContent) {
            if (!jsonFileContent) {
                alert('No data found. Please select a JSON file!');
                return;
            }
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.scripting.executeScript({
                    target: {tabId: tabs[0].id}, function: toggleCustomWindow, args: [jsonFileContent]
                });
            });
        });
    });
});
