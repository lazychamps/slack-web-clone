import React, { Component } from "react";
import { Header, Segment, Input, Icon } from "semantic-ui-react";

class MessageHeader extends Component {
  state = {};
  render() {
    // prettier-ignore
    const { channelName, numUniqueUsers, handleSearchChange, searchLoading, isPrivateChannel, handleStar, isChannelStarred } = this.props;
    return (
      <Segment clearing>
        <Header as="h2" floated="left" style={{ marginBotton: 0 }}>
          <span>
            {channelName}{" "}
            {!isPrivateChannel && (
              <Icon
                name={isChannelStarred ? "star" : "star outline"}
                onClick={handleStar}
                color={isChannelStarred ? "yellow" : "black"}
              />
            )}
          </span>
          <Header.Subheader>{numUniqueUsers}</Header.Subheader>
        </Header>
        <Header floated="right">
          <Input
            loading={searchLoading}
            onChange={handleSearchChange}
            size="mini"
            icon="search"
            name="searchTerm"
            placeholder="Search Messages"
          />
        </Header>
      </Segment>
    );
  }
}

export default MessageHeader;
