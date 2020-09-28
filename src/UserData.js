import React from 'react';

class UserData extends React.Component {
    render() {
        let greeting = this.props.username !== '' ? `Hello, ${this.props.username}!` : `Start a room, and don't forget to give yourself a name!`;
        return (<div id="user-data">
        <p>{greeting}</p>
    </div>)
    }
}

export default UserData;