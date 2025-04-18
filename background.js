chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.get(['interval'], function(result) {
        if (!result.interval) {
            chrome.storage.local.set({interval: 30}, function() {
                console.log('Default interval set to 30 seconds');
            });
        }
    });
});