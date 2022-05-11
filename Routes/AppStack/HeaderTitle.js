import React from 'react';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {HStack, Text} from 'native-base';

const HeaderTitle = ({route, navigation}) => {
  const getHeaderTitle = () => {
    return getFocusedRouteNameFromRoute(route) ?? 'Home';
  };
  return (
    <HStack space={1} justifyContent="center" alignItems="center">
      {getHeaderTitle() === 'Profile' ? (
        <Text
          italic
          _light={{color: 'primary.500'}}
          _dark={{color: 'primary.200'}}
          fontWeight={300}
          fontSize={18}>
          Saved
        </Text>
      ) : (
        <Text
          italic
          _light={{color: 'primary.500'}}
          _dark={{color: 'primary.200'}}
          fontWeight={300}
          fontSize={18}>
          {getHeaderTitle()}
        </Text>
      )}
    </HStack>
  );
};

export default HeaderTitle;
