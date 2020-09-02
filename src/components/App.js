import React from "react";
import "./App.css";
import { Grid } from "semantic-ui-react";
import ColorPanel from "./colorpanel/ColorPanel";
import SidePanel from "./sidepanel/SidePanel";
import Messages from "./messages/Messages";
import MetaPanel from "./metapanel/MetaPanel";
import { connect } from "react-redux";

function App({ currentChannel, currentUser }) {
  return (
    <Grid columns="equal" className="app" style={{ background: "#eee" }}>
      <ColorPanel />
      <SidePanel />
      <Grid.Column style={{ marginLeft: 320 }}>
        <Messages
          key={currentChannel && currentChannel.id}
          currentChannel={currentChannel}
          currentUser={currentUser}
        />
      </Grid.Column>
      <Grid.Column width={4}>
        <MetaPanel />
      </Grid.Column>
    </Grid>
  );
}

const mapStateToProps = (state) => ({
  currentUser: state.userReducer.currentUser,
  currentChannel: state.channelReducer.currentChannel,
});

export default connect(mapStateToProps)(App);
