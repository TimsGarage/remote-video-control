

let sendToServer = function(target, message) {
    const ip = `https://videocontrol.timsalokat.dev/broadcast/${target}/${message}`;
    fetch(ip, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .catch((error) => {
        console.error('Error:', error);
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

