'use strict';
const express = require('express');
const app = express();
app.use(express.static('./'));



var hosturl = "0.0.0.0";
var wsport = 3100;
var oscport = 6448;

// WebSocket Serverを立ち上げる
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({host:hosturl, port:wsport});

// OSC Senderを立ち上げる
var oscsender = require('omgosc').UdpSender;
var sender = new oscsender(hosturl, oscport);
// WebSocketのイベントハンドラ
wss.on('connection', function (ws) {
    ws.on('message', function (message) {
        var mes = JSON.parse(message);
        if(mes.osc){
            sender.send(mes.path,mes.type,mes.data);
        }
    });
});


app.listen(3000, ()=> {
    console.log('Express Server 01');
});
