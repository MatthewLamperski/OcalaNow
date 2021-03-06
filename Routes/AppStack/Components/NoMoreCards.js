import React, {useEffect, useRef} from 'react';
import {Button, Pressable, Text, View} from 'native-base';
import LottieView from 'lottie-react-native';
import {Animated} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const NoMoreCards = ({
  handleUnrecycle,
  recycled,
  title = "We couldn't find anything else right now...",
  subtitle = 'OcalaNow is updated daily. Check back later for new deals, specials, and live events going on in Ocala!',
}) => {
  const animationRef = useRef(null);
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    console.log(progress);
  }, [progress]);
  useEffect(() => {
    if (animationRef.current) {
      animationRef.current.play(0, 90);
    }
  }, []);
  return (
    <View flex={1}>
      <Text fontWeight={300} fontSize={24}>
        {title}
      </Text>
      <Text
        _light={{color: 'muted.500'}}
        _dark={{color: 'muted.400'}}
        fontWeight={200}
        fontSize={14}>
        {subtitle}
      </Text>
      <Pressable
        onPress={() => {
          if (animationRef.current) {
            ReactNativeHapticFeedback.trigger('soft');
            animationRef.current.play(0, 80);
          }
        }}
        justifyContent="center"
        alignItems="center"
        flex={2}>
        <LottieView
          ref={animationRef}
          onAnimationLoop={() => console.log('looped')}
          source={require('../../../assets/animations/Empty.json')}
          loop={false}
        />
      </Pressable>
      <View my={5}>
        {recycled && recycled.length > 0 && (
          <Button
            borderRadius={100}
            onButtonPress={() => {
              handleUnrecycle();
            }}>
            View Recycled
          </Button>
        )}
      </View>
    </View>
  );
};

export default NoMoreCards;
