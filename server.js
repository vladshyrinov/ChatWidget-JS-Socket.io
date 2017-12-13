/* jslint esversion: 6*/ 

const express = require('express');
const app = express();
const server = require('http').Server(app);
const ws = require('socket.io')(server);

const port = 3000;
server.listen(port);

app.use(express.static(__dirname + "/public"));

ws.on('connection', (socket) => {
    let userName;

    socket.on('defineUser', (name) => {
        userName = name;
        socket.join(userName);
    });

    socket.on('message', (room, name, msg) => {
        socket.to(room).emit('messageToClients', name, msg);
    });
    
});

// function getFormattedDate(date) {

//     function zeroAdder(el) {
//         return el < 10 ? "0" + el : el; 
//     }

//     let dateStr = zeroAdder(date.getDate()) + "." + 
//     zeroAdder(date.getMonth()+1) + ", " + 
//     zeroAdder(date.getHours()) + ":" + 
//     zeroAdder(date.getMinutes()) + ":";

//     return dateStr;
// };