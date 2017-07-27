'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  ScrollView,
  ActivityIndicator,
  View,
  Image,
  TouchableHighlight,
  Navigator,
} from 'react-native';

var moment = require('moment');
import 'moment/locale/es';
moment.locale('es');

const Util = require('../components/Util');
const GlobalStyles = require('../components/GlobalStyles');
const ErrorText = require('../components/ErrorText');
const REQUEST_URL =  'http://clubbinrd.com/api/place_features?nid=';


class PlaceFeatures extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      allItems: [],
      hasError: false,
    };        
  }

  componentDidMount() {
    this.setState({isLoading: true});
    this.fetchData().done();
  }

  fetchData() {
    return fetch(REQUEST_URL + this.props.parent.nid + '&time=' + moment().unix())
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData) {
          this.setState({
            isLoading: false,
            allItems: responseData,
          });
        }
      })
      .catch((error) => {
        this.setState({ hasError: true });
        console.log(error);
      });
  }

  renderLoadingView() {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size='large'/>
      </View>
    );
  }

  render() {
    if (this.state.isLoading) {
      return this.renderLoadingView();
    }
    else if (this.state.hasError) {
      return (
        <ErrorText></ErrorText>
      )
    }

    let list = this.state.allItems.map((item, i) => {
        return (<Text key={i} style={{color: '#fff'}}>&#8226; {item.name}</Text>)
    });

    return (
      <ScrollView style={styles.container}>
       {list}
      </ScrollView>
    );
  }

}

const styles = StyleSheet.create({
    container: {
      marginTop: 55,
      marginBottom: 49,
      flex: 1,
      paddingLeft: 25,
      paddingTop: 15,
      borderBottomWidth: 1,
      borderColor: GlobalStyles.primaryColor,
    },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});

module.exports = PlaceFeatures;
