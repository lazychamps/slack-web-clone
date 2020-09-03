import React from "react";
import { connect } from "react-redux";
import { Comment, Image } from "semantic-ui-react";
import moment from "moment";

const isOwnMsg = (message, currentUser) => {
  return message.user.id === currentUser.uid ? "message__self" : "";
};

const timeFromNow = (timestamp) => moment(timestamp).fromNow();

const isImage = (message) => message.image;

export const Message = ({ message, currentUser }) => {
  return (
    <Comment>
      <Comment.Avatar src={message.user.avatar} />
      <Comment.Content className={isOwnMsg(message, currentUser)}>
        <Comment.Author as="a">{message.user.name}</Comment.Author>
        <Comment.Metadata>{timeFromNow(message.timestamp)}</Comment.Metadata>
        {isImage(message) ? (
          <Image src={message.image} className="message__image" />
        ) : (
          <Comment.Text>{message.content}</Comment.Text>
        )}
      </Comment.Content>
    </Comment>
  );
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Message);
