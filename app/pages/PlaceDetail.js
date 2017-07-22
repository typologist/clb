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

import ImageSlider from 'react-native-image-slider';

const OpenUrlButton = require('../components/OpenUrlButton');
const Util = require('../components/Util');
const GlobalStyles = require('../components/GlobalStyles');


class PlaceDetail extends Component {

  renderImage() {
    let item = this.props.item;

    // If there are images, return a slider,
    // otherwise a placeholder.
    let slider = <ImageSlider
      images={item.images}
      height={Util.getViewWidth()}  // Use the view width as height to create a square image.
    />;
    let placeholder = <Image
        source={require('../images/default_place_image.jpg')}
        style={styles.image} />;

    return item.images.length ? slider : placeholder;
  }

  renderItemProperty(property, icon) {
    let item = this.props.item;

    if (item[property]) {
      return (
        <View style={styles.listItem_container}>
          <Image source={icon} />
          <Text style={styles.listItem_text}>{item[property]}</Text>
        </View>
      );
    }
  }

  renderTelephone() {
    let item = this.props.item;
    let icon = require('../images/phone_icon.png');

    if (item.phone && item.phone.length > 0) {
      return(
        <View style={styles.listItem_container}>
          <Image source={icon} />
          <Text style={styles.listItem_text}>{item.phone[0]}</Text>
        </View>
      );

      // Bug. blank PlacesList page, after cancelling a phone call.
      // @todo: render multiple phone numbers (at this time, we
      // only render the first one)
      // let phone = 'tel:' + item.phone[0];
      // Another option is:
      // return (
      //   <View style={styles.listItem_container}>
      //     <Image source={icon} />
      //     <OpenUrlButton
      //       url={phone}
      //       style={styles.listItem_text}
      //     />
      //   </View>
      // );
    }
  }

  renderCoverLabels() {
    let item = this.props.item;
    let coverStyle = item.cover == 1 ? styles.cover_text_active : '';
    let noCoverStyle = item.cover == 0 ? styles.cover_text_active : '';
    return (
        <View style={styles.cover}>
          <Text style={[styles.cover_text, coverStyle]}>Cover</Text>
          <Text style={[styles.cover_text, noCoverStyle]}>No Cover</Text>
        </View>
    );
  }

  renderButton(type, label, icon) {
    let item = this.props.item;
    return (
        <TouchableHighlight
          onPress={ () => this.navigateTo(item, type) }>
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

  navigateTo(item, type) {
    this.props.navigator.push({
      title: item.title,
      componentId: 'ActivityList',
      passProps: {
        parent: {
          place: item.title,
          type: type,
        }
      }
    });
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        {this.renderImage()}
        {this.renderCoverLabels()}
        {this.renderButton('All', 'Actividades', require('../images/events_white_icon.png'))}
        <Text style={GlobalStyles.horizontalSeparator}></Text>
        {this.renderTelephone()}
        {this.renderItemProperty('hours', require('../images/hours_icon.png'))}
        {this.renderItemProperty('address', require('../images/address_icon.png'))}
        {this.renderItemProperty('instagram', require('../images/instagram_icon.png'))}
        {this.renderItemProperty('twitter', require('../images/twitter_icon.png'))}
        {this.renderItemProperty('facebook', require('../images/facebook_icon.png'))}
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
    slider: {
      borderColor: GlobalStyles.primaryColor,
    },
    image: {
      height: Util.getViewWidth(),
      alignSelf: 'stretch',
      borderBottomWidth: 1,
      borderColor: GlobalStyles.primaryColor,
    },
    cover: {
      alignSelf: 'center',
      flexDirection: 'row',
      marginTop: 10,
      marginBottom: 10,
    },
    cover_text: {
      textAlign: 'center',
      borderWidth: 1,
      borderColor: '#515151',
      padding: 4,
      paddingLeft: 8,
      paddingRight: 8,
      marginLeft: 6,
      borderRadius: 8,
      color: '#515151',
      fontFamily: GlobalStyles.primaryFontLight,
      fontSize: 15,
    },
    cover_text_active: {
      borderColor: GlobalStyles.primaryColor,
      color: '#fff',
    },
    button_container: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      padding: 5,
      paddingLeft: 15,
    },
    button_icon: {
      width: 30,
      height: 30,
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
    listItem_container: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      padding: 2,
      paddingLeft: 10,
    },
    listItem_icon: {
      width: 30,
      height: 30,
    },
    listItem_text: {
      flex: 1,
      marginLeft: 5,
      height: 30,
      marginTop: 7,
      color: '#fff',
      fontFamily: GlobalStyles.primaryFontLight,
      fontSize: 14,
    },
});

module.exports = PlaceDetail;
