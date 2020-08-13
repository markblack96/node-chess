import React, { useState } from 'react';
import ReactDOM from 'react-dom';

class MakeRoomForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''}

    this.handleChange = this.handleChange.bind(this); // don't forget to bind these bad boys
    this.handleMakeRoom = this.handleMakeRoom.bind(this);
  }
  handleChange(event) {
    this.setState({value: event.target.value});
  }
  handleMakeRoom(event) {
    fetch('/makeRoom', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({roomName: this.state.value})})
      .then(resp=>resp.json())
      .then(json=>alert(json.message));
    // event.preventDefault(); I don't think we need this but it's worth having here to remind myself of its existence
  }
  render() {
    return (
      <>
      <h3>Make a new Room</h3>
      <label>Room Name: </label><input onChange={this.handleChange} value={this.state.value} type="text"></input>
      <button onClick={this.handleMakeRoom}>Make Room</button>
      </>
    )
  }
}

class RoomList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {rooms: []};
  }
  componentDidMount() {
    fetch('/rooms').then(d=>d.json())
      .then(d=>{
        console.log("setting state");
        this.setState({
          rooms: d
        })
        console.log(this.state);
        this.forceUpdate();
      });
  }
  render() {

    console.log("Creating list elements");
    let list = this.state.rooms.map((d)=>{
      return <li>{d.name}</li>
    })
    console.log("List", list);
    console.log("State", this.state);
    return (
      <>
      <ul>{list}</ul>
      </>
    )
  }
  
}

class App extends React.Component {
  render() {
    // let rooms = [{id: 1, room: "Hello, room"}];
    return ( 
      <>
      <h1>Welcome to Node-Chess!</h1>
      <p>Node-Chess allows you to make a room and play chess with your friends!</p>
      <RoomList />
      <MakeRoomForm />
      </>
    ) 
  }
}



ReactDOM.render(<App />, document.querySelector('#root'))
