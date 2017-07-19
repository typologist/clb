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
  AsyncStorage,
} from 'react-native';
import Menu, { MenuContext, MenuOptions, MenuOption, MenuTrigger } from 'react-native-menu';

const Util = require('../components/Util');
const ErrorText = require('../components/ErrorText');
const GlobalStyles = require('../components/GlobalStyles');
const PlaceDetail = require('./PlaceDetail');
const REQUEST_URL =  'http://clubbinrd.com/api/places?city=';

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
      activeCategory: PlaceList.all,
      categories: [],
      isListEmpty: false,
      hasError: false,
    };
  }

  componentDidMount() {
    AsyncStorage.getItem('@Clubbin:city').then((city) => {
      city = city || '';
      this.fetchData(city);
    }).done();
  }

  fetchData(city) {
    fetch(REQUEST_URL + city)
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData) {
          let results = responseData;

          // Add the letters separators to the list.
          let directoryList = this.getDirectoryList(results);

          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(directoryList),
            isLoading: false,
            allItems: results,
            categories: this.extractCategoriesFromItems(results),
            isListEmpty: results.length === 0 ? true : false,
          });
        }
        else {
          throw new Error('fetch() could not load data from the server.');
        }

      })
      .catch((error) => {
        this.setState({hasError: true});
        console.log(error);
      })
      .done();
  }

  // Creates a list with letters separators.
  getDirectoryList(results) {
    let lettersHash = this.getAlphaNumericHash();
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
        if (this.startsWith(firstChar, lettersHash)) {
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

  startsWith(char, lettersHash) {
    return lettersHash[char] && lettersHash[char] === char;
  }

  // Returns an object with format { A:'A', ...}
  getAlphaNumericHash() {
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

  navigateTo(item) {
    // Separator letters are not clickable.
    if (item.isSeparator) return;

    this.props.navigator.push({
      title: item.title,
      component: PlaceDetail,
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

  filterBy(category ='') {
    // No category, means show all;
    let items = [];
    if (category === 'All') {
        items = this.state.allItems;
    }
    else {
      items = this.state.allItems.filter((item)=> {
          return item.category === category;
      });
    }

    // Add the letter separators.
    items = this.getDirectoryList(items);

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

  // Creates a list of unique category names, from the items.
  extractCategoriesFromItems(allItems) {
    let categories = [];
    let unique = {};

    for (let prop in allItems) {
      // Check the "category" first.
      if (typeof(unique[allItems[prop].category]) == "undefined" && 
          allItems[prop].category !== null) {
        categories.push(allItems[prop].category);
      }
      unique[allItems[prop].category] = 0;
    }    
    // 'All' category is always present as the first.
    categories.unshift(PlaceList.all);
    return categories;
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

  renderEmptyListText() {
    // We use this flag to show a message if the list is empty.
    if (this.state.isListEmpty) {
      return(
        <Text style={styles.emptyList_text}>No hay resultados en el área elegida.</Text>
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
        <Menu onSelect={(value) => this.filterBy(value)}>
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
            enableEmptySections={true}
            ref={(reference) => this.listView = reference}
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
