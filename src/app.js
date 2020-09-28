import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import UserData from './UserData';
import UserOptions from './UserOptions';

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
      .then(json=>{
        alert(json.message);
        this.props.addRoom(json.data);
      }); 
    // event.preventDefault(); I don't think we need this but it's worth having here to remind myself of its existence
  }
  render() {
    return (
      <div className="flex-column">
      <h3>Make a New Room</h3>
      <label>Room Name: </label><input onChange={this.handleChange} value={this.state.value} type="text"></input>
      <button onClick={this.handleMakeRoom}>Make Room</button>
      </div>
    )
  }
}

class RoomList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {rooms: this.props.rooms};
  }
  
  render() {

    console.log("Creating list elements");
    let list = this.state.rooms.map((d,i)=>{
      return <li key={i}><a href={`/room/${d.id}`}>{d.name}</a></li>
    })
    console.log("List", list);
    console.log("State", this.state);
    return (
      <>
      <ul>
        <h3>Rooms</h3>
        {list}
      </ul>
      </>
    )
  }
  
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true, 
      rooms: [],
      username: sessionStorage.username !== undefined ? sessionStorage.username : '',
    }
    this.addRoom = this.addRoom.bind(this);
    this.updateUsername = this.updateUsername.bind(this);
  }
  componentDidMount() {
    fetch('/generateToken')
    .then(d=>d.json())
    .then(json=>{
      console.log(json);
      if (Object.fromEntries(document.cookie.split('; ').map(x => x.split('='))).token === undefined) {
        document.cookie = `token=${json.token}`;
      }
    })
    .then(()=>fetch('/rooms'))
    .then(d=>d.json())
    .then(d=>{
      this.setState({
        rooms: d,
        isLoading: false
      })
    });
  }
  updateUsername(username) {
    this.setState({
      username: username
    })
  }
  addRoom(newRoom) {
    // handler passed to MakeRoomForm
    this.state.rooms.push(newRoom);
    this.setState({rooms: this.state.rooms});
  }
  render() {
    if (this.state.isLoading) {
      return <p>Loading</p>
    }
    return ( 
      <>
      <div class="hero">
      <h1>Welcome to Node-Chess!</h1>
      </div>
      <div class="explainer">
      <p>Node-Chess allows you to make a room and play chess with your friends!</p>
      </div>
      <UserData username={this.state.username}/>
      <UserOptions username={this.state.username} updateUsername={this.updateUsername}/>
      <MakeRoomForm addRoom={this.addRoom} />
      <RoomList rooms={this.state.rooms} />
      </>
    ) 
  }
}



ReactDOM.render(<App />, document.querySelector('#root'))
