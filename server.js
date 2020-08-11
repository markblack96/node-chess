const express = require('express');
const path = require('path');

const app = express();

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'))
})

app.get('/rooms', function(req, res) {
    res.json([
        {id: 1, name: "Peewee's Playhouse"},
        {id: 2, name: "The White House"},
        {id: 3, name: "The Boiler Room"}
    ])
})

app.listen('5000', function () {
    console.log('Node-chess running on port 5000')
})