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

const GlobalState = require('../components/GlobalState');
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

  renderButton(label, icon) {
    return (
      <TouchableHighlight
        onPress={ () => this.navigateToPlace() }>
        <View style={styles.button_container}>
          <Image source={icon}
            style={styles.button_icon}  />
          <Text style={styles.button_text}>{label.toUpperCase()}</Text>
          <Image source={require('../images/right_arrow_white.png')}
            style={styles.button_icon}  />
        </View>
      </TouchableHighlight>
    );
  }

  // Find a place in the global state with the name
  findPlaceByTitle(title) {
    // Since the places titles are uppercased in the global
    // storage, we convert in order to compare.
    let upperCasedTitle = title.toUpperCase();
    let place = GlobalState.get('places').find(place => {
      return place.title && place.title === upperCasedTitle;
    });
    return(place);
  }

  navigateToPlace() {
    let item = this.findPlaceByTitle(this.props.item.where);

    this.props.navigator.push({
      title: item.title,
      componentId: 'PlaceDetail',
      passProps: {item}  
    });
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
      let copyright = `© Todos los derechos pertenecen a ${item.where} \n o a sus respectivos autores.`;
    console.log('where', item.where);
    let infoPlaceButton = !this.findPlaceByTitle(item.where) ? null :
      this.renderButton('Información Lugar', require('../images/locations_white_icon.png'));
   
    return (
      <ScrollView style={styles.container}>
        {this.renderImage()}
        <View style={GlobalStyles.horizontalSeparator}></View>
            {infoPlaceButton}
            <Text style={GlobalStyles.horizontalSeparator}></Text>
            {when}
            {this.renderItemProperty('description')}
            {this.renderItemProperty('openBar', 'OPEN BAR')}
            {this.renderItemProperty('ticketsForSaleAt', 'Boletas a la venta en:')}
            {this.renderItemProperty('moreInfo', 'Información:')}
            <Text style={styles.copyright}>{copyright}</Text>
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
    button_container: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      padding: 5,
      paddingLeft: 15,
    },
    button_text: {
      flex: 1,
      marginLeft: 10,
      height: 30,
      marginTop: 7,
      color: '#fff',
      fontFamily: GlobalStyles.primaryFontLight,
      fontSize: 16,
    },
    copyright: {
      fontSize: 11,
      textAlign: 'center',
      fontFamily: GlobalStyles.primaryFontLight,
      paddingTop: 20,
      paddingLeft: 10,
      paddingRight: 10,
      paddingBottom: 5,
      color: '#fff',
    }

});

module.exports = ActivityDetail;
