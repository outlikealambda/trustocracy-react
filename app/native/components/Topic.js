/**
 * @flow
 */

import React, { Component } from 'react';
import {
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native';
import Markdown from 'react-native-simple-markdown';
import Icon from 'react-native-vector-icons/Octicons';
import { RoundedButton, InitialsButton, IconButton } from './Buttons.js';

const trusteeColors = [
  'greenyellow',
  'dodgerblue',
  'darkorange',
  'fuchsia',
  'red',
  'cyan',
  'green',
  'moccasin'
];

// super fragile...
function initials (friend) {
  if (friend) {
    const { name } = friend;
    return name[0] + name.split(' ')[1][0];
  }
  return '';
}

function selectedCircle (content, key) {
  return (
    <View
      key={key}
      style={{
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 3,
        backgroundColor: styles.container.backgroundColor,
        borderWidth: 2,
        borderColor: 'orange'
      }}>
      {content}
    </View>
  );
}

function influencerCircle (content, key) {
  return (
    <View
      key={key}
      style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'turquoise'
      }}>
      {content}
    </View>
  );
}

type Props = {
  id: string
}

type State = {
  topicId: number,
  userId: number,
  influence: number,
  selectedConnectionIdx: number,
  selectedFriendIdx: number,
  bookIdx: number,
  connections: Array<any>,
  title: string,
  expanded: boolean,
  opinions: Array<any>,
  selectedOpinionIdx: number,
  selectedOpinion: any,
  showFriendDrawer: boolean,
  showAuthorDrawer: boolean
};

const host = '127.0.0.1';

export class Topic extends Component<void, Props, State> {
  state: State

  static navigationOptions = {
    title: ({ state }) => 'Topic: ' + state.params.title
  }

  constructor (props: Props) {
    super(props);

    const topicId = this.props.navigation.state.params.id;

    this.state = {
      topicId,
      userId: 2,
      influence: 0,
      selectedConnectionIdx: 0,
      selectedFriendIdx: 0,
      bookIdx: 0,
      connections: [],
      title: '',
      expanded: true,
      opinions: [],
      selectedOpinionIdx: -1,
      selectedOpinion: null,
      showFriendDrawer: false,
      showAuthorDrawer: false
    };

    this.fetchConnected(topicId, this.state.userId);
    this.fetchInfluence(topicId, this.state.userId);
    this.fetchTopicTitle(topicId);
    this.fetchOpinions(topicId);
  }

  fetchConnected = (topicId, userId) => {
    return global.fetch(`http://${host}:3714/api/topic/${topicId}/connected/${userId}`)
      .then(response => response.json())
      .then(connections => this.animateStateChange({ connections, bookIdx: connections.length }))
      .catch(error => {
        console.error(error);
      });
  }

  fetchInfluence = (topicId, userId) => {
    return global.fetch(`http://${host}:3714/api/topic/${topicId}/user/${userId}/influence`)
      .then(response => response.json())
      .then(r => this.animateStateChange({ influence: r.influence }))
      .catch(error => {
        console.error(error);
      });
  }

  fetchTopicTitle = topicId => {
    return global.fetch(`http://${host}:3714/api/topic/${topicId}`)
      .then(response => response.json())
      .then(topicInfo => topicInfo.text)
      .then(title => this.animateStateChange({ title }))
      .catch(error => {
        console.error(error);
      });
  }

  fetchOpinions = topicId => {
    return global.fetch(`http://${host}:3714/api/topic/${topicId}/opinions`)
      .then(response => response.json())
      .then(opinions => this.animateStateChange({ opinions }))
      .catch(error => {
        console.error(error);
      });
  }

  fetchSelectedOpinion = opinionId => {
    return global.fetch(`http://${host}:3714/api/opinion/${opinionId}`)
      .then(response => response.json())
      .catch(error => {
        console.error('failed to retrieve opinion with id: ' + opinionId, error);
        throw error;
      });
  }

  fetchSetTarget = (topicId, userId, targetId) => {
    return global.fetch(`http://${host}:3714/api/topic/${topicId}/user/${userId}/target/${targetId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'plain/text'
        },
        body: ''
      })
      .then(() => {
        this.fetchConnected(topicId, userId);
        this.fetchInfluence(topicId, userId);
        this.fetchOpinions(topicId);
      });
  }

  toggleFriendDrawer = () => {
    this.animateStateChange({
      showAuthorDrawer: false,
      showFriendDrawer: !this.state.showFriendDrawer
    });
  }

  toggleAuthorDrawer = () => {
    this.animateStateChange({
      showFriendDrawer: false,
      showAuthorDrawer: !this.state.showAuthorDrawer
    });
  }

  showBrowseAllOpinions = () => {
    this.animateStateChange(Object.assign(
      {
        selectedConnectionIdx: this.state.bookIdx,
        selectedFriendIdx: 0,
        expanded: false,
        selectedOpinion: null
      },
      defaultState.hiddenDrawers
    ));
  }

  showBrowseSingleOpinion = selectedOpinionIdx => () => {
    this.fetchSelectedOpinion(selectedOpinionIdx)
      .then(selectedOpinion => {
        this.animateStateChange({
          selectedOpinion,
          selectedOpinionIdx
        });
      });
  }

  showConnectedOpinion = (connectionIdx, friendIdx) => () => {
    this.animateStateChange(Object.assign(
      {
        selectedConnectionIdx: connectionIdx,
        selectedFriendIdx: friendIdx,
        selectedOpinion: null
      },
      defaultState.hiddenDrawers
    ));
  }

  showTrusteeIcons = () => {
    this.animateStateChange({
      expanded: true
    });
  }

  animateStateChange = modifiedState => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);

    this.setState(modifiedState);
  }

  render () {
    const selectedConnection = this.state.connections[this.state.selectedConnectionIdx];

    const selectedFriend = selectedConnection ? selectedConnection.friends[this.state.selectedFriendIdx] : null;

    const renderTrusteeGroup = (connection, connectionIdx) => {
      const color =
        connection.opinion
          ? trusteeColors[connectionIdx % trusteeColors.length]
          : 'lightgray';

      const renderTrustee = (friend, friendIdx) => {
        let trusteeView = (
          <InitialsButton
            onPress={this.showConnectedOpinion(connectionIdx, friendIdx)}
            key={connectionIdx + ':' + friendIdx}
            backgroundColor={color}
            initials={initials(friend)} />
        );

        if (connectionIdx === this.state.selectedConnectionIdx &&
            friendIdx === this.state.selectedFriendIdx) {
          trusteeView = selectedCircle(trusteeView, 'selected' + connectionIdx + ':' + friendIdx);
        }

        if (friend.isInfluencer) {
          trusteeView = influencerCircle(trusteeView, 'influencer' + connectionIdx + ':' + friendIdx);
        }

        return trusteeView;
      };

      return (
        connection.friends.map(renderTrustee)
      );
    };

    const renderBook = () => (
      <IconButton
        name='book'
        key='book'
        backgroundColor='wheat'
        size={27}
        style={{marginRight: 2, marginTop: 3}}
        onPress={this.showBrowseAllOpinions} />
    );

    const renderExpand = () => (
      <IconButton
        name='chevron-left'
        key='expand'
        backgroundColor='wheat'
        size={28}
        style={{marginLeft: 12, marginTop: 2}}
        onPress={this.showTrusteeIcons} />
    );

    const renderAuthorNavCircle = author => (
      <InitialsButton
        backgroundColor='wheat'
        initials={initials(author)} />
    );

    const renderOpinionHeader = () => {
      if (!selectedConnection || !selectedConnection.author) {
        return [];
      }

      let trusteeCircle = (
        <InitialsButton
          backgroundColor={trusteeColors[this.state.selectedConnectionIdx % trusteeColors.length]}
          initials={initials(selectedFriend)}
          onPress={this.toggleFriendDrawer}
          style={{
            marginHorizontal: selectedFriend.isInfluencer ? 0 : 8
          }} />
      );

      if (selectedFriend.isInfluencer) {
        trusteeCircle = influencerCircle(trusteeCircle);
      }

      return (
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 8
          }}>
          { trusteeCircle }
          <View style={[styles.miniCircle]} />
          <View style={[styles.miniCircle]} />
          <View style={[styles.miniCircle]} />
          <View style={[styles.miniCircle]} />
          <View style={[styles.miniCircle]} />
          <View style={[styles.miniCircle]} />
          <View style={[styles.miniCircle]} />
          <View style={[styles.miniCircle]} />
          <Icon name='chevron-right' size={16} color='#999' />
          <RoundedButton
            style={{backgroundColor: '#ccc', marginRight: 8}}
            text={selectedConnection.author.name}
            onPress={this.toggleAuthorDrawer} />
        </View>
      );
    };

    const Bold = props => <Text style={{fontWeight: 'bold'}}>{props.children}</Text>;

    const renderDrawer = (person, influence) => {
      if (!person) return [];

      if (person.isManual) {
        return (
          <View style={styles.drawer}>
            <Text style={styles.drawerRow}>
              <Bold>{person.name}</Bold> is your delegate!  You have passed on <Bold>+{influence}</Bold>pts of influence
            </Text>
            <View style={[styles.drawerRow, styles.rowWrapper, {marginLeft: -4}]}>
              <RoundedButton
                text={'Remove'}
                size={'small'}
                onPress={() => console.log('remove!')}
                style={{backgroundColor: '#aaa', marginRight: 4}}
              />
              <Text style={{flex: 1}}>
                {`${person.name} as my delegate`}
              </Text>
            </View>
            <Text style={[styles.drawerRow, {fontSize: 12, fontStyle: 'italic'}]}>
              {`This will redirect your influence to your top-ranked friend`}
            </Text>
          </View>
        );
      }

      if (person.isInfluencer) {
        return (
          <View style={styles.drawer}>
            <Text style={styles.drawerRow}>
              <Bold>{person.name}</Bold> is your default delegate!
            </Text>
          </View>
        );
      }

      const setDelegate = () => this.fetchSetTarget(this.state.topicId, this.state.userId, person.id);

      if (person.isRanked) {
        return (
          <View style={styles.drawer}>
            <View style={[styles.drawerRow, styles.rowWrapper]}>
              <RoundedButton
                text={'Delegate'}
                onPress={setDelegate}
                style={{backgroundColor: 'lightgreen', marginRight: 4}}
              />
              <Text style={{flex: 1}}>
                <Bold>+{influence}pts</Bold> of influence to {person.name}
              </Text>
            </View>
          </View>
        );
      }

      // we're left with an unconnected author
      return (
        <View style={styles.drawer}>
          <View style={[styles.drawerRow, styles.rowWrapper]}>
            <RoundedButton
              text={'Delegate Directly'}
              onPress={setDelegate}
              style={{backgroundColor: 'lightgreen', marginRight: 4}}
            />
            <Text style={{flex: 1}}>to {person.name}</Text>
          </View>
          <Text style={[styles.drawerRow, {fontSize: 12, fontStyle: 'italic'}]}>
            {
              `Can you personally vouch for ${person.name}, or are you an expert` +
              ` in this topic and able to confirm the claims in this article? If` +
              ` not, consider delegating to a friend who knows more about this` +
              ` topic`
            }
          </Text>
        </View>
      );
    };

    const renderBrowseOpinions = opinions => {
      return (
        <View style={{paddingVertical: 12}}>
          {twoCol(
            (<Text style={[styles.browseHeader, {marginRight: 8}]}>Author</Text>),
            (<Text style={[styles.browseHeader, {marginLeft: 8}]}>Influence</Text>)
          )}
          {opinions.map(renderOpinionSelector)}
        </View>
      );
    };

    const renderOpinionSelector = (opinionInfo, opinionIdx) => {
      console.log(JSON.stringify(opinionInfo, 2));

      return (
        <TouchableHighlight
          key={opinionInfo.id}
          onPress={this.showBrowseSingleOpinion(opinionIdx)}>
          {
            twoCol(
              (
                <RoundedButton
                  style={styles.roundedLeftHalf}
                  text={opinionInfo.author.name} />
              ),
              (
                <RoundedButton
                  style={styles.roundedRightHalf}
                  text={opinionInfo.influence} />
              )
            )
          }
        </TouchableHighlight>
      );
    };

    const twoCol = (first, second) => (
      <View style={{ margin: 8, flexDirection: 'row' }}>
        <View style={{ flex: 5, alignItems: 'flex-end' }}>
          {first}
        </View>
        <View style={{ flex: 3, alignItems: 'flex-start' }}>
          {second}
        </View>
      </View>
    );

    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          { this.state.title }
        </Text>
        <View
          style={{
            alignItems: 'center',
            borderTopColor: '#ddd',
            borderTopWidth: 1,
            borderBottomColor: '#ddd',
            borderBottomWidth: 1,
            height: 70
          }}>
          { /* ScrollView needs a height; either inherited or set, and even
               if it's horizontal */}
          <ScrollView
            horizontal
            contentContainerStyle={{
              alignItems: 'center',
              paddingHorizontal: 8
            }}>
            { this.state.expanded
            ? this.state.connections.map(renderTrusteeGroup)
            : renderExpand()
            }
            { this.state.selectedConnectionIdx === this.state.bookIdx &&
              !this.state.selectedOpinion
            ? selectedCircle(renderBook())
            : renderBook()
            }
            { this.state.selectedConnectionIdx === this.state.bookIdx &&
              this.state.selectedOpinion
            ? selectedCircle(renderAuthorNavCircle(this.state.selectedOpinion.author))
            : <View />
            }
          </ScrollView>
        </View>
        {/* mark as a row, so that it will fill horizontally */}
        <View style={{flex: 0, flexDirection: 'row'}}>
          { renderOpinionHeader() }
        </View>
        {this.state.showFriendDrawer ? renderDrawer(selectedFriend, this.state.influence) : []}
        {this.state.showAuthorDrawer ? renderDrawer(selectedConnection ? selectedConnection.author : {}, this.state.influence) : []}
        <View style={{flex: 1}}>
          <ScrollView>
            { this.state.selectedConnectionIdx === this.state.bookIdx &&
              (!this.state.selectedOpinion || !this.state.selectedOpinion.text)
            ? renderBrowseOpinions(this.state.opinions)
            : (
              <View style={styles.instructions} key={this.state.selectedConnectionIdx}>
                <Markdown>
                  { selectedConnection
                  ? (selectedConnection.opinion
                    ? selectedConnection.opinion.text
                    : '*...No connected opinion...*'
                    )
                  : (this.state.selectedOpinion
                    ? this.state.selectedOpinion.text
                    : ''
                    )
                  }
                </Markdown>
              </View>
              )
            }
          </ScrollView>
        </View>
      </View>
    );
  }
}

const defaultState = {
  hiddenDrawers: {
    showAuthorDrawer: false,
    showFriendDrawer: false
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF'
  },
  welcome: {
    flex: 0,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10
  },
  instructions: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 20,
    marginBottom: 5
  },
  roundedLeftHalf: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: '#ccc'
  },
  roundedRightHalf: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderWidth: 1,
    borderColor: 'pink'

  },
  miniCircle: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#999'
  },
  rowWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  browseHeader: {
    fontSize: 14,
    color: '#999'
  },
  drawer: {
    flex: 0,
    alignSelf: 'stretch',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ddd'
  },
  drawerRow: {
    marginVertical: 8
  }
});
