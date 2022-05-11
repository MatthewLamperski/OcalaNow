import React from 'react';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {Pressable, useTheme} from 'native-base';
import {useColorScheme} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const HeaderRight = ({route, navigation}) => {
  const getHeaderTitle = () => {
    return getFocusedRouteNameFromRoute(route) ?? 'Home';
  };
  const {colors} = useTheme();
  const colorScheme = useColorScheme();
  switch (getHeaderTitle()) {
    case 'Profile':
      return (
        <Pressable
          p={2}
          onPress={() => {
            ReactNativeHapticFeedback.trigger('soft');
            navigation.navigate('SettingsView');
          }}>
          <FontAwesome5
            name="cog"
            color={colors.primary[colorScheme === 'dark' ? '200' : '500']}
            size={18}
          />
        </Pressable>
      );
    case 'Discover':
      return null;
    case 'Feed':
      return null;
    case 'Home':
      return null;
  }
};

export default HeaderRight;
