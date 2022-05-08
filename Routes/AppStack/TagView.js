import React from 'react';
import {Text, View} from 'native-base';

const TagView = ({route}) => {
  const {tag} = route.params;
  return (
    <View flex={1}>
      <Text>{tag}</Text>
    </View>
  );
};

export default TagView;
