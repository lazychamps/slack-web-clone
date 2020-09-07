import React, { Component } from "react";
import { Segment, Comment } from "semantic-ui-react";

import MessageHeader from "./MessageHeader";
import MessageForm from "./MessageForm";
import firebase from "../../firebase";
import Message from "./Message";
import { setUserPosts } from "../../actions/index";
import { connect } from "react-redux";
import Typing from "./Typing";

class Messages extends Component {
  state = {
    messagesRef: firebase.database().ref("messages"),
    privateMessageRef: firebase.database().ref("privateMessages"),
    usersRef: firebase.database().ref("users"),
    typingRef: firebase.database().ref("typing"),
    connectedRef: firebase.database().ref(".info/connected"),
    messages: [],
    messagesLoading: true,
    numUniqueUsers: "",
    searchTerm: "",
    searchLoading: false,
    searchResults: [],
    isChannelStarred: false,
    typingUsers: [],
  };

  componentDidMount() {
    const { currentUser, currentChannel } = this.props;
    if (currentUser && currentChannel) {
      this.addListeners(currentChannel.id);
      this.addUserStarsListener(currentChannel.id, currentUser.uid);
    }
  }

  addUserStarsListener = async (channelId, userId) => {
    const { usersRef } = this.state;
    const starredData = await usersRef
      .child(userId)
      .child("starred")
      .once("value");
    if (starredData.val() !== null) {
      const channelIds = Object.keys(starredData.val());
      const prevStarred = channelIds.includes(channelId);
      this.setState({ isChannelStarred: prevStarred });
    }
  };

  addListeners = (channelId) => {
    this.addMessageListener(channelId);
    this.addTypingListener(channelId);
  };

  addTypingListener = (channelId) => {
    const { currentUser } = this.props;
    const { typingRef, connectedRef } = this.state;
    let typingUsers = [];
    typingRef.child(channelId).on("child_added", (snap) => {
      if (snap.key !== currentUser.uid) {
        typingUsers = [...typingUsers, { id: snap.key, name: snap.val() }];
        this.setState({ typingUsers });
      }
    });

    typingRef.child(channelId).on("child_removed", (snap) => {
      const index = typingUsers.findIndex((user) => user.id === snap.key);
      if (index !== -1) {
        typingUsers = typingUsers.filter((user) => user.id !== snap.key);
        this.setState({ typingUsers });
      }
    });

    connectedRef.on("value", (snap) => {
      if (snap.val() === true) {
        this.state.typingRef
          .child(channelId)
          .child(currentUser.uid)
          .onDisconnect()
          .remove((error) => {
            if (error !== null) {
              console.log(error);
            }
          });
      }
    });
  };

  addMessageListener = (channelId) => {
    let loadedMessages = [];
    const ref = this.getMessagesRef();
    ref.child(channelId).on("child_added", (snap) => {
      loadedMessages.push(snap.val());
      this.setState({ messages: loadedMessages, messagesLoading: false });
      this.countUniqueUsers(loadedMessages);
      this.countUserPosts(loadedMessages);
    });
  };

  getMessagesRef = () =>
    this.props.isPrivateChannel
      ? this.state.privateMessageRef
      : this.state.messagesRef;

  displayMessages = (messages) =>
    messages.map((message) => (
      <Message
        key={message.timestamp}
        message={message}
        currentUser={this.props.currentUser}
      />
    ));

  currentChannelName = (channel) => {
    const { isPrivateChannel } = this.props;
    return channel ? `${isPrivateChannel ? "@" : "#"}${channel.name}` : "";
  };

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

  countUserPosts = (messages) => {
    let userPosts = messages.reduce((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name].count += 1;
      } else {
        acc[message.user.name] = {
          avatar: message.user.avatar,
          count: 1,
        };
      }
      return acc;
    }, {});
    this.props.setUserPosts(userPosts);
  };

  handleSearchChange = ({ target }) => {
    this.setState({ searchTerm: target.value, searchLoading: true }, () =>
      this.handleSearchMessages()
    );
  };

  handleStar = () => {
    this.setState(
      (prevState) => {
        return { isChannelStarred: !prevState.isChannelStarred };
      },
      () => this.starChannel()
    );
  };

  starChannel = () => {
    const { isChannelStarred, usersRef } = this.state;
    const { currentUser, currentChannel } = this.props;
    const copyOfCurrentChannel = { ...currentChannel };
    delete copyOfCurrentChannel.id;
    if (isChannelStarred) {
      usersRef.child(`${currentUser.uid}/starred`).update({
        [currentChannel.id]: copyOfCurrentChannel,
      });
    } else {
      usersRef
        .child(`${currentUser.uid}/starred`)
        .child(currentChannel.id)
        .remove();
    }
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

  displayTypingUsers = (users) =>
    users.length > 0 &&
    users.map((user) => (
      <div key={user.id} style={{ display: "flex", marginBottom: "0.2em" }}>
        <span className="user__typing">{user.name} is typing</span>
        <Typing />
      </div>
    ));

  render() {
    // prettier-ignore
    const { messagesRef, messages, numUniqueUsers, searchTerm, searchResults, searchLoading, isChannelStarred, typingUsers } = this.state;
    const { currentChannel, isPrivateChannel } = this.props;
    return (
      <React.Fragment>
        <MessageHeader
          channelName={this.currentChannelName(currentChannel)}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          isPrivateChannel={isPrivateChannel}
          handleStar={this.handleStar}
          isChannelStarred={isChannelStarred}
        />
        <Segment>
          <Comment.Group className="messages">
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
            {this.displayTypingUsers(typingUsers)}
          </Comment.Group>
        </Segment>
        <MessageForm
          messagesRef={messagesRef}
          getMessagesRef={this.getMessagesRef}
        />
      </React.Fragment>
    );
  }
}

export default connect(null, { setUserPosts })(Messages);
