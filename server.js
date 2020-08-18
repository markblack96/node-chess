const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const WebSocket = require('ws');


const app = express();
const jsonParser = bodyParser.json()

const wsServer = new WebSocket.Server({ noServer: true });
wsServer.on('connection', socket=>{
    socket.on('message', message => {
        let json = JSON.parse(message);
        console.log(json);
        if (json !== undefined) {
            console.log(json.data);
            switch (json.type) {
                case "chat":
                    // send message in room
                    let roomID = parseInt(json.data.roomID);
                    let roomIndex = rooms.findIndex(r=>r.id===roomID);
                    rooms[roomIndex].messages.push(json.data.message);

                    // send message to everyone in room

                    break;
                case "move":
                    // make move in game
                    break;
            }
        }
    } );

    socket.send('Hello, client!');
})
const server = app.listen(3000); // needed for upgrade to ws
server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket=> {
        wsServer.emit('connection', socket, request);
    })
})

var rooms = [
    {id: 1, name: "Peewee's Playhouse", messages: [], players: []},
    {id: 2, name: "The White House", messages: [], players: []},
    {id: 3, name: "The Boiler Room", messages: [], players: []}
]
var idCount = 3;
var playerCount = 0;
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'))
})

app.get('/rooms', function(req, res) {
    res.json(rooms)
})

app.post('/makeRoom', jsonParser, function(req, res) {
    console.log(req.body);
    rooms.push({id: idCount++, name: req.body.roomName, messages: []});
    res.json({message: `New room with name ${req.body.roomName} created!`})
})

app.get('/room/:roomID', function(req, res){
    res.sendFile(path.join(__dirname + '/public/room.html'))
})

app.get('/messages/:roomID', function(req, res){
    let messages = rooms.find((room=>room.id===parseInt(req.params.roomID))).messages;
    res.json(messages);
})

app.post('/sendMessage', jsonParser, function(req, res){
    rooms[rooms.findIndex(room=>room.id===parseInt(req.body.roomID))].messages.push(req.body.message);
    let room = rooms[rooms.findIndex(room=>room.id===parseInt(req.body.roomID))];
    res.json(room.messages);
})
app.post('/joinGame', jsonParser, function(req, res){
    console.log(req.body);
    let roomID = req.body.room;
    console.log(roomID, typeof(roomID));
    rooms[rooms.findIndex(room=>room.id===roomID)].players.push({playerID: playerCount++});
    let room = rooms[rooms.findIndex(room=>room.id===roomID)];
    res.json({
        message: "Player added",
        players: rooms[rooms.findIndex(room=>room.id===roomID)].players,
        playerID: room.players[room.players.length - 1]
    })
    console.log(rooms[rooms.findIndex(room=>room.id===roomID)]);
})
app.listen('5000', function () {
    console.log('Node-chess running on port 5000')
})