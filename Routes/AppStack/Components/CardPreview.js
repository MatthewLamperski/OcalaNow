import React, {useEffect, useRef, useState} from 'react';
import {getAsset, getCard} from '../../../FireFunctions';
import {Pressable, Skeleton, Text, View, VStack} from 'native-base';
import {Animated, Dimensions, Image} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const CardPreview = ({cardObj, navigation}) => {
  const [card, setCard] = useState();
  const [logo, setLogo] = useState();
  const [loaded, setLoaded] = useState(false);
  const fadeVal = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    getAsset('logo', cardObj.card)
      .then(url => setLogo(url))
      .catch(err => console.log(err));
  }, []);
  useEffect(() => {
    getCard(cardObj.card)
      .then(cardDoc => setCard(cardDoc))
      .catch(err => console.log(err));
  }, []);
  if (card) {
    return (
      <Pressable
        onPress={() => {
          ReactNativeHapticFeedback.trigger('soft');
          navigation.navigate('CardDetailView', {
            card: card,
          });
        }}>
        <View style={{width: Dimensions.get('window').width / 2 + 1.15}}>
          <View
            justifyContent="center"
            alignItems="center"
            shadow={1}
            borderRadius={15}
            flex={1}
            p={1}
            bg={card.color}
            h={100}>
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
            </Animated.View>
          </View>
          <VStack mt={1} space={1}>
            <Text fontWeight={200} numberOfLines={1}>
              {card.title}
            </Text>
            <Text>{cardObj.text}</Text>
          </VStack>
        </View>
      </Pressable>
    );
  } else {
    return <Skeleton style={{height: 50, width: 50, borderRadius: 15}} />;
  }
};

export default CardPreview;
