let eventSource = null;
let reconnectDelay = 1000;
const maxReconnectDelay = 16000;
let connectionState = 'disconnected';

function updateConnectionState(state) {
    connectionState = state;
    console.log(`Connection state changed to: ${state}`);

    // Broadcast status to popup if it's open
    chrome.runtime.sendMessage({ type: 'status-update', state }).catch(() => {
        // Ignore "receiving end does not exist" when popup is closed
    });
}

function connectSSE() {
    chrome.storage.local.get(['backendUrl', 'targetName', 'sessionId'], (data) => {
        let sessionId = data.sessionId;
        if (!sessionId) {
            // Generate a random 6-character uppercase alphanumeric code
            sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
            chrome.storage.local.set({ sessionId });
        }

        const backendUrl = data.backendUrl || 'https://videocontrol.timsalokat.dev';
        const targetName = data.targetName || 'beamer';

        if (eventSource) {
            eventSource.close();
            eventSource = null;
        }

        console.log(`Attempting to connect to SSE: ${backendUrl}/events/${sessionId} (filtered by target: ${targetName})`);
        updateConnectionState('connecting');

        try {
            eventSource = new EventSource(`${backendUrl}/events/${sessionId}`);

            eventSource.onopen = () => {
                reconnectDelay = 1000; // Reset delay
                updateConnectionState('connected');
            };

            eventSource.addEventListener('command', (event) => {
                try {
                    const payload = JSON.parse(event.data);
                    console.log('SSE message received:', payload);

                    // Filter commands matching current target selection
                    if (payload.target === targetName || payload.target === 'any') {
                        routeCommandToActiveTab(payload.command);
                    } else {
                        console.log(`Command ignored. Target mismatch (msg: ${payload.target}, current client target: ${targetName})`);
                    }
                } catch (err) {
                    console.error('Error parsing SSE event payload:', err);
                }
            });

            eventSource.onerror = (error) => {
                console.error('SSE Error, reconnecting:', error);
                updateConnectionState('reconnecting');
                if (eventSource) {
                    eventSource.close();
                    eventSource = null;
                }
                setTimeout(connectSSE, reconnectDelay);
                reconnectDelay = Math.min(reconnectDelay * 2, maxReconnectDelay);
            };

        } catch (e) {
            console.error('Failed to construct EventSource:', e);
            updateConnectionState('disconnected');
            setTimeout(connectSSE, reconnectDelay);
            reconnectDelay = Math.min(reconnectDelay * 2, maxReconnectDelay);
        }
    });
}

function routeCommandToActiveTab(command) {
    chrome.tabs.query({ active: true }, (tabs) => {
        if (!tabs || tabs.length === 0) return;

        tabs.forEach((tab) => {
            if (!tab.id) return;
            chrome.tabs.sendMessage(tab.id, { type: 'control-video', command }, (response) => {
                if (chrome.runtime.lastError) {
                    const msg = chrome.runtime.lastError.message;
                    // Suppress warning if tab simply doesn't have the content script loaded
                    if (!msg.includes("Could not establish connection") && !msg.includes("Receiving end does not exist")) {
                        console.warn(`Error sending command to tab ${tab.id}:`, msg);
                    }
                } else {
                    console.log(`Command '${command}' executed on tab ${tab.id} successfully:`, response);
                }
            });
        });
    });
}

// Runtime messages from Popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'get-status') {
        sendResponse({ status: connectionState });
    } else if (message.type === 'reconnect') {
        console.log('Reconnection triggered due to configuration update.');
        connectSSE();
        sendResponse({ status: 'reconnecting' });
    }
    return true;
});

// Setup on boot
connectSSE();
