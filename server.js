const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const users = {};

io.on('connection', (socket) => {
    socket.on('join', (username) => {
        users[socket.id] = username;
        io.emit('updateUserList', Object.values(users)); // Send the user list to all connected clients
        // console.log('User joined:', username);
        socket.broadcast.emit('chatMessage', { user: 'System', text: `${username} has joined the chat.` });
    });

    socket.on('disconnect', () => {
        const username = users[socket.id];
        delete users[socket.id];
        io.emit('updateUserList', Object.values(users)); // Send the updated user list to all connected clients
        socket.broadcast.emit('chatMessage', { user: 'System', text: `${username} has left the chat.` });
    });

    socket.on('chatMessage', (message) => {
        const username = users[socket.id];
        io.emit('chatMessage', { user: username, text: message });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
