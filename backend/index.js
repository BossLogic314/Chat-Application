import express from "express";
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

const PORT = 8081;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        allowedHeaders: ["*"],
        origin: "*"
    }
});

// Maps username to socket
const userSocketMap = {}

io.on('connection', (socket) => {

    console.log('Client connected');

    const username = socket.handshake.username;
    userSocketMap[username] = socket;

    socket.on('chat', (messageObj) => {

        const from = messageObj.from;
        const to = messageObj.to;
        const message = messageObj.message;
        const participants = messageObj.participants;

        console.log(`Received message ${message}`);

        // Sending the message to all participants of the chat
        for (let i = 0; i < participants.length; ++i) {
            const participant = participants[i];
            userSocketMap[participant].emit('chat', message);
        }
    });
});

app.get('/', (req, res) => {
    res.send('Hello!');
});

server.listen(PORT, (req, res) => {
    console.log(`Backend listening on port ${PORT}`);
});