let wsConnection;

function startWebSocketServer() {

    // Connect to the SSE endpoint
    const eventSource = new EventSource('https://videocontrol.timsalokat.dev/events');

    // Handle incoming messages
    eventSource.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('Received message:', message);

        // Display the message
        const div = document.createElement('div');
        div.textContent = `Message: ${message.text}`;
        document.getElementById('messages').appendChild(div);
    };

    // Handle named events
    eventSource.addEventListener('command', (event) => {
        console.log('Received command:', event.data);
        const parsedData = JSON.parse(event.data);
        controlVideo(parsedData.command);
    });

    eventSource.onopen = () => {
        console.log('Connection opened');
    }

    eventSource.onerror = (error) => {
        console.error('Error:', error);
    }

    eventSource.onClose = () => {  
        console.log('Connection closed');
    }

}

function controlVideo(command) {

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) return;
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: (command) => {
                const video = document.querySelector("video");
                if (video) {
                    if (command === "play") video.play();
                    if (command === "pause") video.pause();
                    else console.log("Unknown command:", command);
                }
            },
            args: [command],
        });
    });
}

startWebSocketServer();
