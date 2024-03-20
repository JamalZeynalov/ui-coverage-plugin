// options.js
document.addEventListener('DOMContentLoaded', function() {
    var settingsForm = document.getElementById('settingsForm');
    var baseUrlInput = document.getElementById('baseUrl');

    // Restore saved settings
    chrome.storage.sync.get(['baseUrl'], function(result) {
        baseUrlInput.value = result.baseUrl || '';
    });

    // Save settings on form submit
    settingsForm.addEventListener('submit', function(event) {
        event.preventDefault();
        var baseUrl = baseUrlInput.value.trim();

        // Save baseUrl to storage
        chrome.storage.sync.set({ 'baseUrl': baseUrl }, function() {
            console.log('Base URL saved:', baseUrl);
        });
    });
});
