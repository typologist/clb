'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  ScrollView,
  View,
  Image,
  TouchableHighlight,
  Navigator,
} from 'react-native';

const Util = require('../components/Util');
const GlobalStyles = require('../components/GlobalStyles');


class ActivityDetail extends Component {

  renderImage() {
    let item = this.props.item;
    let source = item.uri ?
          {uri: Util.getImagePath(item.uri, 'large')} :
          require('../images/default_place_image.jpg');

    return (
      <Image source={source} style={styles.image} />
    );
  }

  renderItemProperty(property, label='') {
    let item = this.props.item;

    if (item[property] && item[property] != 0) {

        let labelTag;
        if (label) {
           labelTag = <Text style={styles.item_label}>{label}</Text>;
        }

        // Show the property value, except if it's a checked
        // checkbox, which has a value of 1 (checked), in which case
        // showing the label is enough.
        let valueTag;
        if (item[property] != 1) {
            // If the property it's a date, format it.
            let value = property === 'when' ? Util.getShortDates(item[property]) :
              property === 'every' ? item[property].join(', ') :
              item[property];

            valueTag = <Text style={styles.item_text}>{value}</Text>
        }

        return (
            <View style={styles.item_container}>
                {labelTag}
                {valueTag}
            </View>
        );
    }
  }

  render() {
    let item = this.props.item;
    let when = item.every.length ?
      this.renderItemProperty('every', 'Cada:') :
      this.renderItemProperty('when');

    return (
      <ScrollView style={styles.container}>
        {this.renderImage()}
        <View style={GlobalStyles.horizontalSeparator}></View>
            {when}
            {this.renderItemProperty('description')}
            {this.renderItemProperty('openBar', 'OPEN BAR')}
            {this.renderItemProperty('ticketsForSaleAt', 'Boletas a la venta en:')}
            {this.renderItemProperty('moreInfo', 'Información:')}
      </ScrollView>
    );
  }

}

const styles = StyleSheet.create({
    container: {
      marginTop: 55,
      marginBottom: 49,
      flex: 1,
      backgroundColor: '#0D011E',
      borderBottomWidth: 1,
      borderColor: GlobalStyles.primaryColor,
    },
    image: {
      height: Util.getViewWidth(),
      alignSelf: 'stretch',
    },
    item_container: {
      justifyContent: 'center',
      padding: 4,
      paddingLeft: 30,
      paddingRight: 30,
    },
    item_text: {
      flex: 1,
      color: '#fff',
      fontFamily: GlobalStyles.primaryFontLight,
      fontSize: 14,
      textAlign: 'center'
    },
    item_when: {
        color: GlobalStyles.primaryColor,
    },
    item_label: {
        textAlign: 'center',
        fontFamily: GlobalStyles.primaryFontSemiBold,
        color: '#9012FF',
        marginTop: 4,
        marginBottom: 2,
    },
});

module.exports = ActivityDetail;
