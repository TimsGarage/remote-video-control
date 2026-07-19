function controlVideo(command) {
    let video = document.querySelector("video");
    const url = window.location.href;
    if (url.includes("disneyplus.com")) {
        video = document.getElementById("hivePlayer");
    }

    if (video) {
        console.log(`Executing video command: ${command}`);
        if (command === "play") video.play();
        else if (command === "pause") video.pause();
        else if (command === "skip") video.currentTime += 10;
        else if (command === "rewind") video.currentTime -= 10;

        else if (command === "mute") video.muted = true;
        else if (command === "unmute") video.muted = false;
        else if (command === "volUp") video.volume = Math.min(1, video.volume + 0.1);
        else if (command === "volDown") video.volume = Math.max(0, video.volume - 0.1);

        else if (command === "fullscreen") {
            if (video.requestFullscreen) video.requestFullscreen();
            else if (video.mozRequestFullScreen) video.mozRequestFullScreen();
            else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
            else if (video.msRequestFullscreen) video.msRequestFullscreen();
        } else if (command === "smallscreen") {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            else if (document.msExitFullscreen) document.msExitFullscreen();
        }
        else console.log("Unknown command:", command);
    } else {
        console.error("No active HTML5 video element detected on page.");
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
