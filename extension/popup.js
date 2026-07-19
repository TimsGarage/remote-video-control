document.addEventListener('DOMContentLoaded', () => {
    const backendInput = document.getElementById('backendUrlInput');
    const sessionIdInput = document.getElementById('sessionIdInput');
    const regenSessBtn = document.getElementById('regenSessBtn');
    const targetSelect = document.getElementById('targetSelect');
    const saveBtn = document.getElementById('saveBtn');
    const injectBtn = document.getElementById('injectBtn');
    const statusText = document.getElementById('statusText');
    const statusDot = document.getElementById('statusDot');

    // 1. Fetch current stored configuration.
    chrome.storage.local.get(['backendUrl', 'targetName', 'sessionId'], (data) => {
        backendInput.value = data.backendUrl || 'https://videocontrol.timsalokat.dev';
        targetSelect.value = data.targetName || 'beamer';

        let sessionId = data.sessionId;
        if (!sessionId) {
            sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
            chrome.storage.local.set({ sessionId });
        }
        sessionIdInput.value = sessionId;
    });

    // 2. Fetch current connection status from background script.
    function refreshStatus() {
        chrome.runtime.sendMessage({ type: 'get-status' }, (response) => {
            if (chrome.runtime.lastError || !response) {
                updateStatusUI('disconnected');
            } else {
                updateStatusUI(response.status);
            }
        });
    }

    function updateStatusUI(status) {
        statusText.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        if (status === 'connected') {
            statusDot.style.backgroundColor = '#2e7d32'; // Green
        } else if (status === 'connecting' || status === 'reconnecting') {
            statusDot.style.backgroundColor = '#f57c00'; // Orange
        } else {
            statusDot.style.backgroundColor = '#c62828'; // Red
        }
    }

    refreshStatus();
    // Poll status while open
    const interval = setInterval(refreshStatus, 2000);

    // Swap interval off when popup closes
    window.addEventListener('unload', () => {
        clearInterval(interval);
    });

    // Listen to changes from background runtime
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'status-update') {
            updateStatusUI(message.state);
        }
    });

    // 3. Save settings
    saveBtn.addEventListener('click', () => {
        let backendUrl = backendInput.value.trim();
        if (backendUrl.endsWith('/')) {
            backendUrl = backendUrl.slice(0, -1);
        }
        const targetName = targetSelect.value;

        chrome.storage.local.set({ backendUrl, targetName }, () => {
            console.log('Configuration saved locally.');
            chrome.runtime.sendMessage({ type: 'reconnect' }, (response) => {
                if (response && response.status) {
                    updateStatusUI(response.status);
                } else {
                    updateStatusUI('connecting');
                }
            });
            alert('Settings saved. Connecting...');
        });
    });

    // 4. Regenerate Session ID
    regenSessBtn.addEventListener('click', () => {
        const newSessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
        chrome.storage.local.set({ sessionId: newSessionId }, () => {
            sessionIdInput.value = newSessionId;
            console.log('Regenerated Session ID:', newSessionId);
            chrome.runtime.sendMessage({ type: 'reconnect' }, (response) => {
                if (response && response.status) {
                    updateStatusUI(response.status);
                } else {
                    updateStatusUI('connecting');
                }
            });
            alert('Session ID regenerated! Reconnecting...');
        });
    });

    // 5. Click-to-copy Session ID
    sessionIdInput.addEventListener('click', () => {
        const val = sessionIdInput.value;
        if (val) {
            navigator.clipboard.writeText(val).then(() => {
                const origText = statusText.textContent;
                statusText.textContent = 'Copied to Clipboard!';
                setTimeout(() => {
                    refreshStatus();
                }, 1500);
            }).catch(err => {
                console.error('Failed to copy text:', err);
            });
        }
    });

    // 6. Force script injection routine
    injectBtn.addEventListener('click', () => {
        injectBtn.textContent = 'Injected';
        injectBtn.disabled = true;

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length === 0) return;
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['contentScript.js'],
            }, () => {
                console.log('Script manual injection command finished.');
            });
        });
    });
});
