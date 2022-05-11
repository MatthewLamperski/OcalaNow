import React from 'react';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {Pressable, useTheme} from 'native-base';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {useColorScheme} from 'react-native';

const HeaderLeft = ({route, navigation}) => {
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
            navigation.replace('InterestsSelectionView');
          }}>
          <FontAwesome5
            name="tags"
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
      return (
        <Pressable
          p={2}
          onPress={() => {
            ReactNativeHapticFeedback.trigger('soft');
            navigation.replace('InterestsSelectionView');
          }}>
          <FontAwesome5
            name="tags"
            color={colors.primary[colorScheme === 'dark' ? '200' : '500']}
            size={18}
          />
        </Pressable>
      );
  }
};

export default HeaderLeft;
