import React, { Component } from "react";
import { Menu, Icon, Modal, Form, Input, Button } from "semantic-ui-react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentChannel } from "../../actions/index";

class Channels extends Component {
  state = {
    channels: [],
    modal: false,
    channelName: "",
    channelDetails: "",
    channelRef: firebase.database().ref("channels"),
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
      console.log(channels);
    });
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
          # {channel.name}
        </Menu.Item>
      );
    });

  render() {
    const { channels, modal } = this.state;
    return (
      <React.Fragment>
        <Menu.Menu>
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

export default connect(mapStateToProps, { setCurrentChannel })(Channels);
