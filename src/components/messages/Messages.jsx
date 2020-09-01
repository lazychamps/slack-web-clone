import React, { Component } from "react";
import { Segment, Comment } from "semantic-ui-react";
import MessageHeader from "./MessageHeader";
import MessageForm from "./MessageForm";

class Messages extends Component {
  state = {};
  render() {
    return (
      <React.Fragment>
        <MessageHeader />
        <Segment>
          <Comment.Group className="messages"></Comment.Group>
        </Segment>
        <MessageForm />
      </React.Fragment>
    );
  }
}

export default Messages;
