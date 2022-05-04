import React from 'react';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {Box, HStack, Text} from 'native-base';
import TagLogoGold from '../../assets/svgs/TagLogoGold';

const HeaderTitle = ({route, navigation}) => {
  const getHeaderTitle = () => {
    return getFocusedRouteNameFromRoute(route) ?? 'Home';
  };
  return (
    <HStack space={1} justifyContent="center" alignItems="center">
      <Box h="100%" w="30">
        <TagLogoGold height={25} width="100%" />
      </Box>
      <Text fontSize={16} fontWeight={300}>
        {getHeaderTitle()}
      </Text>
    </HStack>
  );
};

export default HeaderTitle;
