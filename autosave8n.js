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

    waitForElement("[data-test-id='credential-name']", function() {
        let isMCP = document.querySelector('[data-test-id="credential-name"] > div[class*="subtitle"]')?.textContent;
        
        if (isMCP && isMCP.includes('MCP Client (STDIO) API')) {
            let isCommandLine = document.querySelector('[data-test-id="node-auth-type-selector"] > label > span > input')?.checked;
            if (isCommandLine) {
                const div = document.createElement('div');
                div.style.margin = '15px 0';
                div.style.position = 'relative';
    
                // Estilizar el contenedor
                const inputContainer = document.createElement('div');
                inputContainer.style.position = 'relative';
                inputContainer.style.width = '100%';
                inputContainer.style.display = 'flex';
                inputContainer.style.gap = '10px';
                
                // Crear y estilizar el input
                const input = document.createElement('input');
                input.setAttribute('list', 'opciones');
                input.setAttribute('placeholder', 'Seleccione un servidor MCP');
                input.id = 'selector-mcp';
                input.style.width = '100%';
                input.style.padding = '10px 15px';
                input.style.borderRadius = '4px';
                input.style.border = '1px solid #ccc';
                input.style.fontSize = '14px';
                input.style.transition = 'border-color 0.3s, box-shadow 0.3s';
                input.style.boxSizing = 'border-box';
                
                // Crear el botón de limpiar
                const clearButton = document.createElement('button');
                clearButton.textContent = '✕';
                clearButton.id = 'clear-mcp-selection';
                clearButton.style.padding = '0 12px';
                clearButton.style.backgroundColor = '#f0f0f0';
                clearButton.style.border = '1px solid #ccc';
                clearButton.style.borderRadius = '4px';
                clearButton.style.cursor = 'pointer';
                clearButton.style.fontSize = '14px';
                clearButton.style.display = 'none'; // Inicialmente oculto
                clearButton.title = 'Limpiar selección';
                
                // Efecto hover para el botón de limpiar
                clearButton.addEventListener('mouseover', () => {
                    clearButton.style.backgroundColor = '#e0e0e0';
                    clearButton.style.borderColor = '#aaa';
                });
                
                clearButton.addEventListener('mouseout', () => {
                    clearButton.style.backgroundColor = '#f0f0f0';
                    clearButton.style.borderColor = '#ccc';
                });
                
                // Función para limpiar la selección
                clearButton.addEventListener('click', function() {
                    input.value = '';
                    clearButton.style.display = 'none';
                    
                    // Limpiar los campos rellenados
                    const inputTextCommand = document.querySelector('[data-test-id="credential-connection-parameter"] input');
                    const inputTextArgs = document.querySelector('[data-test-id="parameter-input-args"] input');
                    
                    if (inputTextCommand) {
                        inputTextCommand.value = '';
                        const event = new Event('input', { bubbles: true });
                        inputTextCommand.dispatchEvent(event);
                    }
                    
                    if (inputTextArgs) {
                        inputTextArgs.value = '';
                        const event = new Event('input', { bubbles: true });
                        inputTextArgs.dispatchEvent(event);
                    }
                    
                    // Eliminar el contenedor de entorno si existe
                    const existingPre = document.getElementById('env-container');
                    if (existingPre) {
                        existingPre.remove();
                    }
                });
                
                // Efecto hover
                input.addEventListener('mouseover', () => {
                    input.style.borderColor = '#aaa';
                });
                
                input.addEventListener('mouseout', () => {
                    if (document.activeElement !== input) {
                        input.style.borderColor = '#ccc';
                    }
                });
                
                // Efecto focus
                input.addEventListener('focus', () => {
                    input.style.outline = 'none';
                    input.style.borderColor = '#4d90fe';
                    input.style.boxShadow = '0 0 0 2px rgba(77, 144, 254, 0.2)';
                });
                
                input.addEventListener('blur', () => {
                    input.style.borderColor = '#ccc';
                    input.style.boxShadow = 'none';
                });
                
                // Crear el datalist
                const datalist = document.createElement('datalist');
                datalist.id = 'opciones';
                
                // Agregar un título antes del selector
                const title = document.createElement('label');
                title.htmlFor = 'selector-mcp';
                title.textContent = 'Servidor MCP';
                title.style.display = 'block';
                title.style.marginBottom = '8px';
                title.style.fontWeight = 'bold';
                title.style.color = '#333';
                title.style.fontSize = '14px';
    
                // Agregar elementos al DOM
                div.appendChild(title);
                inputContainer.appendChild(input);
                inputContainer.appendChild(clearButton);
                div.appendChild(inputContainer);
                div.appendChild(datalist);
    
                const target = document.querySelector('[data-test-id="credential-connection-parameter"]');
                
                // Asegurarnos que target existe
                if (target) {
                    target.parentNode.insertBefore(div, target);
                    
                    let myid = chrome.runtime.id;
                    let mcpData = null;
    
                    // Cargar los datos del JSON
                    fetch(`chrome-extension://${myid}/mcpservers.json`)
                        .then(r => r.json())
                        .then(json => {
                            mcpData = json;
                            datalist.innerHTML = Object.keys(json).map(name => `<option value="${name}">`).join('');
                        })
                        .catch(console.error);
                    
                    // Verificar si hay valor para mostrar u ocultar el botón
                    input.addEventListener('input', function() {
                        if (this.value.trim() !== '') {
                            clearButton.style.display = 'block';
                        } else {
                            clearButton.style.display = 'none';
                        }
                    });
                    
                    // Agregar event listener para detectar cambios en el input
                    input.addEventListener('change', function() {
                        const selectedOption = this.value;
                        
                        // Mostrar el botón de limpiar si hay una selección
                        if (selectedOption.trim() !== '') {
                            clearButton.style.display = 'block';
                        } else {
                            clearButton.style.display = 'none';
                        }
                        
                        // Verificar si la opción seleccionada existe en nuestros datos
                        if (mcpData && mcpData[selectedOption] && mcpData[selectedOption].mcpServers) {
                            const mcpServerData = mcpData[selectedOption].mcpServers;
                            const mcpServerKey = Object.keys(mcpServerData)[0]; // Tomar el primer servidor
                            
                            if (mcpServerKey) {
                                const serverDetails = mcpServerData[mcpServerKey];
    
                                // Preparar los datos para asignar al input
                                let commandString = '';
                                let argsString = '';
                                let envString = '';
    
                                if (serverDetails.command && serverDetails.args) {
                                    commandString = serverDetails.command;
                                    argsString = serverDetails.args.join(' ');
                                    envString = Object.entries(serverDetails.env).map(([key, value]) => `${key}=${value}`).join(',\n');
                                }
                                
                                // Buscar el input text donde colocaremos los datos
                                const inputTextCommand = document.querySelector('[data-test-id="credential-connection-parameter"] input');
                                const inputTextArgs = document.querySelector('[data-test-id="parameter-input-args"] input');
                                const rowEnviroment = document.querySelector('[data-test-id="environments"]');
    
                                if (inputTextCommand) {
                                    inputTextCommand.value = commandString;
                                    inputTextArgs.value = argsString;
    
                                    const event = new Event('input', { bubbles: true });
                                    inputTextCommand.dispatchEvent(event);
                                }
                                
                                // Crear y añadir la etiqueta pre después de rowEnviroment
                                if (rowEnviroment) {
                                    // Eliminar el contenedor anterior si existe
                                    const existingPre = document.getElementById('env-container');
                                    if (existingPre) {
                                        existingPre.remove();
                                    }
                                    
                                    const preContainer = document.createElement('div');
                                    preContainer.id = 'env-container';
                                    
                                    const preElement = document.createElement('pre');
                                    preElement.textContent = envString;
                                    preElement.style.fontSize = '12px';
                                    preElement.style.lineHeight = '1.5';
                                    preElement.style.color = '#f8f8f2';
                                    preElement.style.padding = '12px';
                                    preElement.style.backgroundColor = '#282a36';
                                    preElement.style.borderRadius = '4px';
                                    preElement.style.overflow = 'auto';
                                    preElement.style.maxHeight = '200px';
                                    preElement.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
                                    preElement.style.border = '1px solid #44475a';

                                    preContainer.appendChild(preElement);
                                    rowEnviroment.parentNode.appendChild(preContainer);
                                }
                            }
                        }
                    });
                }
            }
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