import React, { Component } from "react";
import {
  Grid,
  Header,
  HeaderContent,
  Icon,
  Dropdown,
  Image,
} from "semantic-ui-react";
import firebase from "../../firebase";
import { connect } from "react-redux";

class UserPanel extends Component {
  handleSignOut = async () => {
    await firebase.auth().signOut();
  };

  dropdownOptions = () => {
    return [
      {
        key: "user",
        text: (
          <span>
            Sign in as <strong>{this.props.currentUser.displayName}</strong>
          </span>
        ),
        disabled: true,
      },
      {
        key: "avatar",
        text: <span>Change Avatar</span>,
      },
      {
        key: "signout",
        text: <span onClick={this.handleSignOut}>Sign Out</span>,
      },
    ];
  };
  render() {
    const { photoURL, displayName } = this.props.currentUser;
    return (
      <Grid style={{ background: "#4c3c4c" }}>
        <Grid.Column>
          <Grid.Row style={{ padding: "1.2rem", margin: 0 }}>
            <Header inverted floated="left" as="h2">
              <Icon name="code" />
              <HeaderContent>DevChat</HeaderContent>
            </Header>
            <Header style={{ padding: "0.1em" }} as="h4" inverted>
              <Dropdown
                trigger={
                  <span>
                    <Image src={photoURL} spaced="right" avatar /> {displayName}
                  </span>
                }
                options={this.dropdownOptions()}
              />
            </Header>
          </Grid.Row>
        </Grid.Column>
      </Grid>
    );
  }
}

const mapStateToProps = (state) => ({
  currentUser: state.userReducer.currentUser,
});

export default connect(mapStateToProps)(UserPanel);
