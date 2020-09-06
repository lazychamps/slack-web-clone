import React, { Component } from "react";
import { Menu, Icon } from "semantic-ui-react";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions/index";

class Starred extends Component {
  state = { starredChannel: [], activeChannel: "" };

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
    const { starredChannel } = this.state;
    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="star" /> STARRED
          </span>{" "}
          ({starredChannel.length})
        </Menu.Item>
        {this.displayChannels(starredChannel)}
      </Menu.Menu>
    );
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(Starred);
