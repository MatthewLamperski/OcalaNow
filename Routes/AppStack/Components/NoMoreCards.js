import React from 'react';
import {Button, Text, View} from 'native-base';

const NoMoreCards = ({handleUnrecycle}) => {
  return (
    <View flex={1} justifyContent="center" alignItems="center">
      <Text>No more cards!</Text>
      <Button onButtonPress={() => handleUnrecycle()}>View Recycled</Button>
    </View>
  );
};

export default NoMoreCards;
