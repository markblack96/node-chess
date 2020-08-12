import React, { useState } from 'react';
import ReactDOM from 'react-dom';


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
      </>
    ) 
  }
}



ReactDOM.render(<App />, document.querySelector('#root'))
