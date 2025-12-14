// Keyboard shortcut - toggle current tab
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
    // Handle audio commands later
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