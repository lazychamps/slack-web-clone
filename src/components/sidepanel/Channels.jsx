import React, { Component } from "react";
import {
  Menu,
  Icon,
  Modal,
  Form,
  Input,
  Button,
  Label,
} from "semantic-ui-react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions/index";

class Channels extends Component {
  state = {
    channels: [],
    modal: false,
    channelName: "",
    channelDetails: "",
    channelRef: firebase.database().ref("channels"),
    channel: null,
    messagesRef: firebase.database().ref("messages"),
    notifications: [],
  };

  componentDidMount() {
    this.addListeners();
  }

  addListeners = () => {
    let channels = [];
    const { channelRef } = this.state;
    channelRef.on("child_added", (snap) => {
      channels.push(snap.val());
      this.setState({ channels }, () => this.changeChannel(channels[0]));
      this.addNotificationListener(snap.key);
      console.log(channels);
    });
  };

  addNotificationListener = (channelId) => {
    this.state.messagesRef.child(channelId).on("value", (snap) => {
      if (this.state.channel) {
        this.handleNotifications(
          channelId,
          this.state.channel.id,
          this.state.notifications,
          snap
        );
      }
    });
  };

  handleNotifications = (channelId, currentChannelId, notifications, snap) => {
    let lastTotal = 0;
    let index = notifications.findIndex(
      (notification) => notification.id === channelId
    );

    if (index !== -1) {
      if (channelId !== currentChannelId) {
        lastTotal = notifications[index].total;
        if (snap.numChildren() - lastTotal > 0) {
          notifications[index].count = snap.numChildren() - lastTotal;
        }
      }
      notifications[index].lastKnownTotal = snap.numChildren();
    } else {
      notifications.push({
        id: channelId,
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        count: 0,
      });
    }
    this.setState({ notifications });
  };

  clearNotifications = () => {
    let index = this.state.notifications.findIndex(
      (notification) => notification.id === this.state.channel.id
    );

    if (index !== -1) {
      let updatedNotifications = [...this.state.notifications];
      updatedNotifications[index].total = this.state.notifications[
        index
      ].lastKnownTotal;
      updatedNotifications[index].count = 0;
      this.setState({ notifications: updatedNotifications });
    }
  };

  getNotificationCount = (channel) => {
    let count = 0;
    this.state.notifications.forEach((notification) => {
      if (notification.id === channel.id) {
        count = notification.count;
      }
    });

    if (count > 0) {
      return count;
    }
  };

  componentWillUnmount() {
    const { channelRef } = this.state;
    channelRef.off("child_added");
  }

  isFormValid = ({ channelName, channelDetails }) => {
    return channelName && channelDetails;
  };

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.isFormValid(this.state)) {
      this.addChannel();
    }
  };

  addChannel = async () => {
    const { channelRef, channelName, channelDetails } = this.state;
    const { photoURL, displayName } = this.props.currentUser;
    const key = channelRef.push().key;

    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: displayName,
        avatar: photoURL,
      },
    };
    try {
      await channelRef.child(key).update(newChannel);
      this.setState({ channelName: "", channelDetails: "", modal: false });
    } catch (error) {
      console.log(error);
    }
  };

  closeModal = () => {
    this.setState({ modal: false });
  };

  openModal = () => {
    this.setState({ modal: true });
  };

  handleChange = ({ target }) => {
    this.setState({ [target.name]: target.value });
  };

  changeChannel = (channel) => {
    console.log({ channel });

    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
    this.setState({ channel }, () => this.clearNotifications());
  };

  displayChannels = (channels) =>
    channels.length > 0 &&
    channels.map((channel) => {
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
          {this.getNotificationCount(channel) && (
            <Label color="red">{this.getNotificationCount(channel)}</Label>
          )}
          # {channel.name}
        </Menu.Item>
      );
    });

  render() {
    const { channels, modal } = this.state;
    return (
      <React.Fragment>
        <Menu.Menu className="menu">
          <Menu.Item>
            <span>
              <Icon name="exchange" /> CHANNELS
            </span>{" "}
            ({channels.length})<Icon name="add" onClick={this.openModal} />
          </Menu.Item>
          {this.displayChannels(channels)}
        </Menu.Menu>

        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Add a Channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Name of Channel"
                  name="channelName"
                  onChange={this.handleChange}
                />
              </Form.Field>

              <Form.Field>
                <Input
                  fluid
                  label="About the Channel"
                  name="channelDetails"
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSubmit}>
              <Icon name="checkmark" /> Add
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
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
})(Channels);
