import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import UserData from './UserData'
import session from 'express-session';

class UserOptions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
    }
    this.handleChange = this.handleChange.bind(this);
    this.saveUserInfo = this.saveUserInfo.bind(this);
  }
  componentDidMount() {
    this.setState({username: sessionStorage.username !== undefined ? sessionStorage.username : ''})
  }
  handleChange(event) {
    this.setState({username: event.target.value})
  }
  saveUserInfo() {
    // write user info to session storage and use cookie to hold session token
    sessionStorage.setItem('username', this.state.username);
  }
  render() {
    return (
      <div id="user-options" className="flex-column">
        <h3>User Options</h3>
        <label>Username:</label>
        <input type="text" name="username" placeholder={this.state.username} onChange={this.handleChange}></input>
        <button onClick={this.saveUserInfo}>Save</button>
      </div>
    )
  }
}

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
      /* }).then(()=>{
        // this.props.addRoom({name: this.state.value});
        this.props.addROom()*/
      }); 
    // event.preventDefault(); I don't think we need this but it's worth having here to remind myself of its existence
  }
  render() {
    return (
      <div className="flex-column">
      <h3>Make a new Room</h3>
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
    this.state = {isLoading: true, rooms: []}
    this.addRoom = this.addRoom.bind(this);
  }
  componentDidMount() {
    fetch('/generateToken')
    .then(d=>d.json())
    .then(json=>{
      console.log(json);
      document.cookie = `token=${json.token}`;
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
  addRoom(newRoom) {
    // handler passed to MakeRoomForm
    this.state.rooms.push(newRoom);
    this.setState({rooms: this.state.rooms});
  }
  render() {
    // let rooms = [{id: 1, room: "Hello, room"}];
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
      <UserData username={sessionStorage.username}/>
      <UserOptions />
      <MakeRoomForm addRoom={this.addRoom}/>
      <RoomList rooms={this.state.rooms} />
      </>
    ) 
  }
}



ReactDOM.render(<App />, document.querySelector('#root'))
