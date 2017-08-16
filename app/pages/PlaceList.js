'use strict';

import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  ListView,
  TouchableHighlight,
  ActivityIndicator,
  RefreshControl,
  AsyncStorage,
} from 'react-native';
import Menu, { MenuContext, MenuOptions, MenuOption, MenuTrigger } from 'react-native-menu';

const Util = require('../components/Util');
const ErrorText = require('../components/ErrorText');
const DataService = require('../components/DataService');
const GlobalState = require('../components/GlobalState');
const GlobalStyles = require('../components/GlobalStyles');


class PlaceList extends Component {

  static all = 'All';

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2
      }),
      allItems: [],
      categories: [],
      activeCategory: PlaceList.all,
      isListEmpty: false,
      activeCity: '',
      hasError: false,
    };
  }

  componentDidMount() {
    this.getCityFromLocalStorage()
      .then((city) => this.fetchDataFromLocalOrServer(city))
      .done();
  }

  componentWillReceiveProps(nextProps) {
    // Refresh the view if on the list view 
    // (which is the first element in the routeStack array)
    if (nextProps.navigator.state.routeStack.length === 1) {
      this.getCityFromLocalStorage().then((city) => {
        this.refreshListIfCityChanged(city);
      });
    }
  }

  refreshListView() {
    this.getCityFromLocalStorage()
      .then((city) => {
        this.fetchData(city)
          .then(()=> this.listView.scrollTo({y: 0}))
          .done();
      });
  }

  getCityFromLocalStorage() {
    return AsyncStorage.getItem('@Clubbin:city')
      .then((city) => city || '');
  }

  refreshListIfCityChanged(city) {
    // We compare the new chosen city to the active city 
    // and to the city of the first item in the list, to make sure
    // we detect when it changed.
    if (this.state.activeCity !== city ||
        this.state.allItems[1].city !== city) {
      this.setState({isLoading: true});
      this.fetchDataFromLocalOrServer(city);
    }    
  }

  fetchDataFromLocalOrServer(city) {
    let places = GlobalState.get('places');
    if (places.length) {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(places),
        isLoading: false,
        allItems: places,
        activeCity: city,
        activeCategory: PlaceList.all,
        categories: this.extractCategoriesFromItems(places),
        isListEmpty: places.length === 0 ? true : false,
      });
    }
    else {
      setTimeout(() => {
        this.fetchDataFromLocalOrServer(city);
      }, 300);
    }
  }

  fetchData(city) {
    return DataService.fetchPlaces(city)
      .then((directoryList) => {

        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(directoryList),
          isLoading: false,
          allItems: directoryList,
          activeCity: city,
          activeCategory: PlaceList.all,
          categories: this.extractCategoriesFromItems(directoryList),
          isListEmpty: directoryList.length === 0 ? true : false,
        });
      })
      .catch((error) => {
        this.setState({hasError: true});
        console.log(error);
      });
  }

  navigateTo(item) {
    // Separator letters are not clickable.
    if (item.isSeparator) return;

    this.props.navigator.push({
      title: item.title,
      componentId: 'PlaceDetail',
      passProps: {item}
    });
  }

  renderPlace(item) {
    return (
        <TouchableHighlight
          onPress={() => this.navigateTo(item)}
          underlayColor={item.isSeparator ? GlobalStyles.primaryColor : 'transparent'}>
          <View>
            <View style={styles.listItem_separator} />
            <View style={item.isSeparator ? styles.separatorItem_container : styles.listItem_container}>
                <Text style={styles.listItem_title}>{item.title}</Text>
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

  // Creates a list of unique category names, from the items.
  extractCategoriesFromItems(allItems) {
    let categories = [];
    let unique = {};

    for (let prop in allItems) {
      // Check the "category" first.
      if (typeof(unique[allItems[prop].category]) == "undefined" && 
          allItems[prop].category) {
            categories.push(allItems[prop].category);
      }
      unique[allItems[prop].category] = 0;
    }    
    // 'All' category is always present as the first.
    categories.unshift(PlaceList.all);
    return categories;
  }

  filterBy(category ='') {
    // No category, means show all;
    let items = [];
    if (category === 'All') {
        items = this.state.allItems;
    }
    else {
      items = this.state.allItems.filter((item)=> {
          return item.category === category ;
      });
      items = Util.getDirectoryList(items, false);
    }

    // Filter the list.
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(items),
      isLoading: false,
      activeCategory: category,
      isListEmpty: items.length === 0 ? true : false,
    });

    // Scroll to top. We use setTimeout so it occurrs
    // after everything else is done.
    setTimeout(()=> this.listView.scrollTo({y: 0}), 0);
  }

  getFilterButtonStyle(category='') {
    return (this.state.activeCategory === category) ?
        styles.filterButton_active :
        styles.filterButton;
  }

  getFilterButtonTextStyle(category='') {
    return (this.state.activeCategory === category) ?
        styles.filterButton_text_active :
        styles.filterButton_text;
  }

  // Displays the category name or an alias if it's "All".
  getAllDisplayName(category) {
    return category === 'All' ? 'Todos los lugares' : category;
  }
  
  renderEmptyListText() {
    // We use this flag to show a message if the list is empty.
    if (this.state.isListEmpty) {
      return(
        <Text style={styles.emptyList_text}>No hay resultados.</Text>
      );
    }
  }

  renderTopNavigation() {
    const menuOptions = this.state.categories.map((categoryName, i) => {
      return (
        <MenuOption value={categoryName} key={i}>
          <Text style={{color: 'white'}}>{this.getAllDisplayName(categoryName)}</Text>
        </MenuOption>
      );
    });

    return(
      <View style={{ padding: 6, flexDirection: 'row', backgroundColor: 'transparent' }}>
        <View style={{ flex: 1 }}></View>
        <Menu onSelect={(value) => this.filterBy(value)}>
          <MenuTrigger>
            <View style={{flexDirection: 'row'}}>
              <Text style={{ fontSize: 28, color: '#fff' }}>&#8942;</Text>
              <Text style={{ color: '#fff', paddingTop: 10, fontFamily: GlobalStyles.primaryFontSemiBold }}>
                {this.getAllDisplayName(this.state.activeCategory).toUpperCase()}
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
      <Image source={require('../images/main-background.png')} style={styles.container}>
        <MenuContext style={styles.topbar_container}>
          <View style={{
            flexDirection: 'row', 
            justifyContent: 'space-between',
            marginTop: 58
          }}>
            {this.renderTopNavigation()}
          </View>
          {this.renderEmptyListText()}
          <ListView
            dataSource={this.state.dataSource}
            renderRow={this.renderPlace.bind(this)}
            style={styles.listView}
            enableEmptySections={true}
            ref={(reference) => this.listView = reference}
            refreshControl={
              <RefreshControl
                refreshing={this.state.isLoading}
                onRefresh={this.refreshListView.bind(this)}
              />
            }
          />
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
    marginBottom: 45,
  },
   topbar_container: {
      flex: 1,
  },
  // List.
  listItem_container: {
    flex: 20,
    flexDirection: 'row',
    padding: 10,
    paddingLeft: 20,
  },
    separatorItem_container: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: GlobalStyles.primaryColor,
      padding: 10,
      paddingTop: 7,
      paddingBottom: 4,
    },
    listItem_title: {
      fontSize: 15,
      marginBottom: 4,
      color: '#fff',
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
  }
});

module.exports = PlaceList;
