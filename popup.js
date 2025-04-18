// Load saved interval when popup opens
document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(['interval'], function(result) {
        if (result.interval) {
            document.getElementById('interval').value = result.interval;
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(['hideRatingWindow'], function(result) {
        if (result.hideRatingWindow) {
            document.getElementById('hideRatingWindow').checked = result.hideRatingWindow;
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(['debugHighlighColors'], function(result) {
        if (result.debugHighlighColors) {
            document.getElementById('debugHighlighColors').checked = result.debugHighlighColors;
        }
    });
});

// Save interval when button is clicked
document.getElementById('saveConfig').addEventListener('click', function() {
    const interval = document.getElementById('interval').value;
    const hideRatingWindow = document.getElementById('hideRatingWindow').checked;
    const debugHighlighColors = document.getElementById('debugHighlighColors').checked;

    chrome.storage.local.set({
        interval: parseInt(interval), 
        hideRatingWindow: hideRatingWindow, 
        debugHighlighColors: debugHighlighColors
    }, function() {
        alert("Configuration saved successfully");
    });
});