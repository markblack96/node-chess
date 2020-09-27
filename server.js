const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const WebSocket = require('ws');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const generateID = Math.random().toString(36).substr(2, 5);

var rooms = [
    {id: 1, name: "Peewee's Playhouse", messages: [], players: [], gameFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'},
]
var idCount = 3;
var playerCount = 0;

const app = express();
const jsonParser = bodyParser.json()

app.use(cookieParser());

const wsServer = new WebSocket.Server({ noServer: true });
wsServer.on('connection', socket=>{
    socket.on('message', message => {
        let json = JSON.parse(message);
        if (json !== undefined) {
            let roomID = parseInt(json.data.roomID);
            let roomIndex = rooms.findIndex(r=>r.id===roomID);
            switch (json.type) {
                case "join":
                    let room = rooms[roomIndex];
                    console.log(room);
                    // if user already in room, return without adding
                    if (rooms.find(r=>r.players.find(p=>p.token === json.data.token)) !== undefined) {
                        console.log("Room", rooms.find(r=>r.players.find(p=>p.token === json.data.token)))
                        let player = rooms.find(r=>r.players.find(p=>p.token === json.data.token)).players.find(p=>p.token === json.data.token);
                        console.log("Found player", player);
                        jwt.verify(json.data.token, 'mySecret', (err, decoded)=>{
                            console.log(decoded);
                            let playerIndex = room.players.indexOf(p=>p.token === json.data.token);
                            // room.players[playerIndex].socket = socket;
                            player.socket = socket;
                            let response = JSON.stringify({
                                type: 'join',
                                userID: decoded.id,
                                userColor: player.userColor,
                                fen: rooms[roomIndex].gameFen,
                                population: room.players.length,
                                message: `Player ${decoded.id} re-joined room ${roomID}`
                            });
                            rooms[roomIndex].players.forEach(d=>{
                                d.socket.send(response);
                            });
                        });

                        break;
                    }
                    let playerID = null;
                    jwt.verify(json.data.token, 'mySecret', (err, decoded)=>{
                        console.log("Decoded", decoded.id);
                        if (decoded.id !== null && decoded.id !== undefined) {
                            playerID = decoded.id;
                        }
                    });
                    // add player to room
                    // console.log(json);
                    let playerColor = '';
                    if (rooms[roomIndex].players.length === 0) {
                        playerColor = 'w';
                    } else if (rooms[roomIndex].players.length === 1) {
                        playerColor = 'b';
                    }
                    let response = JSON.stringify({
                        type: 'join',
                        userID: playerID, // ++idCount, // can't do it like this, use the token instead
                        userColor: playerColor,
                        fen: rooms[roomIndex].gameFen,
                        population: room.players.length,
                        message: `Player ${idCount} added to room ${roomID}`
                    });
                    socket.send(response);
                    rooms[roomIndex].players.push({userID: idCount, username: json.data.username, userColor: playerColor, token: json.data.token, socket: socket});
                    rooms[roomIndex].players.forEach(d=>d.socket.send(JSON.stringify({type: 'join-notification', notif: `${playerColor} joined`, population: rooms[roomIndex].players.length})));
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

app.get('/generateToken', jsonParser, function(req, res) {
    if (req.cookies.token !== undefined) {
        return res.json({token: req.cookies.token})
    }
    let token = jwt.sign({id: ++idCount}, 'mySecret', {
        expiresIn: '1d',
    });
    console.log(token);
    return res.json({token: token});
})

app.get('/', function (req, res) {
    console.log(req.cookies);
    res.sendFile(path.join(__dirname + '/public/index.html'))
})

app.get('/rooms', function(req, res) {
    res.json(rooms)
})

app.post('/makeRoom', jsonParser, function(req, res) {
    console.log(req.body);
    let newRoom = {id: idCount++, name: req.body.roomName, messages: [], players: [], gameFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'};
    rooms.push(newRoom);
    res.json({message: `New room with name ${req.body.roomName} created!`, data: newRoom})
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
app.post('/user/username', function(req, res) {
    // set username

})
app.listen('5000', function () {
    console.log('Node-chess running on port 5000')
})