import React, {useEffect, useRef, useState} from 'react';
import {Box, Pressable, Text, VStack} from 'native-base';
import {getAsset} from '../../../FireFunctions';
import {Animated, Image} from 'react-native';

const Card = ({card}) => {
  const [logo, setLogo] = useState();
  const [loaded, setLoaded] = useState(false);
  const fadeVal = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    getAsset('logo', card.docID)
      .then(url => setLogo(url))
      .catch(err => console.log(err));
  }, []);

  return (
    <Pressable
      onPress={() => console.log(JSON.stringify(card, null, 2))}
      w="100%"
      h="100%">
      <Box
        justifyContent="center"
        alignItems="center"
        shadow={3}
        bg={card.color}
        borderRadius={20}
        position="relative"
        p={5}
        flex={1}>
        <Animated.View
          style={{height: '100%', width: '100%', opacity: fadeVal}}>
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
        {/*<HStack space={3} position="absolute" bottom={0} right={0} p={5}>*/}
        {/*  <FontAwesome5 name="phone-alt" size={30} color="black" />*/}
        {/*  <FontAwesome5 name="comment" size={30} color="black" />*/}
        {/*</HStack>*/}
      </Box>
      <VStack space={1} px={2} py={5}>
        <Text fontSize={18} fontWeight={200}>
          {card.title}
        </Text>
        <Text
          fontWeight={100}
          _dark={{color: 'muted.400'}}
          _light={{color: 'muted.500'}}
          fontSize={16}>
          {card.subtitle}
        </Text>
      </VStack>
    </Pressable>
  );
};

export default Card;
