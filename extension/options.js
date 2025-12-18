document.addEventListener('DOMContentLoaded', () => {
    refreshOptions();

    // Also refresh when tab becomes visible
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            refreshOptions();
        }
    });
});

function refreshOptions() {
    chrome.storage.sync.get({
        theme: 'system',
        pronunciation: 'phonetic',
        dialect: 'both'
    }, (items) => {
        // Update UI even if values didn't change
        document.getElementById('theme').value = items.theme;
        document.getElementById('pronunciation').value = items.pronunciation;
        document.getElementById('dialect').value = items.dialect;
        console.log('Options refreshed:', items);
    });
}

// Save on change
function saveSettings() {
    const settings = {
        theme: document.getElementById('theme').value,
        pronunciation: document.getElementById('pronunciation').value,
        dialect: document.getElementById('dialect').value
    };

    chrome.storage.sync.set(settings, () => {
        // Show saved indicator
        const indicator = document.getElementById('saved');
        indicator.classList.add('show');
        setTimeout(() => indicator.classList.remove('show'), 2000);

        // Notify all tabs to update
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'settingsChanged',
                    settings: settings
                }).catch(() => { }); // Ignore errors for tabs without content script
            });
        });
    });
}

document.getElementById('theme').addEventListener('change', saveSettings);
document.getElementById('pronunciation').addEventListener('change', saveSettings);
document.getElementById('dialect').addEventListener('change', saveSettings);