import React, { Component } from "react";
import { Segment, Input, Button } from "semantic-ui-react";
import { connect } from "react-redux";
import firebase from "firebase";
import uuidv4 from "uuid/v4";
import { FileModal } from "./FileModal";
import ProgressBar from "./ProgressBar";

class MessageForm extends Component {
  state = {
    message: "",
    loading: false,
    errors: [],
    modal: false,
    uploadState: "",
    uploadTask: null,
    percentUploaded: 0,
    storageRef: firebase.storage().ref(),
    typingRef: firebase.database().ref("typing"),
  };

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  getPath = () => {
    const { isPrivateChannel, currentChannel } = this.props;
    return isPrivateChannel
      ? `chat/private/${currentChannel.id}`
      : `chat/public`;
  };

  uploadFile = (file, metaData) => {
    const { currentChannel, getMessagesRef } = this.props;
    const { storageRef } = this.state;
    const pathToUpload = currentChannel.id;
    const filePath = `chat/public/${uuidv4()}.jpg`;
    this.setState(
      {
        uploadState: "uploading",
        uploadTask: storageRef.child(filePath).put(file, metaData),
      },
      () => {
        this.state.uploadTask.on(
          "state_changed",
          (snap) => {
            const percentUploaded = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            this.setState({ percentUploaded });
          },
          (err) => {
            console.log(err);
            this.setState({
              errors: [...this.state.errors, err],
              uploadTask: null,
              uploadState: "error",
            });
          },
          () => {
            this.state.uploadTask.snapshot.ref
              .getDownloadURL()
              .then((downloadURL) => {
                this.sendFileMessage(
                  downloadURL,
                  getMessagesRef(),
                  pathToUpload
                );
              })
              .catch((err) => {
                console.log(err);
                this.setState({
                  errors: [...this.state.errors, err],
                  uploadTask: null,
                  uploadState: "error",
                });
              });
          }
        );
      }
    );
    console.log({ file, metaData });
  };

  sendFileMessage = async (downloadURL, messagesRef, pathToUpload) => {
    try {
      await messagesRef
        .child(pathToUpload)
        .push()
        .set(this.createMessage(downloadURL));

      this.setState({
        uploadState: "done",
      });
    } catch (error) {
      this.setState({
        errors: [...this.state.errors, error],
      });
    }
  };

  handleChange = ({ target }) => {
    const restErrors = this.state.errors.filter((error) => !error[target.name]);
    this.setState({ [target.name]: target.value, errors: restErrors });
  };

  createMessage = (fileUrl = null) => {
    const { displayName, uid, photoURL } = this.props.currentUser;
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: uid,
        name: displayName,
        avatar: photoURL,
      },
    };
    fileUrl
      ? (message["image"] = fileUrl)
      : (message["content"] = this.state.message);
    return message;
  };

  sendMessage = async () => {
    const { message, errors, typingRef } = this.state;
    const { currentChannel, getMessagesRef, currentUser } = this.props;

    if (message) {
      this.setState({ loading: true });
      try {
        await getMessagesRef()
          .child(currentChannel.id)
          .push()
          .set(this.createMessage());
        this.setState({ loading: false, message: "", errors: [] });
      } catch (error) {
        console.log(error);
        this.setState({ loading: false, errors: [...errors, error] });
        typingRef.child(currentChannel.id).child(currentUser.uid).remove();
      }
    } else {
      this.setState({ errors: [...errors, { message: "Add a message" }] });
    }
  };

  handleKeyDown = (event) => {
    const { message, typingRef } = this.state;
    if (event.keyCode === 13 && message) {
      this.sendMessage();
    }

    const { currentChannel, currentUser } = this.props;

    if (message) {
      typingRef
        .child(currentChannel.id)
        .child(currentUser.uid)
        .set(currentUser.displayName);
    } else {
      typingRef.child(currentChannel.id).child(currentUser.uid).remove();
    }
  };

  render() {
    // prettier-ignore
    const { message, errors, loading, modal, uploadState, percentUploaded } = this.state;
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
          onKeyDown={this.handleKeyDown}
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
            disabled={uploadState === "uploading"}
            onClick={this.openModal}
          />
        </Button.Group>
        <FileModal
          modal={modal}
          closeModal={this.closeModal}
          uploadFile={this.uploadFile}
        />
        <ProgressBar
          uploadState={uploadState}
          percentUploaded={percentUploaded}
        />
      </Segment>
    );
  }
}

const mapStateToProps = (state) => ({
  currentChannel: state.channelReducer.currentChannel,
  currentUser: state.userReducer.currentUser,
});

export default connect(mapStateToProps)(MessageForm);
