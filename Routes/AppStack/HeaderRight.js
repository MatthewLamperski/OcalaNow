import React from 'react';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {Pressable, useTheme} from 'native-base';
import {Alert, useColorScheme} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {signOut} from '../../FireFunctions';

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
            Alert.alert(
              'Sign Out',
              'Are you sure you want to sign out of OcalaNow? You will have to sign back in to use OcalaNow again.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Sign Out',
                  style: 'destructive',
                  onPress: () => {
                    signOut();
                  },
                },
              ],
            );
          }}>
          <FontAwesome5
            name="sign-out-alt"
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
