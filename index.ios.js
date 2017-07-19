'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  StatusBar,
  TabBarIOS,
  Navigator,
  Text,
  View,
  Image,
  TouchableHighlight,
} from 'react-native';

// Pages.
let Home = require('./app/pages/Home');
let PlaceList = require('./app/pages/PlaceList');
let ActivityList = require('./app/pages/ActivityList');


class clubbin extends Component {

  constructor(props) {
    super(props);

    StatusBar.setBarStyle('light-content', true);

    this.state = {
      selectedTab: 'home',
      isRootScene: false,  // I use this flag to reset to the initial scene when clicking a tab.
    };
  }

  renderNavigator(title, component) {
    return (
      <Navigator
        initialRoute={{ title: title, component: component, index: 0 }}
        renderScene={(route, navigator) => {

          // Reset to the initial scene if a tab item
          // was clicked (since they are the only ones that
          // set the isRootScene flag to true).
          if (this.state.isRootScene) {
              setTimeout(()=> {
                navigator.popToTop();
                this.setState({
                    isRootScene: false,
                });
              }, 0);
            }

            let RouteComponent = route.component;
            return <RouteComponent navigator={navigator} {...route.passProps} />
        }}
        navigationBar={
          <Navigator.NavigationBar
            routeMapper={{
              Title: (route, navigator, index, navState) => {
                // Strip title if too long.
                let title = route.title.length > 25 ?
                  route.title.slice(0, 19) + '...' :
                  route.title;

                return (<Text style={styles.navigationBar_title}>{title}</Text>);
              },
              LeftButton: (route, navigator, index, navState) => {
                if (route.index !== 0) {
                  return (
                    <TouchableHighlight onPress={() => navigator.pop()}>
                      <View style={styles.navigationBar_leftButton}>
                        <Image
                          source={require('./app/images/navigation_bar_back_arrow_white.png')}
                          style={styles.navigationBar_leftButton_icon} />
                        <Text style={styles.navigationBar_leftButton_text}>Back</Text>
                      </View>
                    </TouchableHighlight>
                  );
                }
              },
              RightButton: (route, navigator, index, navState) => { return; },
            }}
            style={styles.navigationBar}
          />
        }
      />
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <TabBarIOS selectedTab={this.state.selectedTab}
          tintColor="#fff"
          unselectedTintColor="#666"
          translucent={false}
          barTintColor="#000">

          <TabBarIOS.Item
            title="Home"
            selected= {this.state.selectedTab === 'home'}
            icon={require('./app/images/home_icon.png')}
            iconSize={35}
            renderAsOriginal={true}
            onPress = {() => {
              this.setState({
                  selectedTab: 'home',
                  isRootScene: true,
              });
          }}>
            {this.renderNavigator('CLUBBIN', Home)}
          </TabBarIOS.Item>

          <TabBarIOS.Item
            title="Lugares"
            selected= {this.state.selectedTab === 'places'}
            icon={require('./app/images/locations_icon.png')}
            iconSize={35}
            renderAsOriginal={true}
            onPress = {() => {
              this.setState({
                  selectedTab: 'places',
                  isRootScene: true,
              });
          }}>
            {this.renderNavigator('LUGARES', PlaceList)}
          </TabBarIOS.Item>

          <TabBarIOS.Item
            title="Actividades"
            selected= {this.state.selectedTab === 'activities'}
            icon={require('./app/images/activities_icon.png')}
            iconSize={35}
            renderAsOriginal={true}
            onPress = {() => {
              this.setState({
                  selectedTab: 'activities',
                  isRootScene: true,
              });
          }}>
            {this.renderNavigator('ACTIVIDADES', ActivityList)}
          </TabBarIOS.Item>
      </TabBarIOS>
    </View>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  navigationBar: {
    backgroundColor: '#000',
    maxHeight: 55
  },
  navigationBar_leftButton: {
    marginTop: 10,
    marginLeft: 10,
    flex: 1,
    flexDirection: 'row',
  },
  navigationBar_leftButton_icon: {
    width: 15,
    height: 15,
    marginTop: 1,
  },
  navigationBar_leftButton_text: {
    marginLeft: 4,
    color: '#fff',
    fontFamily: 'Raleway-Medium',
  },
  navigationBar_title: {
    marginTop: 8,
    color: '#fff',
    fontFamily: 'Raleway-Medium',
    fontSize: 16,
  }
});

AppRegistry.registerComponent('clubbin', () => clubbin);
