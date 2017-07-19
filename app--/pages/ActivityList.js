'use strict';

import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  AppRegistry,
  ListView,
  TouchableHighlight,
  ActivityIndicator,
  DatePickerIOS,
  TouchableOpacity,
} from 'react-native';
import Menu, { MenuContext, MenuOptions, MenuOption, MenuTrigger } from 'react-native-menu';
 
//import moment from 'moment/src/moment';  // Doesn't work for locale.
var moment = require('moment');
import 'moment/locale/es';
moment.locale('es');
 
const Util = require('../components/Util');
const ErrorText = require('../components/ErrorText');
const FadeInImage = require('../components/FadeInImage');
const GlobalStyles = require('../components/GlobalStyles');
const ActivityDetail = require('./ActivityDetail');
const REQUEST_URL =  'http://clubbinrd.com/api/activities?city=';


class ActivityList extends Component {

  static all = 'All';
  static listEmptyText = 'No se encontraron Actividades.';

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2
      }),
      allItems: [],
      activeCategory: '',
      categories: [],
      isListEmpty: false,
      datePickerVisible: false,
      date: new Date(),
      minimumDate: new Date(),  // prevents selecting events in the past.
      timeZoneOffsetInHours: (-1) * (new Date()).getTimezoneOffset() / 60,
      hasError: false,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    this.resetNoActivitiesMessage();

    fetch(REQUEST_URL)
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData) {
          let allItems = Util.removeDuplicatedItems(responseData);

          let items = [];
          let activeCategory = '';

          // If there are properties passed from the parent scene (PlaceDetail)
          // it means we only want the activities from that place.
          if (this.props.parent) {
            items = allItems.filter((item)=> {
                return (
                  this.stringEquals(item.where, this.props.parent.place)
                );
            });
            activeCategory = this.props.parent.type;
          }
          else {
            items = allItems;
            activeCategory = ActivityList.all;
          }

          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(items),
            isLoading: false,
            allItems: items,
            activeCategory: activeCategory,
            categories: this.extractCategoriesFromItems(allItems),
            isListEmpty: items.length === 0 ? true : false,
          });

          // If there are properties passed from the parent
          // filter then by type.
          if (this.props.parent) {
            this.filterByType(this.props.parent.type);
          }
        }

      })
      .catch((error) => {
        this.setState({ hasError: true });
        console.log(error);
      })
      .done();
  }

  navigateTo(item) {
    this.props.navigator.push({
      title: item.title,
      component: ActivityDetail,
      passProps: {item}
    });
  }

  renderItemThumbnail(item) {
    let source;
    if (item.uri) {
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
    let where = item.where ?
      <Text style={[styles.listItem_where, styles.listItem_text]}>
      {item.where}</Text> : null;
   
    let when = <Text style={[styles.listItem_when, styles.listItem_text]}>
      {this.getDaysText(item)}</Text>;
      
    return(
      <View style={styles.listItem_inner_container}>
        <Text style={[styles.listItem_title, styles.listItem_text]}>{item.title}</Text>
        {where}
        {when}
      </View>
    );
  }

  renderRow(item) {
    return (
        <TouchableHighlight
          onPress={() => this.navigateTo(item)}
          underlayColor={item.isSeparator ? GlobalStyles.primaryColor : 'transparent'}>
          <View>
            <View style={styles.listItem_separator} />
            <View style={styles.listItem_container}>
              {this.renderItemThumbnail(item)}
              {this.renderItemDescription(item)}
            </View>
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

  filterByDate = (rawDate) => {
    // Convert the date set by the date picker...
    let chosenDate = rawDate ? rawDate : this.state.date;
    let date = moment(chosenDate);

    // And get all the items with the same date / day of the week.
    let items = this.state.allItems.filter((item)=> {
      // Since the date is a comma separeted string, create an array.
      let whenArray = item.when.split(',');

      let isToday = whenArray.some((w) => {
        let when = moment(w);
        // Same exact date...
        let isSameCalDay = when.format('LL') === date.format('LL');
        // Same week day (e.g. 'lunes') and before limit date.
        // (recurrent events use the 'when' field to indicate the end)
        let isSameNameDay = item.every.indexOf(date.format('dddd')) > -1 &&
          date.unix() <= when.unix();
        return isSameCalDay || isSameNameDay;
      });

        return isToday;
    });

    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(items),
      isListEmpty: items.length === 0 ? true : false,
      activeCategory: '',
      date: rawDate,
    });

    if (items.length === 0) {
      ActivityList.listEmptyText = `No hay Actividades el ${Util.getShortDate(chosenDate)}.`;
    }
  }

  filterByType(type ='') {
    // No category means show all;
    let items = [];
    if (type === ActivityList.all) {
        items = this.state.allItems;
    }
    else {
        items = this.state.allItems.filter((item)=> {
          return this.stringEquals(item.type, type) || this.stringEquals(item.specialType, type);
        });
    }

    // Filter the list.
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(items),
      isLoading: false,
      activeCategory: type,
      isListEmpty: items.length === 0 ? true : false,
      datePickerVisible: false,
    });

    // Scroll to top. We use setTimeout so it occurrs
    // after everything else is done.
    setTimeout(()=> this.listView.scrollTo({y: 0}), 0);

    this.resetNoActivitiesMessage();
  }

  resetNoActivitiesMessage() {
    ActivityList.listEmptyText = 'No se encontraron Actividades.';
  }

  // Creates a list of unique category names, from the items.
  extractCategoriesFromItems(allItems) {
    let categories = [];
    let unique = {};

    for (let prop in allItems) {
      // The properties used as categories are "type" and "specialType".

      // Check the "type" first.
      if (typeof(unique[allItems[prop].type]) == "undefined" && 
          allItems[prop].type !== null) {
        categories.push(allItems[prop].type);
      }
      // Check the "specialType".
      if (typeof(unique[allItems[prop].specialType]) == "undefined" && 
               allItems[prop].specialType !== null) {
          // Special types show first in the list and in uppercase.
          categories.unshift(allItems[prop].specialType.toUpperCase());
      }

      unique[allItems[prop].type] = 0;
    }    
    // 'All' category is always present as the first.
    categories.unshift(ActivityList.all);

    return categories;
  }

  getDaysText(item) {
    let daysText;
    if (item.every.length === 7) {
      daysText = 'De lunes a domingo';
    }
    else {      
      let days = item.every.join(', ');
      if (days === 'lunes, martes, miércoles, jueves, viernes') {
        daysText = 'De lunes a viernes';
      }
      else {
        daysText = item.every.length ? 'Cada ' + days :
          item.when ? Util.getShortDates(item.when) : '';
      }
    }   

    return daysText; 
  }

  stringEquals(a, b, caseSensitive = false) {
    if (a && b) {
      return caseSensitive ?
        a === b :
        a.toLowerCase() === b.toLowerCase();
    }
  }

  toggleDatePicker() {
    // Reset to today.
    this.setState({
      date: new Date(),
      datePickerVisible: !this.state.datePickerVisible,
    });
    // Reset the no activities text.
    this.resetNoActivitiesMessage();
  }

  renderEmptyListText() {
    // We use this flag to show a message if the list is empty.
    if (this.state.isListEmpty) {
      return(
        <Text style={styles.emptyList_text}>{ActivityList.listEmptyText}</Text>
      );
    }
  }

  renderTopNavigation() {
    const menuOptions = this.state.categories.map((categoryName, i) => {
      return (
        <MenuOption value={categoryName} key={i}>
          <Text style={{color: 'white'}}>{categoryName}</Text>
        </MenuOption>
      );
    });

    return(
      <View style={{ padding: 6, flexDirection: 'row', backgroundColor: 'transparent' }}>
        <View style={{ flex: 1 }}></View>
        <Menu onSelect={(value) => this.filterByType(value)}>
          <MenuTrigger>
            <View style={{flexDirection: 'row'}}>
              <Text style={{ fontSize: 28, color: '#fff' }}>&#8942;</Text>
              <Text style={{ color: '#fff', paddingTop: 10 }}>
                {this.state.activeCategory.toUpperCase()}
              </Text>
            </View>
          </MenuTrigger>
          <MenuOptions optionsContainerStyle={{ backgroundColor: 'black', opacity: .9, position: 'absolute', left: 10 }}>
            {menuOptions}
          </MenuOptions>
        </Menu>
      </View>
    );
  }

  renderCalendarButton() {
    // Don't show the calendar button if we are coming
    // from the parent.
    if (!this.props.parent) {
      return(
        <TouchableHighlight
          onPress={this.toggleDatePicker.bind(this)}>
            <Image source={require('../images/calendar_white_icon.png')}
              style={styles.calendarButton}/>
        </TouchableHighlight>
      );
    }
  }

  renderDatePicker() {
    if (this.state.datePickerVisible) {
      return(
        <View style={styles.datePicker_container}>
          <View style={styles.datePickerButton_container}>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={this.filterByType.bind(this, ActivityList.all)}
              activeOpacity={.5}>
              <Text style={styles.datePickerButton_text}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={this.toggleDatePicker.bind(this)}
              activeOpacity={.5}>
              <Text style={styles.datePickerButton_text}>Select</Text>
            </TouchableOpacity>
          </View>
          <DatePickerIOS
            date={this.state.date}
            mode="date"
            timeZoneOffsetInMinutes={this.state.timeZoneOffsetInHours * 60}
            onDateChange={this.filterByDate}
            minimumDate={this.state.minimumDate}
            style={styles.datePicker}
          />
        </View>
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
      <Image source={require('../images/main-background.png')}
        style={styles.container}>
          <MenuContext style={styles.topbar_container}>
            <View style={{
              flexDirection: 'row', 
              justifyContent: 'space-between',
              marginTop: 58
            }}>
              {this.renderTopNavigation()}
              {this.renderCalendarButton()}
            </View>
            {this.renderEmptyListText()}
            <ListView
              dataSource={this.state.dataSource}
              renderRow={this.renderRow.bind(this)}
              enableEmptySections={true}
              ref={(reference) => this.listView = reference}
            />
            {this.renderDatePicker()}
          </MenuContext>
      </Image>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#6f0cd2',
    // remove width and height to override fixed static size.
    width: null,
    height: null,
    marginBottom: 49,
  },
  topbar_container: {
    flex: 1,
  },
  // List.
  separatorItem_container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: GlobalStyles.primaryColor,
    padding: 10,
    paddingTop: 7,
    paddingBottom: 4,
  },
  listItem_container: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    paddingLeft: 20,
  },
  listItem_inner_container: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 20,
  },
  listItem_thumbnail: {
    width: 80,
    height: 80,
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
    backgroundColor: GlobalStyles.primaryColor,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GlobalStyles.primaryColor,
  },
  emptyList_text: {
    color: '#fff',
    paddingTop: 30,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  datePicker_container: {
    flex: 1,
    flexDirection: 'column',
  },
  datePicker: {
    flex: 1,
    backgroundColor: '#fff',
  },
  datePickerButton_container: {
    justifyContent:'space-between',
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,.8)',
  },
  datePickerButton: {
    flex: 2,
    borderWidth: 1,
    borderColor: GlobalStyles.primaryColor,
    padding: 5,
  },
  datePickerButton_text: {
    textAlign: 'center',
  },
  calendarButton: {
    marginRight: 8,
    marginTop: 3
  }
});

module.exports = ActivityList;
