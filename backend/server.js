const express = require('express');
const cors = require('cors');
const https = require('https');
const app = express();
const PORT = 6969;
const clients = [];

// Enable CORS for all routes or specific routes
app.use(cors());  // Enable CORS for all origins, or you can pass specific options

app.get('/events', (req, res) => {
    // Set appropriate headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Keep the client connection open by writing a comment or empty data if necessary
    res.write(': Keep connection open\n\n'); // Some servers require this to avoid timeouts

    // Add the client connection to the list
    clients.push(res);
    console.log('New client connected. Total clients:', clients.length);

    // Periodically send a keep-alive comment
    const keepAliveInterval = setInterval(() => {
        res.write(': keep-alive\n\n');
    }, 15000); // Send every 15 seconds

    // Handle client disconnection
    req.on('close', () => {
        clients.splice(clients.indexOf(res), 1);
        clearInterval(keepAliveInterval);
        console.log('Client disconnected. Total clients:', clients.length);
    });
});

// Broadcast event to all connected clients
app.get('/broadcast/:target/:message', (req, res) => {
    // Broadcast an event to all clients
    broadcastEvent(req.params.target, { command: req.params.message });
    
    res.status(200).send('Broadcasted event to all clients');
});

// Function to send an event to all active clients
function broadcastEvent(target, data) {
    data.target = target;
    const payload = `event: command\ndata: ${JSON.stringify(data)}\n\n`;

    clients.forEach((client) => {
        try {
            client.write(payload); // Send data to each client
        } catch (error) {
            console.error('Error sending data to client:', error);
        }
    });

    console.log(`Broadcasted command: ${data.command}, to target: ${target}`);
}

// ! EXPERIMENTAL CODE
app.get('/test', (req, res) => {
    console.log(req);
    const imageUrl = 'https://temp.compsci88.com/manga/One-Piece/1149-004.png';

    https.get(imageUrl, (imageRes) => {
        // Set the same content type as the remote image
        res.setHeader('Content-Type', imageRes.headers['content-type']);
        
        // Pipe the image data directly to the response
        imageRes.pipe(res);
    }).on('error', (err) => {
        console.error('Error fetching image:', err);
        res.status(500).send('Error fetching image');
    });
});


// Start the server and listen on the given port
app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});
