'use strict';

//import moment from 'moment/src/moment';  // Doesn't work for locale.
var moment = require('moment');
import 'moment/locale/es';
moment.locale('es');

import Dimensions from 'Dimensions';


class Util {

  /**
   * Gets the width of the View.
   */
  static getViewWidth() {
    return Dimensions.get('window').width;
  }

  /**
   * Gets the width of the View.
   */
  static getViewHeight() {
    return Dimensions.get('window').height;
  }

  /**
   * Gets the image's specified style path. If none passed
   * the default image's path is returned.
   *
   * @param uri Default uri.
   * @param imageStyle
   *   Image styles (from Drupal): Possible values:
   *   'thumbnail', 'medium', 'large'.
   */
  static getImagePath(uri, imageStyle) {
      return !imageStyle ? uri:
        uri.replace('/files', '/files/styles/'+ imageStyle +'/public');
  }

  /**
   * Gets the date without the year, in format '14 de agosto'.
   * @return string
   */
  static getShortDate(rawDate) {
    let date = '';

    if (rawDate) {
      let day = moment(rawDate).format('DD');
      let month = moment(rawDate).format('MMMM');
      date = day + ' de ' + month;
    }
    return date;
  }

  /**
   * Gets the dates in short date format, comma separated.
   * @return string
   */
  static getShortDates(rawDates) {
    let rawDatesArray = rawDates.split(',');
    let datesArray = [];

    rawDatesArray.forEach((rawDate)=> {
        datesArray.push(Util.getShortDate(rawDate));
    });

    return datesArray.join(', ');
  }

  // Checks if an element is a number.
  static isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  // Returns a random integer between min (included) and max (excluded)
  static getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  // Removes the duplicated items in an array of items.
  static removeDuplicatedItems(itemsArray) {
    let existing = {};
    let uniqueItems = [];

    itemsArray.forEach((item) => {
        if (!existing[item.title]) {
            uniqueItems.push(item);
        }
        existing[item.title] = true;
    });

    return uniqueItems;
  }

}

module.exports = Util;
