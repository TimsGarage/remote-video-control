function startWebSocketServer() {
    const eventSource = new EventSource('https://videocontrol.timsalokat.dev/events');

    eventSource.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('Message:', message);
    };

    eventSource.addEventListener('command', (event) => {
        const parsedData = JSON.parse(event.data);
        controlVideo(parsedData.command);
    });

    eventSource.onopen = () => console.log('Connection opened');
    eventSource.onerror = (error) => console.error('Error:', error);
    eventSource.onClose = () => console.log('Connection closed');
}

function controlVideo(command) {
    let video = document.querySelector("video");
    const url = window.location.href;
    if (url.includes("disneyplus.com")) {
        video = document.getElementById("hivePlayer");
    }
    if (video) {
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
    }
}

// Start the SSE connection
startWebSocketServer();
