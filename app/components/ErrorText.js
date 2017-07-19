'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
} from 'react-native';

class ErrorText extends Component {

  render() {
    let message='No se pudo conectar a Internet. \nPor favor, intenta más tarde.'
    return (
      <Text style={styles.errorText}>{message}</Text>
    );
  }

}

const styles = StyleSheet.create({
  errorText: {
    fontSize: 13,
    color: '#fff',
    paddingTop: 200,
    textAlign: 'center',
    backgroundColor: 'transparent',
  }
});

module.exports = ErrorText;
