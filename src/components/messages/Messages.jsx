import React, { Component } from "react";
import { Segment, Comment } from "semantic-ui-react";

import MessageHeader from "./MessageHeader";
import MessageForm from "./MessageForm";
import firebase from "../../firebase";
import Message from "./Message";

class Messages extends Component {
  state = {
    messagesRef: firebase.database().ref("messages"),
    messages: [],
    messagesLoading: true,
  };

  componentDidMount() {
    const { currentUser, currentChannel } = this.props;
    if (currentUser && currentChannel) {
      this.addListeners(currentChannel.id);
    }
  }

  addListeners = (channelId) => {
    this.addMessageListener(channelId);
  };

  addMessageListener = (channelId) => {
    let loadedMessages = [];
    const { messagesRef } = this.state;
    messagesRef.child(channelId).on("child_added", (snap) => {
      loadedMessages.push(snap.val());
      this.setState({ messages: loadedMessages, messagesLoading: false });
    });
  };

  displayMessages = (messages) =>
    messages.map((message) => (
      <Message
        key={message.timestamp}
        message={message}
        currentUser={this.props.currentUser}
      />
    ));

  render() {
    const { messagesRef, messages } = this.state;
    return (
      <React.Fragment>
        <MessageHeader />
        <Segment>
          <Comment.Group className="messages">
            {this.displayMessages(messages)}
          </Comment.Group>
        </Segment>
        <MessageForm messagesRef={messagesRef} />
      </React.Fragment>
    );
  }
}

export default Messages;
