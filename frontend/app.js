let API_BASE = localStorage.getItem('backend_url');
if (!API_BASE) {
    API_BASE = (window.location.protocol === 'file:' || (window.location.hostname === 'localhost' && window.location.port !== '6969'))
        ? 'http://localhost:6969'
        : window.location.origin;
}
let SESSION_ID = localStorage.getItem('session_id') || '';

document.addEventListener('DOMContentLoaded', () => {
    const serverInput = document.getElementById('server-url');
    const sessionInput = document.getElementById('session-url');
    const saveButton = document.getElementById('save-settings');
    const indicator = document.getElementById('connection-indicator');
    const statusText = document.getElementById('connection-text');

    if (serverInput) serverInput.value = API_BASE;
    if (sessionInput) sessionInput.value = SESSION_ID;

    if (saveButton && serverInput && sessionInput) {
        saveButton.addEventListener('click', () => {
            let srvVal = serverInput.value.trim();
            if (srvVal && srvVal.endsWith('/')) {
                srvVal = srvVal.slice(0, -1);
            }
            let sessVal = sessionInput.value.trim().toUpperCase();

            if (srvVal && sessVal) {
                localStorage.setItem('backend_url', srvVal);
                localStorage.setItem('session_id', sessVal);
                API_BASE = srvVal;
                SESSION_ID = sessVal;
                alert('Settings saved successfully!');
                checkConnection();
            } else {
                alert('Please enter both Server URL and Session ID.');
            }
        });
    }

    function checkConnection() {
        if (!SESSION_ID) {
            if (indicator) indicator.style.backgroundColor = '#f57c00'; // Orange
            if (statusText) statusText.textContent = 'Enter Session ID';
            return;
        }

        fetch(`${API_BASE}/status/${SESSION_ID}`)
            .then(res => {
                if (!res.ok) throw new Error('Not OK');
                return res.json();
            })
            .then(data => {
                if (data.active_connections > 0) {
                    if (indicator) indicator.style.backgroundColor = '#2e7d32'; // Green
                    if (statusText) statusText.textContent = `Connected (Active Client)`;
                } else {
                    if (indicator) indicator.style.backgroundColor = '#0288d1'; // Blue
                    if (statusText) statusText.textContent = `Server Online (No Ext)`;
                }
            })
            .catch(err => {
                if (indicator) indicator.style.backgroundColor = '#c62828'; // Red
                if (statusText) statusText.textContent = 'Server Offline';
            });
    }

    checkConnection();
    setInterval(checkConnection, 5000);
});

let sendToServer = function (target, message) {
    if (!SESSION_ID) {
        alert('Please configure a valid Session ID in settings before sending commands.');
        return;
    }
    const ip = `${API_BASE}/broadcast/${SESSION_ID}/${target}/${message}`;
    fetch(ip, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .catch((error) => {
            console.error('Error sending request:', error);
        });
}

// Beamer
document.getElementById('beamer-rewind').addEventListener('click', () => sendToServer("beamer", "rewind"));
document.getElementById('beamer-pause').addEventListener('click', () => sendToServer("beamer", "pause"));
document.getElementById('beamer-play').addEventListener('click', () => sendToServer("beamer", "play"));
document.getElementById('beamer-skip').addEventListener('click', () => sendToServer("beamer", "skip"));

document.getElementById('beamer-volDown').addEventListener('click', () => sendToServer("beamer", "volDown"));
document.getElementById('beamer-mute').addEventListener('click', () => sendToServer("beamer", "mute"));
document.getElementById('beamer-unmute').addEventListener('click', () => sendToServer("beamer", "unmute"));
document.getElementById('beamer-volUp').addEventListener('click', () => sendToServer("beamer", "volUp"));

document.getElementById('beamer-fullscreen').addEventListener('click', () => sendToServer("beamer", "fullscreen"));
document.getElementById('beamer-smallscreen').addEventListener('click', () => sendToServer("beamer", "smallscreen"));

// Laptop
document.getElementById('laptop-rewind').addEventListener('click', () => sendToServer("laptop", "rewind"));
document.getElementById('laptop-pause').addEventListener('click', () => sendToServer("laptop", "pause"));
document.getElementById('laptop-play').addEventListener('click', () => sendToServer("laptop", "play"));
document.getElementById('laptop-skip').addEventListener('click', () => sendToServer("laptop", "skip"));

document.getElementById('laptop-volDown').addEventListener('click', () => sendToServer("laptop", "volDown"));
document.getElementById('laptop-mute').addEventListener('click', () => sendToServer("laptop", "mute"));
document.getElementById('laptop-unmute').addEventListener('click', () => sendToServer("laptop", "unmute"));
document.getElementById('laptop-volUp').addEventListener('click', () => sendToServer("laptop", "volUp"));

document.getElementById('laptop-fullscreen').addEventListener('click', () => sendToServer("laptop", "fullscreen"));
document.getElementById('laptop-smallscreen').addEventListener('click', () => sendToServer("laptop", "smallscreen"));

