import React from 'react';
import {Box, Pressable, Text, useTheme, View} from 'native-base';
import {Linking, useColorScheme} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import LinearGradient from 'react-native-linear-gradient';

const test =
  'radial-gradient(circle at 33% 100%, #fed373 4%, #f15245 30%, #d92e7f 62%, #9b36b7 85%, #515ecf)';
const SocialLink = ({social}) => {
  const colorScheme = useColorScheme();
  const {colors} = useTheme();
  const background = () => {
    if (social.type === 'twitter') {
      return '#1da1f2';
    } else if (social.type === 'fb') {
      return '#4267B2';
    } else {
      if (colorScheme === 'dark') {
        return colors.muted['700'];
      } else {
        return colors.muted['50'];
      }
    }
  };
  const icon = () => {
    if (social.type === 'fb') {
      return 'facebook';
    } else if (social.type === 'twitter') {
      return 'twitter';
    } else {
      return 'link';
    }
  };
  const text = () => {
    if (social.type === 'fb') {
      return 'Facebook';
    } else if (social.type === 'twitter') {
      return 'Twitter';
    } else {
      return social.type;
    }
  };
  if (social.type === 'insta') {
    const gradient_codes = ['#fccc63', '#fbad50', '#cd486b', '#8a3ab9'];
    return (
      <Pressable
        mx={2}
        onPress={() => {
          ReactNativeHapticFeedback.trigger('soft');
          Linking.openURL(social.link);
        }}
        justifyContent="center"
        alignItems="center">
        <Box shadow={1}>
          <LinearGradient
            start={{x: 0.0, y: 1.0}}
            end={{x: 1.0, y: 1.0}}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              width: 50,
              height: 50,
              borderRadius: 25,
            }}
            colors={['#CA1D7E', '#E35157', '#F2703F']}>
            <FontAwesome5 name="instagram" color="white" size={30} />
          </LinearGradient>
        </Box>
        <Text fontSize={10}>Instagram</Text>
      </Pressable>
    );
  } else {
    return (
      <Pressable
        mx={2}
        onPress={() => {
          ReactNativeHapticFeedback.trigger('soft');
          Linking.openURL(social.link);
        }}
        justifyContent="center"
        alignItems="center">
        <View
          shadow={1}
          justifyContent="center"
          alignItems="center"
          bg={background()}
          h={50}
          w={50}
          borderRadius={25}>
          <FontAwesome5 name={icon()} color="white" size={30} />
        </View>
        <Text fontSize={10}>{text()}</Text>
      </Pressable>
    );
  }
};

export default SocialLink;
