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
    numUniqueUsers: "",
    searchTerm: "",
    searchLoading: false,
    searchResults: [],
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
      this.countUniqueUsers(loadedMessages);
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

  currentChannelName = (channel) => (channel ? `${channel.name}` : "");

  countUniqueUsers = (messages) => {
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name);
      }
      return acc;
    }, []);
    const numUniqueUsers = `${uniqueUsers.length} user${
      uniqueUsers.length > 1 ? "s" : ""
    }`;
    this.setState({ numUniqueUsers });
  };

  handleSearchChange = ({ target }) => {
    this.setState({ searchTerm: target.value, searchLoading: true }, () =>
      this.handleSearchMessages()
    );
  };

  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, "gi");
    const searchResults = channelMessages.reduce((acc, message) => {
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        acc.push(message);
      }
      return acc;
    }, []);

    this.setState({ searchResults });
    setTimeout(() => {
      this.setState({ searchLoading: false });
    }, 1000);
  };

  render() {
    // prettier-ignore
    const { messagesRef, messages, numUniqueUsers, searchTerm, searchResults, searchLoading } = this.state;
    const { currentChannel } = this.props;
    return (
      <React.Fragment>
        <MessageHeader
          channelName={this.currentChannelName(currentChannel)}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
        />
        <Segment>
          <Comment.Group className="messages">
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
          </Comment.Group>
        </Segment>
        <MessageForm messagesRef={messagesRef} />
      </React.Fragment>
    );
  }
}

export default Messages;
