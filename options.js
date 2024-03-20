// options.js
document.addEventListener('DOMContentLoaded', function() {
    var settingsForm = document.getElementById('settingsForm');
    var baseUrlInput = document.getElementById('baseUrl');

    var baseUrlValue = localStorage.getItem('baseUrl');

    baseUrlInput.value = baseUrlValue || ''; // Set to empty string if null

    // Save settings on form submit
    settingsForm.addEventListener('submit', function(event) {
        event.preventDefault();
        // Read baseUrl value from input field
        var newBaseUrlValue = baseUrlInput.value;
        // Save new baseUrl to local storage
        localStorage.setItem('baseUrl', newBaseUrlValue);
        // Close the popup window
        window.close();
        alert('Settings saved successfully!' + newBaseUrlValue);
    });
});
