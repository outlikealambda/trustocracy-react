/**
 * @flow
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native';
import { Octicons } from '@expo/vector-icons';

const buttonStyles = {
  getStyle (shape = 'circle', size = Sizes.LARGE) {
    size = normalizeSize(size);

    switch (shape.toLowerCase()) {
      case 'circle':
        return this.circle[size];
      case 'square':
        return this.circle[size];
      default:
        console.warn('unknown shape, defaulting to large circle');
        return this.circle.large;
    }
  },
  circle: StyleSheet.create({
    small: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      margin: 8
    },
    large: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      margin: 8
    }
  }),
  square: StyleSheet.create({
    large: {
      width: 60,
      height: 60,
      borderRadius: 2,
      alignItems: 'center',
      justifyContent: 'center',
      margin: 8
    },
    small: {
      width: 28,
      height: 28,
      borderRadius: 2,
      alignItems: 'center',
      justifyContent: 'center',
      margin: 8
    }
  })
};

const rectangularStyles = {
  get: function (size = Sizes.LARGE) {
    size = normalizeSize(size);
    return this[size];
  },
  large: StyleSheet.create({
    container: {
      justifyContent: 'center',
      height: 48,
      borderRadius: 24
    },
    text: {
      fontSize: 16,
      fontWeight: 'bold',
      marginVertical: 8,
      marginHorizontal: 12
    }
  }),
  small: StyleSheet.create({
    container: {
      justifyContent: 'center',
      height: 32,
      borderRadius: 16
    },
    text: {
      fontSize: 14,
      fontWeight: 'bold',
      marginVertical: 4,
      marginHorizontal: 8
    }
  })
};

const wrapWithTouchable = (nativeComponent, onPress) => (
  <TouchableHighlight
    onPress={onPress}
    style={{justifyContent: 'center', alignItems: 'center'}}>
    {nativeComponent}
  </TouchableHighlight>
);

/*
  type RoundedProps = {
    text: string,
    size: string,
    style: Object<any>,
    onPress: Function
  };
*/

export class RoundedButton extends Component {
  render () {
    const text = this.props.text;
    const onPress = this.props.onPress;
    const size = this.props.size;
    const style = rectangularStyles.get(size);
    const buttonStyle = this.props.buttonStyle || {};

    const button = (
      <View style={[style.container, buttonStyle]}>
        <Text style={style.text}>
          { text }
        </Text>
      </View>
    );

    return onPress ? wrapWithTouchable(button, onPress) : button;
  }
}

/*
  type IconProps = {
    backgroundColor: string,
    name: string
  };
*/

export class IconButton extends Component {
  render () {
    const backgroundColor = this.props.backgroundColor;
    const name = this.props.name;
    const color = this.props.color || 'black';
    const size = this.props.size;
    const iconStyle = this.props.iconStyle || {};
    const onPress = this.props.onPress;
    const baseStyle = buttonStyles.getStyle(this.props.shape, size);
    const buttonStyle = this.props.buttonStyle || {};

    const icon = (
      <View style={[baseStyle, {backgroundColor}, buttonStyle]} >
        <Octicons style={[{backgroundColor: 'transparent'}, iconStyle]} name={name} color={color} />
      </View>
    );

    return onPress ? wrapWithTouchable(icon, onPress) : icon;
  }
}

/*
  type InitialsProps = {
    backgroundColor: string,
    initials: string,
    circleStyle: Object<any>
  };
*/

export class InitialsButton extends Component {
  render () {
    const backgroundColor = this.props.backgroundColor;
    const initials = this.props.initials;
    const size = normalizeSize(this.props.size || Sizes.LARGE);
    const onPress = this.props.onPress;
    const baseStyle = buttonStyles.getStyle(this.props.shape, size);
    const buttonStyle = this.props.buttonStyle || {};
    const fontSize = size === Sizes.SMALL ? 12 : 24;

    const button = (
      <View style={[baseStyle, {backgroundColor}, buttonStyle]}>
        <Text style={{fontSize, fontWeight: 'bold', color: '#444'}}>
          {initials}
        </Text>
      </View>
    );

    return onPress ? wrapWithTouchable(button, onPress) : button;
  }
}

export const Sizes = {
  SMALL: 'small',
  LARGE: 'large'
};

function normalizeSize (size) {
  const enumerated = Object.values(Sizes).find(s => s === size);

  if (!enumerated) {
    console.warn('unknown size', size);
    return Sizes.LARGE;
  }

  return enumerated;
}
