let saveInterval = 30000; // Default 30 seconds
let intervalId = null;

function waitForElement(selector, callback) {
    const targetNode = document.body;
    const observer = new MutationObserver((mutationsList, observer) => {
        const element = document.querySelector(selector);
        if (element) {
            observer.disconnect();
            callback(element);
        }
    });

    observer.observe(targetNode, {
        childList: true,
        subtree: true
    });

    // Por si ya existe
    const existing = document.querySelector(selector);
    if (existing) {
        observer.disconnect();
        callback(existing);
    }
}

// Get the interval from storage when the script loads
chrome.storage.local.get(['interval'], function(result) {
    if (result.interval) {
        saveInterval = result.interval * 1000;
    }
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'local' && changes.interval) {
        saveInterval = changes.interval.newValue * 1000;
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = setInterval(autosaveFunction, saveInterval);
        }
    }

    if (namespace === 'local' && changes.hideRatingWindow) {
        waitForElement("div.execution-annotation-panel", function(annotationPanel) {
            annotationPanel.style.display = changes.hideRatingWindow.newValue ? 'none' : 'block';
        });
    }

    if (namespace === 'local' && changes.debugHighlighColors) {
        if (changes.debugHighlighColors.newValue) {
            observeIframeContent(true);
        } else {
            observeIframeContent(false);
        }
    }
});

if (document.title.includes('n8n.io - Workflow Automation')) {
    console.log('Autosave8n enabled');

    chrome.storage.local.get(['interval'], function(result) {
        if (result.interval) {
            saveInterval = result.interval * 1000;
        }
        intervalId = setInterval(autosaveFunction, saveInterval);
    });

    chrome.storage.local.get(['hideRatingWindow'], function(result) {
        waitForElement("div.execution-annotation-panel", function(annotationPanel) {
            annotationPanel.style.display = result.hideRatingWindow ? 'none' : 'block';
        });
    });

    chrome.storage.local.get(['debugHighlighColors'], function(result) {
        if (result.debugHighlighColors) {
            observeIframeContent(true);
        }
    });
}

const autosaveFunction = () => {
    let myid = chrome.runtime.id;
    let saveBtn = document.querySelector('[data-test-id="workflow-save-button"]');

    if (saveBtn && saveBtn.innerText == 'Save') {
        let btnPosition = saveBtn.getBoundingClientRect();
        const gifDiv = document.createElement('div');
        gifDiv.style.position = 'fixed';
        gifDiv.style.top = '68px';
        gifDiv.style.right = '62px';
        gifDiv.style.zIndex = '1000';
        gifDiv.style.width = '32px';
        gifDiv.style.height = '32px';
        gifDiv.innerHTML = `<img src="chrome-extension://${myid}/animation.gif"/>`;

        // Insert the div into the body
        document.body.appendChild(gifDiv);

        // Save the workflow
        saveBtn.click();
        console.log('autosaved work');

        setTimeout(() => {
            document.body.removeChild(gifDiv);
        }, 2700);
    }
};

function observeIframeContent(applyDebugColors) {
    let lastContentDoc = null;
    let lastIframe = null;

    const reapplyObserver = (iframe) => {
        if (!iframe || !iframe.contentDocument) return;

        const contentDoc = iframe.contentDocument;

        // Evitar volver a observar si ya lo hicimos sobre este documento
        if (contentDoc === lastContentDoc) return;
        lastContentDoc = contentDoc;

        const target = contentDoc.querySelector('body > #app > #n8n-app > #app-grid > #content');
        if (!target) return;

        const updateColorBackground = () => {
            if (applyDebugColors){
                success = '#29a366';
                pinned = '#7d72cf';
                error = '#ff616e';
            } else {
                success = '';
                pinned = '';
                error = '';
            }

            const successNode = target.querySelectorAll('div[class*="_node"][class*="_success"]');
            successNode.forEach(node => node.style.backgroundColor = success);

            const pinnedNode = target.querySelectorAll('div[class*="_node"][class*="_pinned"]');
            pinnedNode.forEach(node => node.style.backgroundColor = pinned);

            const errorNode = target.querySelectorAll('div[class*="_node"][class*="_error"]');
            errorNode.forEach(node => node.style.backgroundColor = error);
        };

        updateColorBackground();

        const innerObserver = new MutationObserver(updateColorBackground);
        innerObserver.observe(target, { childList: true, subtree: true });
    };

    const setupIframe = (iframe) => {
        if (!iframe || iframe === lastIframe) return;
        lastIframe = iframe;

        // Esperar a que el contenido cargue
        iframe.addEventListener('load', () => {
            reapplyObserver(iframe);
        });

        // En caso de que ya esté cargado
        if (iframe.contentDocument?.readyState === 'complete') {
            reapplyObserver(iframe);
        }
    };

    const outerObserver = new MutationObserver(() => {
        const iframe = document.querySelector('iframe');
        if (iframe) setupIframe(iframe);
    });

    outerObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Ejecutar también una vez al inicio
    const iframe = document.querySelector('iframe');
    if (iframe) setupIframe(iframe);
}