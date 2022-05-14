import React from 'react';
import {View} from 'native-base';
import VerticalLogo from '../assets/svgs/VerticalLogo';

const SplashScreen = () => {
  return (
    <View
      style={{padding: 65}}
      justifyContent="center"
      alignItems="center"
      flex={1}
      bg="primary.500">
      <VerticalLogo fill="white" height="100%" width="100%" />
    </View>
  );
};

export default SplashScreen;
