'use strict';

import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  ListView,
  ScrollView,
  TouchableHighlight,
  ActivityIndicator,
  DatePickerIOS,
  TouchableOpacity,
  RefreshControl
} from 'react-native';

//import moment from 'moment/src/moment';  // Doesn't work for locale.
var moment = require('moment');
import 'moment/locale/es';
moment.locale('es');

import { REQUEST_PLACES_URL, REQUEST_ACTIVITIES_URL } from '../components/Constants';
const Util = require('../components/Util');
const ErrorText = require('../components/ErrorText');
const FadeInImage = require('../components/FadeInImage');
const GlobalStyles = require('../components/GlobalStyles');
const ActivityDetail = require('./ActivityDetail');
const PlaceDetail = require('./PlaceDetail');


class Home extends Component {

  static listEmptyText = 'No se encontraron Actividades.';

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      comingSoon: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2
      }),
      featuredItems: [],
      isListEmpty: false,
      hasError: false,
    };
  }

  componentDidMount() {
    this.fetchPlaces();
    this.fetchActivities().done();
  }

  refreshScrollView() {
    this.fetchActivities()
    .then(()=> this.scrollView.scrollTo({y: 0}))
    .done();
  }

  fetchPlaces() {
    return fetch(REQUEST_PLACES_URL)
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData) {
            // Extract only the featured ones.
            let places = [];
            responseData.forEach((item)=> {
              let containsPlace = places.some(
                (place)=> place.title === item.title);

              if (item.featured == 1 && !containsPlace) {
                places.push(item);
              }
            });

            this.setState({
              featuredItems: this.state.featuredItems.concat(places)
            });

        }
        return true;
      })
      .catch((error) => {
        this.setState({hasError: true});
        console.log('Error retrieving places from the server: ', error);
      });
  }

  fetchActivities() {
    return fetch(REQUEST_ACTIVITIES_URL)
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData) {

            let allItems = Util.removeDuplicatedItems(responseData);

            // Get today's activities.
            let todaysActivities = allItems.filter(this.isActivityToday);
            if (todaysActivities.length > 0) {
              todaysActivities.unshift({title: 'PA ˈHOY!', isSeparator: true});
            }

            // Get this week's activities (doesn't include today).
            let weeksActivities = allItems.filter((item)=> this.isActivityInWeek(item, 0));
            if (weeksActivities.length > 0) {
              weeksActivities.unshift({title: 'ESTA SEMANA', isSeparator: true});
            }

            // Get next week's activities (doesn't include today).
            let nextWeeksActivities = allItems.filter((item)=> this.isActivityInWeek(item, 1));
            if (nextWeeksActivities.length > 0) {
              nextWeeksActivities.unshift({title: 'PRÓXIMA SEMANA', isSeparator: true});
            }

            // Create a single list from todays and this week's activities.
            let activities = todaysActivities.concat(weeksActivities, nextWeeksActivities);

            // Extract the featured.
            let featuredActivities = allItems.filter((item)=> {
              return item.featured == 1;
            });

            this.setState({
                comingSoon: this.state.comingSoon.cloneWithRows(activities),
                isLoading: false,
                isListEmpty: allItems.length === 0 ? true : false,
                featuredItems: this.state.featuredItems.concat(featuredActivities)
            });
        }
      })
      .catch((error) => {
        this.setState({hasError: true});
        console.log('Error retrieving activities from the server: ', error);
      });
  }

  navigateTo(item, component) {
    // Separators are not clickable.
    if (item.isSeparator) return;

    this.props.navigator.push({
      title: item.title,
      component: component,
      passProps: {item}
    });
  }

  renderItemThumbnail(item) {
    if (item.isSeparator) {
        return;
    }

    let source;
    if (item.uri) {
      // Since we get the default image path, we replace it with
      // the thumbnail's path instead.
      // @todo: ideally we might load the 'thumbnail' style, but this will require
      // that we pre-generate it in Drupal.
      let thumbUri = Util.getImagePath(item.uri, 'large');
      source = {uri: thumbUri};
    }
    else {
      source = require('../images/default_activity_thumbnail.png');
    }

    return (
      <FadeInImage
        source={source}
        style={styles.listItem_thumbnail} />
    );
  }

  renderItemDescription(item) {
    if (item.isSeparator) {
      return (
        <Text style={styles.heading}>{item.title}</Text>
      );
    }

    let when = item.every.length ? 'Cada ' + item.every.join(', ') :
      item.when ? Util.getShortDates(item.when) : '';

    // Only show the "where" text if there's any.
    let whereTag = item.where ? <Text style={[styles.listItem_where, styles.listItem_text]}>{item.where}</Text> : false;

    return(
      <View style={styles.listItem_inner_container}>
        <Text style={[styles.listItem_title, styles.listItem_text]}>{item.title}</Text>
        {whereTag}
        <Text style={[styles.listItem_when, styles.listItem_text]}>{when}</Text>
      </View>
    );
  }

  renderRow(item) {
    return (
        <TouchableHighlight
          onPress={() => this.navigateTo(item, ActivityDetail)}
          underlayColor={'transparent'}>
          <View>
            <View style={styles.listItem_container}>
              {this.renderItemThumbnail(item)}
              {this.renderItemDescription(item)}
            </View>
            <View style={styles.listItem_separator} />
          </View>
        </TouchableHighlight>
    );
  }

  renderLoadingView() {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size='large'/>
      </View>
    );
  }

  renderEmptyListText() {
    // We use this flag to show a message if the list is empty.
    if (this.state.isListEmpty) {
      return(
        <Text style={styles.emptyList_text}>{Home.listEmptyText}</Text>
      );
    }
  }

  renderFeaturedItem() {
    // If there are featured items...
    if (this.state.featuredItems.length) {

      // Get one randomly.
      let rand = Util.getRandomInt(0, this.state.featuredItems.length);
      let item = this.state.featuredItems[rand];

      let source = item.uri ?
            {uri: Util.getImagePath(item.uri, 'large')} :
            require('../images/default_place_image.jpg');
      return (
        // <TouchableHighlight
        //   onPress={() => this.navigateTo(item, PlaceDetail)}>
        <View style={styles.mainItem_container}>
          <FadeInImage
            source={source}
            style={styles.mainItem_image}
          >
          </FadeInImage>
          {/* // Hide the caption, for now.
          <View style={styles.mainItem_caption}>
            <Text style={styles.mainItem_title}>
              {item.title.toUpperCase()}
            </Text>
          </View>
          */}
        </View>
        // </TouchableHighlight>
      );
    }
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

    return (
      <ScrollView
        style={styles.container}
        ref={(reference) => this.scrollView = reference}
        refreshControl={
          <RefreshControl
            refreshing={this.state.isLoading}
            onRefresh={this.refreshScrollView.bind(this)}
          />
        }
      >
        {this.renderFeaturedItem()}
        <View style={styles.image_separator} />
        {this.renderEmptyListText()}
        <ListView
          dataSource={this.state.comingSoon}
          renderRow={this.renderRow.bind(this)}
          style={styles.listView}
          enableEmptySections={true}
        />
      </ScrollView>
    )
  }

  /**
   * Returs true if an activity happens today, either because it's on the
   * same date or because it's on the same day of the week.
   */
  isActivityToday = (item) => {
    // Get only today's events.
    let today = moment().startOf('day');
    let todaysDay = today.format('dddd');  // E.g. 'lunes'.

    // Split the dates, in case there are multiple.
    let whenArray = item.when.split(',');

    // if has today's date or is recurrent every today's week days.
    let isToday = whenArray.some((date) => {
      let isRecurrent = item.every.length > 0;

      let when = moment(date);
      let isSameDate = today.isSame(when, 'd') && !isRecurrent;
      let isSameDayName = item.every.indexOf(todaysDay) > -1 &&
        today.unix() <= when.unix();

      return isSameDate || isSameDayName;
    });

    return isToday;
  }

  /**
   * Returs true if an activity happens on the passed week week, either because
   * it's date is on the same week or because it's day name is on the same week.
   * NOTE: Today's events are excluded.
   *
   * @param item
   * @param weeksFromNow
   *   0 = this week, 1 = next week, and so on...
   */
  isActivityInWeek = (item, weeksFromNow = 0) => {
    // Get today.
    let today = moment().startOf('day');
    let todaysDay = today.format('dddd');  // E.g. 'lunes'.

    // Get week.
    let currentWeek = moment().startOf('isoWeek');

    if (item.when) {
        // When an activity is recurrent, we need to check if the day(s) of the
        // week when it occurs have not passed. E.g. an event that occurs every
        // 'lunes' and 'martes', should not show up anymore on 'miércoles' (event
        // though we are still in the same week).
        let weekDays = {'lunes':0, 'martes':1, 'miércoles':2, 'jueves':3, 'viernes':4, 'sábado':5, 'domingo':6};
        let dayHasNotPassed = item.every.some((day)=> {
          // If today's day (e.g. 'miercoles') is larger than the day
          // when it occurs (e.g. 'martes')
          if (weeksFromNow === 0) {
            return weekDays[day] > weekDays[todaysDay];
          }
          // The week is in the future, so no day of the week has passed yet.
          return true;
        });


        // When the event is recurrent, we use the 'when' field
        // to indicate when it expires.
        let when = moment(item.when);
        let isRecurrent = item.every.length > 0;
        let isDateInWeek = currentWeek.add(weeksFromNow, 'weeks')
          .isSame(moment(item.when), 'isoWeek');
        let isDayNameInWeek = isRecurrent &&
          when.diff(currentWeek) > 0 && // and it hasn't expired.
          dayHasNotPassed;  // and the week's day hasn't passed yet.

        return (isDateInWeek && !isRecurrent) || isDayNameInWeek;
    }

    return false;
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    marginBottom: 49,
    marginTop: 60,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderColor: GlobalStyles.primaryColor,
  },
  listView: {
    flex: 1,
  },
  image_separator: {
    height: 1,
    backgroundColor: GlobalStyles.primaryColor,
  },
  // Featured new.
  mainItem_container: {
    flexDirection: 'column',
    height: Util.getViewWidth(),
    position: 'relative',
  },
  mainItem_image: {
    height: Util.getViewWidth(),
  },
  mainItem_caption: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,.6)',
    position: 'absolute',
    paddingTop: 10,
    paddingBottom: 10,
    bottom: 0,
    right: 0,
    left: 0
  },
  mainItem_title: {
    fontSize: 18,
    textAlign: 'center',
    fontFamily: GlobalStyles.primaryFontLight,
    color: '#fff',
  },
  heading: {
    color: '#fff',
    fontFamily: GlobalStyles.primaryFontLight,
    fontSize: 14,
    marginTop: 10,
  },
  // List.
  listItem_container: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 20,
  },
  listItem_inner_container: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 20,
    padding: 10,
  },
  listItem_thumbnail: {
    width: 80,
    height: 80,
    marginTop: 10,
    marginBottom: 10,
  },
  listItem_text: {
    color: '#fff',
    alignSelf: 'stretch'
  },
  listItem_title: {
    fontSize: 16,
    marginTop: 5,
    marginBottom: 4,
    fontFamily: GlobalStyles.primaryFontSemiBold,
  },
  listItem_where: {
    fontSize: 13,
    marginBottom: 4,
    fontFamily: GlobalStyles.primaryFontMedium,
  },
  listItem_when: {
    fontSize: 13,
    fontFamily: GlobalStyles.primaryFontLight,
  },
  listItem_separator: {
    height: 1,
    backgroundColor: '#1B0244',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  emptyList_text: {
    color: '#fff',
    paddingTop: 30,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  errorText: {
    color: '#fff',
    paddingTop: 200,
    textAlign: 'center',
    backgroundColor: 'transparent',
  }
});

module.exports = Home;