import React from 'react';
import {Text, View} from 'native-base';

const CardDetailView = ({route}) => {
  const {card} = route.params;
  return (
    <View flex={1} justifyContent="center" alignItems="center">
      <Text>{card.docID}</Text>
    </View>
  );
};

export default CardDetailView;
