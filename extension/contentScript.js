function simulateKey(key, keyCode, shift = false) {
    const events = ['keydown', 'keyup'];
    events.forEach(eventName => {
        const event = new KeyboardEvent(eventName, {
            key: key,
            keyCode: keyCode,
            code: key === 'ArrowRight' ? 'ArrowRight' :
                (key === 'ArrowLeft' ? 'ArrowLeft' :
                    (key === 'ArrowUp' ? 'ArrowUp' :
                        (key === 'ArrowDown' ? 'ArrowDown' : 'Key' + key.toUpperCase()))),
            which: keyCode,
            bubbles: true,
            cancelable: true,
            composed: true,
            shiftKey: shift
        });
        document.dispatchEvent(event);
        if (document.activeElement) {
            document.activeElement.dispatchEvent(event);
        }
        const video = document.querySelector('video');
        if (video) {
            video.dispatchEvent(event);
        }
    });
}

const services = {
    'youtube.com': {
        play: (v) => { const el = document.querySelector(".ytp-play-button"); if (v.paused && el) el.click(); else if (v.paused) v.play(); },
        pause: (v) => { const el = document.querySelector(".ytp-play-button"); if (!v.paused && el) el.click(); else if (!v.paused) v.pause(); },
        skip: (v) => v.currentTime += 10,
        rewind: (v) => v.currentTime -= 10,
        mute: (v) => { const el = document.querySelector(".ytp-mute-button"); if (el && !v.muted) el.click(); else v.muted = true; },
        unmute: (v) => { const el = document.querySelector(".ytp-mute-button"); if (el && v.muted) el.click(); else v.muted = false; },
        volUp: () => simulateKey("ArrowUp", 38),
        volDown: () => simulateKey("ArrowDown", 40),
        fullscreen: () => { const el = document.querySelector(".ytp-fullscreen-button"); if (!(document.fullscreenElement || document.webkitFullscreenElement) && el) el.click(); },
        smallscreen: () => { const el = document.querySelector(".ytp-fullscreen-button"); if ((document.fullscreenElement || document.webkitFullscreenElement) && el) el.click(); }
    },
    'netflix.com': {
        play: () => { const el = document.querySelector('[data-uia="control-play"]'); if (el) el.click(); else simulateKey(" ", 32); },
        pause: () => { const el = document.querySelector('[data-uia="control-pause"]'); if (el) el.click(); else simulateKey(" ", 32); },
        skip: () => { const el = document.querySelector('[data-uia="control-fast-forward"]'); if (el) el.click(); else simulateKey("ArrowRight", 39); },
        rewind: () => { const el = document.querySelector('[data-uia="control-rewind"]'); if (el) el.click(); else simulateKey("ArrowLeft", 37); },
        mute: () => { const el = document.querySelector('[data-uia^="control-volume-"]'); if (el) el.click(); else simulateKey("m", 77); },
        unmute: () => { const el = document.querySelector('[data-uia^="control-volume-"]'); if (el) el.click(); else simulateKey("m", 77); },
        volUp: () => simulateKey("ArrowUp", 38),
        volDown: () => simulateKey("ArrowDown", 40),
        fullscreen: () => { const el = document.querySelector('[data-uia="control-fullscreen"]'); if (el) el.click(); else simulateKey("f", 70); },
        smallscreen: () => { const el = document.querySelector('[data-uia="control-fullscreen-exit"]') || document.querySelector('[data-uia="control-fullscreen"]'); if (el) el.click(); else simulateKey("f", 70); }
    },
    'amazon.': {
        play: (v) => { const el = document.querySelector('button[aria-label="Play"], button[aria-label="Play video"]'); if (el) el.click(); else if (v.paused) simulateKey(" ", 32); },
        pause: (v) => { const el = document.querySelector('button[aria-label="Pause"], button[aria-label="Pause video"]'); if (el) el.click(); else if (!v.paused) simulateKey(" ", 32); },
        skip: () => simulateKey("ArrowRight", 39),
        rewind: () => simulateKey("ArrowLeft", 37),
        mute: (v) => { const el = document.querySelector('button[aria-label="Mute"], button[aria-label="Unmute"]'); if (el) el.click(); else simulateKey("m", 77); },
        unmute: (v) => { const el = document.querySelector('button[aria-label="Mute"], button[aria-label="Unmute"]'); if (el) el.click(); else simulateKey("m", 77); },
        volUp: () => simulateKey("ArrowUp", 38),
        volDown: () => simulateKey("ArrowDown", 40),
        fullscreen: () => { const el = document.querySelector('button[aria-label="Fullscreen"], button[aria-label="Exit Fullscreen"]'); if (el) el.click(); else simulateKey("f", 70); },
        smallscreen: () => { const el = document.querySelector('button[aria-label="Fullscreen"], button[aria-label="Exit Fullscreen"]'); if (el) el.click(); else simulateKey("f", 70); }
    },
    'disneyplus.com': {
        play: (v) => { if (v.paused) simulateKey(" ", 32); },
        pause: (v) => { if (!v.paused) simulateKey(" ", 32); },
        skip: () => simulateKey("ArrowRight", 39),
        rewind: () => simulateKey("ArrowLeft", 37),
        mute: () => simulateKey("m", 77),
        unmute: () => simulateKey("m", 77),
        volUp: () => simulateKey("ArrowUp", 38),
        volDown: () => simulateKey("ArrowDown", 40),
        fullscreen: () => simulateKey("f", 70),
        smallscreen: () => simulateKey("f", 70)
    },
    'default': {
        play: (v) => v.play(),
        pause: (v) => v.pause(),
        skip: (v) => v.currentTime += 10,
        rewind: (v) => v.currentTime -= 10,
        mute: (v) => v.muted = true,
        unmute: (v) => v.muted = false,
        volUp: (v) => v.volume = Math.min(1, v.volume + 0.1),
        volDown: (v) => v.volume = Math.max(0, v.volume - 0.1),
        fullscreen: (v) => {
            if (v.requestFullscreen) v.requestFullscreen();
            else if (v.webkitRequestFullscreen) v.webkitRequestFullscreen();
        },
        smallscreen: () => {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        }
    }
};

function controlVideo(command) {
    const video = document.querySelector("video") || document.getElementById("hivePlayer");
    if (!video) {
        console.error("No active HTML5 video element detected on page.");
        return;
    }

    const host = window.location.hostname.toLowerCase();
    const serviceKey = Object.keys(services).find(key => host.includes(key)) || 'default';
    const action = services[serviceKey][command];

    if (action) {
        console.log(`Executing action '${command}' on ${host} via services.${serviceKey}`);
        action(video);
    } else {
        console.warn(`Command '${command}' not handled by service ${serviceKey}`);
    }
}

// Listen to instructions from background.js page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'control-video') {
        controlVideo(message.command);
        sendResponse({ success: true, command: message.command });
    }
    return true;
});

console.log("Remote Video Control: Content script loaded and listening for background messages.");
