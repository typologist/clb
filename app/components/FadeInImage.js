'use strict';

import React, { Component } from 'react';
import {
  Image,
  Animated,
} from 'react-native';

class FadeInImage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      opacity: new Animated.Value(0)
    };
  }

  onLoad = ()=> {
    Animated.timing(this.state.opacity, {
      toValue: 1,
      duration: 1000
    }).start();
  };

  render() {
    return (
        <Animated.Image
          resizeMode={'contain'}
          key={this.props.key}
          style={[{opacity: this.state.opacity}, this.props.style]}
          source={this.props.source}
          onLoad={this.onLoad} />
    )
  }

}

module.exports = FadeInImage;
