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

  static startsWith(char, lettersHash) {
    return lettersHash[char] && lettersHash[char] === char;
  }

  // Returns an object with format { A:'A', ...}
  static getAlphaNumericHash() {
    let lettersArray = [
      '0-9', 'A', 'B', 'C', 'D', 'E',
      'F', 'G', 'H', 'I', 'J', 'K','L',
      'M', 'N', 'Ñ', 'O', 'P', 'Q','R', 'S',
      'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ];

    let lettersHash = {};
    lettersArray.forEach((letter) => {
      lettersHash[letter] = letter;
    });

    return lettersHash;
  }

  // Creates a list with letters separators and add an "images" property 
  // that groups each element's images.
  static getDirectoryList(results) {
    let lettersHash = Util.getAlphaNumericHash();
    let directoryList = [];

    if (results.length === 0) return directoryList;

    results.forEach((item, i)=> {
        item.title = item.title.toUpperCase();
        let firstChar = item.title.charAt(0);

        // If it starts with a number...
        if (Util.isNumber(firstChar) && lettersHash['0-9']) {
          let letterItem = {
            title: lettersHash['0-9'],
            isSeparator: true
          };
          directoryList.push(letterItem);
          delete lettersHash['0-9'];
        }

        // If it starts with a letter from the alphabet...
        if (Util.startsWith(firstChar, lettersHash)) {
          // Add the letter item...
          let letterItem = {
            title: lettersHash[firstChar],
            isSeparator: true
          };
          directoryList.push(letterItem);
          // And remove this letter from the hash.
          delete lettersHash[firstChar];
        }

        // Group items by title.
        // Since the api/places might return the same item multiple times (e.g.
        // if it has many images it will return one item per image), we do 2
        // things here.

        // First we create a new property called images, and group there
        // all the images ('uri's from each duplicated element).
        item.images = [];
        if (item.uri) {
          item.images.push(Util.getImagePath(item.uri, 'large')); // Use the 'large' image style.
        }
        let itemExists = directoryList.some((listItem) => {
          if (listItem.title === item.title) {
            listItem.images.push(item.uri);
            return true;
          }
        });

        // Second, if this item already exists, we don't add it again.
        if (!itemExists) {
          directoryList.push(item);
        }

    });
    return directoryList;
  }

}

module.exports = Util;
