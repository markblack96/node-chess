const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const WebSocket = require('ws');


var rooms = [
    {id: 1, name: "Peewee's Playhouse", messages: [], players: [], gameFen: 'start'},
]
var idCount = 3;
var playerCount = 0;

const app = express();
const jsonParser = bodyParser.json()

const wsServer = new WebSocket.Server({ noServer: true });
wsServer.on('connection', socket=>{
    socket.on('message', message => {
        let json = JSON.parse(message);
        if (json !== undefined) {
            let roomID = parseInt(json.data.roomID);
            let roomIndex = rooms.findIndex(r=>r.id===roomID);
            switch (json.type) {
                case "join":
                    // add player to room
                    let playerColor = '';
                    if (rooms[roomIndex].players.length === 0) {
                        playerColor = 'w';
                    } else if (rooms[roomIndex].players.length === 1) {
                        playerColor = 'b';
                    }
                    let response = JSON.stringify({
                        type: 'join',
                        userID: ++idCount,
                        userColor: playerColor,
                        fen: rooms[roomIndex].gameFen,
                        message: `Player ${idCount} added to room ${roomID}`
                    });
                    socket.send(response);
                    rooms[roomIndex].players.push({userID: idCount, socket: socket});
                    break;
                case "chat":
                    // send message in room
                    rooms[roomIndex].messages.push(json.data);

                    // send message to everyone in room
                    rooms[roomIndex].players.forEach(d=>d.socket.send(JSON.stringify({type: 'message', messageHistory: rooms[roomIndex].messages})))
                    break;
                case "move":
                    // make move in game
                    console.log(json);
                    rooms[roomIndex].gameFen = json.data.newFen;
                    rooms[roomIndex].players.forEach(d=>{
                        let response = JSON.stringify({type: 'move', fen: rooms[roomIndex].gameFen});
                        console.log(response);
                        d.socket.send(response);
                    });
                    break;
            }
        }
    } );

    // socket.send('Hello, client!');
})
const server = app.listen(3000); // needed for upgrade to ws
server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket=> {
        wsServer.emit('connection', socket, request);
    })
})


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
    let roomID = req.body.room;
    rooms[rooms.findIndex(room=>room.id===roomID)].players.push({playerID: playerCount++});
    let room = rooms[rooms.findIndex(room=>room.id===roomID)];
    res.json({
        message: "Player added",
        players: rooms[rooms.findIndex(room=>room.id===roomID)].players,
        playerID: room.players[room.players.length - 1]
    })
})
app.listen('5000', function () {
    console.log('Node-chess running on port 5000')
})