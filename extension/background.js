let currentWord = null;
let isMergedName = false;

function arrayBufferToBase64(buffer) {
    if (!buffer || buffer.byteLength === 0) {
        console.log('❌ Empty buffer provided');
        return '';
    }

    try {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        const chunkSize = 32768; // Process in chunks to avoid long string concatenation

        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);
            binary += String.fromCharCode.apply(null, chunk);
        }

        const base64 = btoa(binary);
        return base64;

    } catch (error) {
        console.log('❌ Base64 conversion failed:', error);
        return '';
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'update-current-word') {
        currentWord = message.word.toLowerCase();
        isMergedName = message.isMergedName || false;
    }

    if (message.type === 'fetch-audio') {
        const url = `https://pub-9ec168b9602247ec9a07b5964680de73.r2.dev/${message.filename}`;

        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.arrayBuffer();
            })
            .then(arrayBuffer => {
                if (!arrayBuffer || arrayBuffer.byteLength === 0) {
                    throw new Error('Empty arrayBuffer received');
                }
                const base64String = arrayBufferToBase64(arrayBuffer);
                sendResponse({
                    success: true,
                    data: base64String,
                    size: arrayBuffer.byteLength
                });
            })
            .catch(error => {
                console.error('Audio fetch failed:', error);
                sendResponse({ success: false, error: error.message });
            });

        return true; // Keep channel open
    }

    if (message.type === 'get-shortcuts') {
        chrome.commands.getAll().then(commands => {
            const shortcuts = {};
            commands.forEach(command => {
                if (command.name === 'play-hn-audio') {
                    shortcuts.hn = command.shortcut || 'Alt+W';
                } else if (command.name === 'play-sg-audio') {
                    shortcuts.sg = command.shortcut || 'Alt+D';
                } else if (command.name === '_execute_action' || command.name === 'toggle-saola') {
                    shortcuts.toggle = command.shortcut || 'Alt+A';
                }
            });
            sendResponse({ success: true, shortcuts });
        }).catch(error => {
            sendResponse({ success: false, error: error.message });
        });
        return true; // Keep channel open for async response
    }
});

chrome.commands.onCommand.addListener((command) => {
    if (command === 'toggle-saola') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                const tab = tabs[0];
                const currentState = tabStates.get(tab.id) ?? true;
                const newState = !currentState;

                tabStates.set(tab.id, newState);
                updateIcon(tab.id);

                chrome.tabs.sendMessage(tab.id, {
                    action: 'setEnabled',
                    enabled: newState
                });
            }
        });
    }

    if (!currentWord) {
        return;
    }

    let dialect;
    if (command === 'play-hn-audio') {
        dialect = 'hn';
    } else if (command === 'play-sg-audio') {
        dialect = 'sg';
    } else {
        return;
    }

    // Send to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: isMergedName ? 'play-audio-sequence' : 'play-audio',
                word: currentWord,
                dialect: dialect
            }).catch(error => {
                console.log('Content script not ready:', error.message);
            });
        }
    });

});

// Track enabled state per tab
const tabStates = new Map();

// Initialize tab state on extension install
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed/updated');
});

// When content script is injected, set default icon
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'complete') {
        // Set default state if not already set
        if (!tabStates.has(tabId)) {
            tabStates.set(tabId, true); // Default to enabled
            updateIcon(tabId);
        }
    }
});

// When tab is activated, update icon
chrome.tabs.onActivated.addListener((activeInfo) => {
    updateIcon(activeInfo.tabId);
});

// Listen for clicks on the extension icon
chrome.action.onClicked.addListener((tab) => {
    const currentState = tabStates.get(tab.id) ?? true; // Default to enabled
    const newState = !currentState;

    tabStates.set(tab.id, newState);
    updateIcon(tab.id);

    // Send message to content script
    chrome.tabs.sendMessage(tab.id, {
        action: 'setEnabled',
        enabled: newState
    }).catch(() => {
        console.log('Content script not loaded yet in tab', tab.id);
    });
});

// Clean up when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
    tabStates.delete(tabId);
});

function updateIcon(tabId) {
    const enabled = tabStates.get(tabId) ?? true;

    chrome.action.setIcon({
        tabId: tabId,
        path: {
            "16": enabled ? "img/icon-16.png" : "img/icon-16-off.png",
            "48": enabled ? "img/icon-48.png" : "img/icon-48-off.png",
            "128": enabled ? "img/icon-128.png" : "img/icon-128-off.png"
        }
    });

    // Optional: Update tooltip
    chrome.action.setTitle({
        tabId: tabId,
        title: enabled ? "SaoLa (Active)" : "SaoLa (Disabled)"
    });
}