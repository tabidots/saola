// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
    if (command === 'toggle-saola') {
        // Send message to active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle' });
            }
        });
    }
    // Handle audio commands later
});

// Optional: Track enabled state per tab
const tabStates = new Map();

chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.action === 'setState') {
        tabStates.set(sender.tab.id, message.enabled);
    }
});