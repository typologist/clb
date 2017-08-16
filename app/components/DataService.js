var moment = require('moment');
import 'moment/locale/es';
moment.locale('es');

import { REQUEST_CITIES_URL, REQUEST_PLACES_URL, REQUEST_ACTIVITIES_URL } from './Constants';

const Util = require('./Util');
const ErrorText = require('./ErrorText');
const GlobalState = require('./GlobalState');


class DataService {

  fetchCities() {
    return fetch(REQUEST_CITIES_URL + '?time=' + moment().unix())
      .then((response) => response.json())
      .then((responseData) => {
        return responseData;
      });
  }

  fetchPlaces(city) {
    // Empty the places, so that we can detect changes to it.
    GlobalState.set({places: []});

    return fetch(REQUEST_PLACES_URL + city + '&time=' + moment().unix())
      .then((response) => response.json())
      .then((responseData) => {
        const places = Util.getDirectoryList(responseData);
        GlobalState.set({ places: places });
        return places;
      });
  }

  fetchActivities(city) {
    return fetch(REQUEST_ACTIVITIES_URL + city + '&time=' + moment().unix())
      .then((response) => response.json())
      .then((responseData) => {
        let activities = Util.removeDuplicatedItems(responseData);
        GlobalState.set({ activities: activities });
        return activities;
      })
      .catch((error) => {
        this.setState({hasError: true});
        console.log('Error retrieving activities from the server: ', error);
      });
  }  

}

module.exports = new DataService();
