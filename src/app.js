import React from 'react';
import ReactDOM from 'react-dom';

class RoomList extends React.Component {
  componentDidMount() {
    fetch('/rooms')
      .then(resp=>resp.json())
      .then(data=>this.props.rooms = data);
    console.log(this.props.rooms);
  }
  render() {
    return (
      <ul>
        <li></li>
      </ul>
    )
  }
}

class App extends React.Component {
  render() {
    return ( 
      <>
      <RoomList />
      <h1>Welcome to Node-Chess!</h1>
      <p>Node-Chess allows you to make a room and play chess with your friends!</p>
      </>
    ) 
  }
}

ReactDOM.render(<App />, document.querySelector('#root'));
