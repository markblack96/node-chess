import React from 'react';
import ReactDOM from 'react-dom';
import Chess from 'chess.js';
import Chessboard from 'chessboardjsx';



class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            width: window.innerWidth * 0.4,
            userColor: this.props.userColor,
            roomID: this.props.roomID,
            socket: this.props.socket,
            fen:  this.props.position, //'start'  // 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' // starting position
        }
        console.log("State at constructor", this.state);
        /*
        this.state.socket.onmessage = (d) => {
            let data = JSON.parse(d.data);
            console.log(data);
            if (data.type === 'move') {
                console.log("Move received");
                this.setState({fen: data.fen})
                // this.game.position = this.state.fen;
            }
        } 
        */
        this.sendMove = this.sendMove.bind(this);
        this.onDrop = this.onDrop.bind(this);
        window.addEventListener('resize', ()=>{
            console.log(this.state.width);
            this.setState({
                width: window.innerWidth * 0.4,
            })
        })
    }
    sendMove() {
        this.state.socket.send(JSON.stringify({
            type: "move",
            data: {
                newFen: this.game.fen(),
                roomID: this.state.roomID
            }
        }));
    }
    componentDidMount() {
        console.log("this.props.position", this.props.position)
        let chess = new Chess(this.props.position);
        this.game = chess;
    }
    onDrop({ sourceSquare, targetSquare }) {
        console.log("this.game.fen()", this.game.fen());
        console.log(this.game.turn() !== this.state.userColor);
        console.log(this.game.turn(),this.state.userColor)
        console.log("this.props.population < 2?", this.props.population < 2);
        if (this.game.turn() !== this.state.userColor) return; // escape before move is made
        if (this.props.population < 2) return;
        let move = this.game.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q'
        })
        if (move === null) return; // if null move is illegal
        this.setState({
            fen: this.game.fen(),
            // history: this.game.history({ verbose: true }),
        })
        this.props.handlePositionChange(this.game.fen());
        this.sendMove();
    }
    render() {
        let factor = 0.4; // default for desktop
        if (window.innerWidth <= 800) { // tablets and below get special styling
            factor = 0.8;
        }
        let width = window.innerWidth * factor;
        return (
            <div class="flex-fill" id="board-container">
            <Chessboard position={this.state.fen} onDrop={this.onDrop} width={width} />
            </div>
        )
    }
}

class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messageHistory: this.props.messageHistory,
            currentMessage: '', 
            roomID: this.props.roomID,
            userID: this.props.userID,
            socket: this.props.socket
        }
        /*
        this.state.socket.onmessage = (d) => {
            let data = JSON.parse(d.data);
            if (data.type === 'message') {
                this.setState({messageHistory: data.messageHistory})
            }
        } */
        this.sendMessage = this.sendMessage.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    updateMessageHistory(messageHistory) {
        this.setState({messageHistory: messageHistory})
    }
    upgradeToWebSocket() {
        let socket = new WebSocket('ws://localhost:3000');
    }
    sendMessage() {
        this.state.socket.send(JSON.stringify({
            type: "chat",
            data: {
                message: this.state.currentMessage,
                from: this.state.userID,
                username: sessionStorage.username !== undefined ? sessionStorage.username : `No Name#${this.state.userID}`,
                roomID: this.state.roomID
            }
        }));
        this.setState({currentMessage: ''});
    }
    handleChange(event) {
        this.setState({currentMessage: event.target.value});
    }
    render() {
        let messages = this.state.messageHistory.map((d)=>{
            return <p><span className="username">{d.username}</span>: {d.message}</p>
          })
        return(
            <div class="flex-column" id="chat-container">
            <div id="messageHistory" class="flex-fill">
                {messages}
            </div>
            <div id="messageEntry">
                <textarea onChange={this.handleChange} value={this.state.currentMessage}></textarea>
                <button onClick={this.sendMessage}>Send Message</button>
            </div>
            </div>
        )
    }
}

class Room extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            population: 0,
            messageHistory: [], 
            userColor: null,
            userID: null,
            username: sessionStorage.getItem('username'),
            roomID: document.URL.split('/')[4],
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            socket: new WebSocket('ws://localhost:3000'),
            token: Object.fromEntries(document.cookie.split('; ').map(x => x.split('='))).token,
            isLoading: true // least hacky solution to get userID to be passed to children
        }
    }
    componentDidMount() {
        if (this.state.token === undefined) {
            // fetch a token
            fetch('/generateToken')
                .then(d=>d.json())
                .then(json=>{
                    console.log(json);
                    document.cookie = `token=${json.token}`;
                    this.setState({token: Object.fromEntries(document.cookie.split('; ').map(x => x.split('='))).token})
                })
        }
        fetch('/messages/' + this.state.roomID)
            .then(resp=>resp.json())
            .then(json=>this.setState({messageHistory: json}));

        this.state.socket.onopen = (d) => {
            this.state.socket.send(JSON.stringify({type: "join", data: {
                roomID: this.state.roomID,
                username: sessionStorage.getItem('username'),
                token: this.state.token,
            }}))
        }
        this.state.socket.onmessage = (d) => {
            console.log(d);
            let data = JSON.parse(d.data);
            if (data.type === 'join') {
                this.setState({userID: data.userID, userColor: data.userColor, fen: data.fen, population: data.population, isLoading: false})
            }
            if (data.type === 'move') {
                console.log("Move received");
                console.log(data.fen);
                this.game.game.load(data.fen);
                this.game.setState({fen: data.fen})
                // this.game.position = this.state.fen;
            }
            if (data.type === 'message') {
                this.chat.setState({messageHistory: data.messageHistory})
            }
            if (data.type === 'join-notification') {
                this.setState({
                    population: data.population,
                });
                console.log(data.population);
            }
        }
    }
    handlePositionChange(newPosition) {
        this.setState({fen: newPosition})
    }
    render() {
        if (this.state.isLoading) {
            return <p>Loading...</p>;
        }
        return (
            <div id="room-container" className="flex-column">
            <div id="header">
                <a href="/">Home</a>
            </div>
            <div className="flex" id="game-container">
                <Game 
                    ref={(r)=>{this.game = r}} 
                    roomID={this.state.roomID} 
                    socket={this.state.socket} userID={this.state.userID} 
                    handlePositionChange={this.handlePositionChange.bind(this)} 
                    userColor={this.state.userColor} position={this.state.fen} 
                    population={this.state.population}
                />
                <Chat 
                    ref={(r)=>{this.chat = r}} 
                    roomID={this.state.roomID} 
                    socket={this.state.socket} 
                    userID={this.state.userID} 
                    messageHistory={this.state.messageHistory}
                />
            </div>
            </div>
        )
    }
}


ReactDOM.render(<Room />, document.querySelector('#root'))