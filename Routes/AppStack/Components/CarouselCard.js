import React, {useEffect, useRef, useState} from 'react';
import {Text, View} from 'native-base';
import {getAsset} from '../../../FireFunctions';
import {ActivityIndicator, Animated, Image, StyleSheet} from 'react-native';

const CarouselCard = ({card}) => {
  const [logo, setLogo] = useState();
  const [loaded, setLoaded] = useState(false);
  const fadeVal = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    getAsset('logo', card.docID)
      .then(url => setLogo(url))
      .catch(err => console.log(err));
  }, []);
  return (
    <View m={2} p={2} flex={1} bg="transparent">
      <View
        shadow={3}
        flex={1}
        borderRadius={15}
        p={3}
        bg={card.color}
        justifyContent="center"
        alignItems="center">
        <Animated.View
          style={{
            height: '100%',
            width: '100%',
            opacity: fadeVal,
            flex: 1,
          }}>
          <Image
            source={{uri: logo}}
            style={{height: '100%', width: '100%', resizeMode: 'contain'}}
            onLoadEnd={() => {
              setLoaded(true);
              Animated.timing(fadeVal, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }).start();
            }}
          />
          <ActivityIndicator
            size="large"
            animating={!loaded}
            style={styles.activityIndicator}
          />
        </Animated.View>
      </View>

      <Text fontWeight={200} fontSize={18}>
        {card.title}
      </Text>
      <Text
        fontWeight={100}
        _dark={{color: 'muted.400'}}
        _light={{color: 'muted.500'}}
        fontSize={16}>
        {card.subtitle}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  activityIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});

export default CarouselCard;
