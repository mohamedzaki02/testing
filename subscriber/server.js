const keys = require('./keys');

const http = require('http');
const express = require('express');
const socketio = require('socket.io');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort
});
const sub = redisClient.duplicate();


sub.on('connect', () => console.log('connecting to redis'));


sub.on('err', err => console.log(err));


sub.on('message', (channel, message) => {
    //console.log('working : ' + message);
    // when subscriber node gets notified by subscribing to "insert" ... 
    // It should emit to the client using sockets io 
    io.emit('vehicle_connected', { vehicleId: message });
});
sub.subscribe('insert');


io.on('connection', (socket) => {
    // is should be displayed in the logs when the client establish connection
    console.log('### CONNECTION IS UP ###');
});


// TESTING PURPOSE
// setInterval(function () {
//     io.emit('someEvent', { message: 'this is a test message' });
// }, 3000)

server.listen(4002, function () {
    console.log('RUNING SUBSCRIBER  SERVER @ 4002');
});
