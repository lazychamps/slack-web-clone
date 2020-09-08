import React, { Component } from "react";
import { Menu, Icon } from "semantic-ui-react";
import { connect } from "react-redux";
import firebase from "../../firebase";
import { setCurrentChannel, setPrivateChannel } from "../../actions/index";

class Starred extends Component {
  state = {
    starredChannels: [],
    activeChannel: "",
    usersRef: firebase.database().ref("users"),
  };

  componentDidMount() {
    const { currentUser } = this.props;
    if (currentUser) {
      this.addListeners(currentUser.uid);
    }
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  removeListeners = () => {
    this.state.usersRef.child(`${this.props.currentUser.uid}/starred`).off();
  };

  addListeners = (userId) => {
    const { usersRef } = this.state;
    usersRef
      .child(userId)
      .child("starred")
      .on("child_added", (snap) => {
        const starredChannel = { id: snap.key, ...snap.val() };
        this.setState({
          starredChannels: [...this.state.starredChannels, starredChannel],
        });
      });

    usersRef
      .child(userId)
      .child("starred")
      .on("child_removed", (snap) => {
        const channelToRemove = { id: snap.key, ...snap.val() };
        const filteredChannels = this.state.starredChannels.filter(
          (starredChannel) => starredChannel.id !== channelToRemove.id
        );
        this.setState({
          starredChannels: filteredChannels,
        });
      });
  };

  changeChannel = (channel) => {
    console.log({ channel });

    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
  };

  displayChannels = (starredChannel) =>
    starredChannel.length > 0 &&
    starredChannel.map((channel) => {
      const { currentChannel } = this.props;
      return (
        <Menu.Item
          key={channel.id}
          name={channel.name}
          style={{ opacity: 0.7 }}
          active={currentChannel && channel.id === currentChannel.id}
          onClick={() => {
            this.changeChannel(channel);
          }}
        >
          # {channel.name}
        </Menu.Item>
      );
    });

  render() {
    const { starredChannels } = this.state;
    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="star" /> STARRED
          </span>{" "}
          ({starredChannels.length})
        </Menu.Item>
        {this.displayChannels(starredChannels)}
      </Menu.Menu>
    );
  }
}

const mapStateToProps = (state) => ({
  currentUser: state.userReducer.currentUser,
  currentChannel: state.channelReducer.currentChannel,
});

export default connect(mapStateToProps, {
  setCurrentChannel,
  setPrivateChannel,
})(Starred);
