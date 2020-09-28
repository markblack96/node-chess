import React from 'react';

class UserOptions extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        username: this.props.username,
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
      this.props.updateUsername(this.state.username);
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

  export default UserOptions;