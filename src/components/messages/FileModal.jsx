import React, { useState } from "react";
import { connect } from "react-redux";
import { Modal, Input, Button, Icon } from "semantic-ui-react";
import mime from "mime-types";

const validFileTypes = ["image/jpeg", "image/png"];

export const FileModal = ({ modal, closeModal, uploadFile }) => {
  const [file, setFile] = useState(null);

  const addFile = ({ target }) => {
    setFile(target.files[0]);
  };

  const sendFile = () => {
    if (file !== null) {
      if (isValidFile(file.name)) {
        const metaData = { contentType: mime.lookup(file.name) };
        uploadFile(file, metaData);
        closeModal();
        setFile(null);
      }
    }
  };

  const isValidFile = (filename) =>
    validFileTypes.includes(mime.lookup(filename));

  return (
    <Modal basic open={modal} onClose={closeModal}>
      <Modal.Header>Select an Image File</Modal.Header>
      <Modal.Content>
        <Input
          fluid
          label="File types: jpg, png"
          name="file"
          type="file"
          onChange={addFile}
        />
      </Modal.Content>
      <Modal.Actions>
        <Button color="green" inverted onClick={sendFile}>
          <Icon name="checkmark" />
          Send
        </Button>
        <Button color="red" inverted onClick={closeModal}>
          <Icon name="remove" />
          Cancel
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(FileModal);
