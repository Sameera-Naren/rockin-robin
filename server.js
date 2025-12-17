const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require('path');

// Serve the public folder
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('🔌 Connected ID:', socket.id);

    // LISTEN for the Controller typing
   socket.on('typing_event', (data) => {
    console.log("Broadcasting message from:", data.sender);
    
    // CHANGE THIS: Send the WHOLE 'data' object, not just data.text
    io.emit('flash_wall', data); 
});
});

server.listen(3000, () => {
    console.log('✅ TEST SERVER RUNNING: http://localhost:3000');
});