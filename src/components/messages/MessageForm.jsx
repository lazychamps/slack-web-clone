import React, { Component } from "react";
import { Segment, Input, Button } from "semantic-ui-react";
import { connect } from "react-redux";
import firebase from "firebase";

class MessageForm extends Component {
  state = { message: "", loading: false, errors: [] };

  handleChange = ({ target }) => {
    const restErrors = this.state.errors.filter((error) => !error[target.name]);
    this.setState({ [target.name]: target.value, errors: restErrors });
  };

  createMessage = () => {
    const { displayName, uid, photoURL } = this.props.currentUser;
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: uid,
        name: displayName,
        avatar: photoURL,
      },
      content: this.state.message,
    };
    return message;
  };

  sendMessage = async () => {
    const { message, errors } = this.state;
    const { messagesRef, currentChannel } = this.props;

    if (message) {
      this.setState({ loading: true });
      try {
        await messagesRef
          .child(currentChannel.id)
          .push()
          .set(this.createMessage());
        this.setState({ loading: false, message: "", errors: [] });
      } catch (error) {
        console.log(error);
        this.setState({ loading: false, errors: [...errors, error] });
      }
    } else {
      this.setState({ errors: [...errors, { message: "Add a message" }] });
    }
  };

  render() {
    const { message, errors, loading } = this.state;
    return (
      <Segment className="messages__form">
        <Input
          fluid
          name="message"
          style={{ marginBottom: "0.7rem" }}
          label={<Button icon="add" />}
          labelPosition="left"
          value={message}
          placeholder="Write your message"
          onChange={this.handleChange}
          className={
            errors.some((error) => error.message.includes("message"))
              ? "error"
              : ""
          }
        />
        <Button.Group icon widths={2}>
          <Button
            color="orange"
            content="Add Reply"
            labelPosition="left"
            icon="edit"
            disabled={loading}
            onClick={this.sendMessage}
          />
          <Button
            color="teal"
            content="Upload Media"
            labelPosition="right"
            icon="cloud upload"
          />
        </Button.Group>
      </Segment>
    );
  }
}

const mapStateToProps = (state) => ({
  currentChannel: state.channelReducer.currentChannel,
  currentUser: state.userReducer.currentUser,
});

export default connect(mapStateToProps)(MessageForm);
