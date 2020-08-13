const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const jsonParser = bodyParser.json()

var rooms = [
    {id: 1, name: "Peewee's Playhouse", messages: [
        {from: 'player1', message: 'Hello, world!'}, 
        {from: 'player2', message: 'Hello, player1!'}
    ]},
    {id: 2, name: "The White House", messages: []},
    {id: 3, name: "The Boiler Room", messages: []}
]
var idCount = 3;

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
    let messages = rooms.find((room=>room.id===roomID)).messages;
    res.json(messages);
})

app.post('/sendMessage', jsonParser, function(req, res){
    let room = rooms.find(room=>room.id===req.body.roomID);
    room.messages.push(req.body.message);
    res.json(room.messages);
})

app.listen('5000', function () {
    console.log('Node-chess running on port 5000')
})