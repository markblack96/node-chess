import React, { useState } from 'react';
import ReactDOM from 'react-dom';

class Chat extends React.Component {
    constructor() {
        super(props);
        this.state = {messageHistory: [], currentMessage: ''}

        this.getMessages = this.getMessages.bind(this);
        this.updateMessageHistory = this.updateMessageHistory.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
    }
    getMessages() {
        fetch('/messages')
    }
    updateMessageHistory(message) {
        this.setState({messageHistory: messageHistory.push(message)})
    }
    sendMessage() {
        fetch('/sendMessages', {method: 'POST', body: JSON.stringify({roomID: null})})
    }
    render() {
        let messages = this.state.messageHistory.map((d)=>{
            return <p>{d.message}</p>
          })
        return(
            <>
            <div id="messageHistory">
                {messages}
            </div>
            <div id="messageEntry">
                <textarea value={this.state.currentMessage}></textarea>
                <button>Send Message</button>
            </div>
            </>
        )
    }
}

class Room extends React.Component {
    render() {
        return (
            <p>A room will go here!</p>
        )
    }
}


ReactDOM.render(<Room />, document.querySelector('#root'))