import React, { useState } from 'react';
import ReactDOM from 'react-dom';

class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messageHistory: [], 
            currentMessage: '', 
            roomID: this.props.roomID,
            userID: null,
            socket: new WebSocket('ws://localhost:3000')
        }

        fetch('/messages/' + this.state.roomID)
            .then(resp=>resp.json())
            .then(json=>this.setState({messageHistory: json}));

        this.state.socket.onmessage = (d) => {
            let data = JSON.parse(d.data);
            if (data.type === 'join') {
                console.log(data.userID);
                this.setState({userID: data.userID})
            }
            if (data.type === 'message') {
                this.setState({messageHistory: data.messageHistory})
            }
            console.log(d);
        }
        this.state.socket.onopen = (d) => {
            this.state.socket.send(JSON.stringify({type: "join", data: {
                roomID: this.state.roomID
            }}))
        }
        // this.getMessages = this.getMessages.bind(this);
        this.updateMessageHistory = this.updateMessageHistory.bind(this);
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
        /*fetch('/sendMessage', 
        {
            method: 'POST', 
            body: JSON.stringify({
                roomID: parseInt(document.URL.split('/')[4]), 
                message: {from: "player", message: this.state.currentMessage}
            }), 
            headers: {"Content-Type": "application/json"}
        })
        .then(resp=>resp.json())
        .then(d=>this.updateMessageHistory(d));*/
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
        console.log(this.state);
    }
    render() {
        let messages = this.state.messageHistory.map((d)=>{
            return <p>{d}</p>
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
            roomID: parseInt(document.URL.split('/')[4]),
        }
        let roomID = this.state.roomID;
        /* fetch('/joinGame', {
            method: "POST",
            headers: {"Content-Type": "application/json"}, 
            body: JSON.stringify({room: roomID})
            
        }).then(resp=>resp.json())
        .then(json=>console.log(json));
        */
    }
    render() {
        return (
            <Chat roomID={this.state.roomID} />
        )
    }
}


ReactDOM.render(<Room />, document.querySelector('#root'))