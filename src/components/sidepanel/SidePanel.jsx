import React, { Component } from "react";
import { Menu } from "semantic-ui-react";
import UserPanel from "./UserPanel";
import Channels from "./Channels";
import DirectMessages from "./DirectMessages";
import Starred from "./Starred";

class SidePanel extends Component {
  state = {};
  render() {
    return (
      <Menu
        inverted
        size="large"
        fixed="left"
        vertical
        style={{ background: "#4c3c4c", fontSize: "1.2rem" }}
      >
        <UserPanel />
        <Starred />
        <Channels />
        <DirectMessages />
      </Menu>
    );
  }
}

export default SidePanel;
