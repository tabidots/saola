document.addEventListener('DOMContentLoaded', async () => {
    refreshOptions();

    // Also refresh when tab becomes visible
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            refreshOptions();
        }
    });

    document.getElementById('open-shortcuts').addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    });

    await displayCurrentShortcuts();
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

async function displayCurrentShortcuts() {
    try {
        const commands = await chrome.commands.getAll();

        const activationShortcut = commands.find(command => command.name === '_execute_action')?.shortcut;
        document.getElementById('activation-shortcut').textContent = activationShortcut || 'Not set';

        const hanoiAudioShortcut = commands.find(command => command.description.includes('Hanoi'))?.shortcut;
        document.getElementById('hanoi-audio-shortcut').textContent = hanoiAudioShortcut || 'Not set';

        const saigonAudioShortcut = commands.find(command => command.description.includes('Saigon'))?.shortcut;
        document.getElementById('saigon-audio-shortcut').textContent = saigonAudioShortcut || 'Not set';

    } catch (error) {
        console.error('Error fetching shortcuts:', error);
    }
}