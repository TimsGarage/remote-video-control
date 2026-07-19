const express = require('express');
const cors = require('cors');
const https = require('https');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 6969;
const STATIC_DIR = process.env.STATIC_DIR || path.join(__dirname, '../frontend');
const sessions = {};

// Enable CORS for all routes or specific routes
app.use(cors());  // Enable CORS for all origins, or you can pass specific options

// Serve frontend static files
app.use(express.static(STATIC_DIR));

// Connection health and status API
app.get('/status', (req, res) => {
    let total = 0;
    Object.values(sessions).forEach(list => total += list.length);
    res.json({
        active_sessions: Object.keys(sessions).length,
        active_connections: total,
        timestamp: new Date().toISOString()
    });
});

// Session-specific status API
app.get('/status/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const active = sessions[sessionId] ? sessions[sessionId].length : 0;
    res.json({
        sessionId,
        active_connections: active,
        timestamp: new Date().toISOString()
    });
});

app.get('/events/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    if (!sessionId) {
        return res.status(400).send('Session ID required');
    }

    // Set appropriate headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Keep the client connection open by writing a comment or empty data if necessary
    res.write(': Keep connection open\n\n'); // Some servers require this to avoid timeouts

    // Initialize session client array if needed
    if (!sessions[sessionId]) {
        sessions[sessionId] = [];
    }
    sessions[sessionId].push(res);
    console.log(`New client joined session: ${sessionId}. Total clients in session:`, sessions[sessionId].length);

    // Periodically send a keep-alive comment
    const keepAliveInterval = setInterval(() => {
        res.write(': keep-alive\n\n');
    }, 15000); // Send every 15 seconds

    // Handle client disconnection
    req.on('close', () => {
        if (sessions[sessionId]) {
            const index = sessions[sessionId].indexOf(res);
            if (index !== -1) {
                sessions[sessionId].splice(index, 1);
            }
            if (sessions[sessionId].length === 0) {
                delete sessions[sessionId];
            }
            console.log(`Client left session: ${sessionId}. Total sessions Remaining:`, Object.keys(sessions).length);
        }
        clearInterval(keepAliveInterval);
    });
});

// Broadcast event to session-specific connected clients
app.get('/broadcast/:sessionId/:target/:message', (req, res) => {
    const { sessionId, target, message } = req.params;
    broadcastEvent(sessionId, target, { command: message });

    res.status(200).send(`Broadcasted event to session ${sessionId}`);
});

// Function to send an event to all active clients of a session
function broadcastEvent(sessionId, target, data) {
    data.target = target;
    const payload = `event: command\ndata: ${JSON.stringify(data)}\n\n`;

    const roomClients = sessions[sessionId];
    if (roomClients && roomClients.length > 0) {
        roomClients.forEach((client) => {
            try {
                client.write(payload); // Send data to each client
            } catch (error) {
                console.error(`Error sending data to client in session ${sessionId}:`, error);
            }
        });
        console.log(`Broadcasted command: ${data.command}, to target: ${target} in session: ${sessionId}`);
    } else {
        console.log(`No active client connections in session ${sessionId} to receive broadcast.`);
    }
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
