import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Chess from 'chess.js';
import Chessboard from 'chessboardjsx';

let chess = new Chess();

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userColor: this.props.userColor,
            roomID: this.props.roomID,
            socket: this.props.socket,
            fen:  this.props.position, //'start'  // 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' // starting position
        }
        console.log("State at constructor", this.state);
        this.state.socket.onmessage = (d) => {
            let data = JSON.parse(d.data);
            console.log(data);
            if (data.type === 'move') {
                console.log("Move received");
                this.setState({fen: data.fen})
                // this.game.position = this.state.fen;
            }
        } 

        /*
        this.state.socket.onmessage = (d) => {
            let data = JSON.parse(d.data);
            if (data.type === 'message') {
                this.setState({messageHistory: data.messageHistory})
            }
        }

        */
        this.sendMove = this.sendMove.bind(this);
        this.onDrop = this.onDrop.bind(this);
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
        this.game = chess;
    }
    onDrop({ sourceSquare, targetSquare }) {
        if (this.game.turn() !== this.state.userColor) return; // escape before move is made
        let move = this.game.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q'
        })
        console.log(move);
        if (move === null) return; // if null move is illegal
        this.setState({
            fen: this.game.fen(),
            // history: this.game.history({ verbose: true }),
        })
        this.sendMove();
    }
    render() {
        return (
            <Chessboard position={this.state.fen} onDrop={this.onDrop} />
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

        this.state.socket.onmessage = (d) => {
            let data = JSON.parse(d.data);
            if (data.type === 'message') {
                this.setState({messageHistory: data.messageHistory})
            }
        } 
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
                roomID: this.state.roomID
            }
        }));

    }
    handleChange(event) {
        this.setState({currentMessage: event.target.value});
    }
    render() {
        let messages = this.state.messageHistory.map((d)=>{
            return <p>{d.from}: {d.message}</p>
          })
        return(
            <>
            <div id="messageHistory">
                {messages}
            </div>
            <div id="messageEntry">
                <textarea onChange={this.handleChange} value={this.state.currentMessage}></textarea>
                <button onClick={this.sendMessage}>Send Message</button>
            </div>
            </>
        )
    }
}

class Room extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messageHistory: [], 
            userColor: null,
            userID: null,
            roomID: parseInt(document.URL.split('/')[4]),
            fen: 'start',
            socket: new WebSocket('ws://localhost:3000'),
            isLoading: true // least hacky solution to get userID to be passed to children
        }

        fetch('/messages/' + this.state.roomID)
            .then(resp=>resp.json())
            .then(json=>this.setState({messageHistory: json}));

        this.state.socket.onopen = (d) => {
            this.state.socket.send(JSON.stringify({type: "join", data: {
                roomID: this.state.roomID
            }}))
        }
        this.state.socket.onmessage = (d) => {
            console.log(d);
            let data = JSON.parse(d.data);
            if (data.type === 'join') {
                this.setState({userID: data.userID, userColor: data.userColor, fen: data.fen, isLoading: false})
            }
        }
        
    }
    render() {
        if (this.state.isLoading) {
            return <p>Loading...</p>;
        }
        return (
            <>
            <Game roomID={this.state.roomID} socket={this.state.socket} userID={this.state.userID} userColor={this.state.userColor} position={this.state.fen}/>
            <Chat roomID={this.state.roomID} socket={this.state.socket} userID={this.state.userID} messageHistory={this.state.messageHistory}/>
            </>
        )
    }
}


ReactDOM.render(<Room />, document.querySelector('#root'))