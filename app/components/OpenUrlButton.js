'use strict';

var React = require('react');
var ReactNative = require('react-native');
var {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} = ReactNative;


class OpenUrlButton extends React.Component {
  static propTypes = {
    url: React.PropTypes.string,
  };

  componentDidMount() {
    Linking.addEventListener('url', this.handleClick);
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleClick);
  }

  handleClick = () => {
    Linking.canOpenURL(this.props.url).then(supported => {
      if (supported) {
        Linking.openURL(this.props.url);
      } else {
        console.log('Don\'t know how to open URI: ' + this.props.url);
      }
    });
  };

  render() {
    // @todo: line below only replaces tel: attibute, update so it
    // works with mailto:, http:, etc.
    let rawUrl = this.props.url.replace('tel:', '');
    return (
      <TouchableOpacity
        onPress={this.handleClick}>
        <View>
          <Text style={this.props.style}>{rawUrl}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}


module.exports = OpenUrlButton;
