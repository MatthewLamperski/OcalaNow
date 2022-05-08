import React, {useEffect, useRef, useState} from 'react';
import {HStack, Pressable, Text, useTheme, View} from 'native-base';
import {getAsset} from '../../../FireFunctions';
import {
  ActivityIndicator,
  Animated,
  Image,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const CarouselCard = ({card, navigation}) => {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const [logo, setLogo] = useState();
  const [loaded, setLoaded] = useState(false);
  const fadeVal = useRef(new Animated.Value(0)).current;
  const cardBackground =
    colorScheme === 'dark' ? theme.colors.muted['800'] : 'white';
  useEffect(() => {
    getAsset('logo', card.docID)
      .then(url => setLogo(url))
      .catch(err => console.log(err));
  }, []);
  return (
    <View justifyContent="flex-end" bg="transparent" m={2} flex={1}>
      <Pressable
        onPress={() => {
          ReactNativeHapticFeedback.trigger('soft');
          navigation.navigate('CardDetailView', {
            card: card,
          });
        }}>
        <View
          bg={cardBackground}
          shadow={1}
          p={5}
          borderRadius={20}
          flexDirection="row"
          w="100%">
          <View
            shadow={3}
            w="20%"
            aspectRatio={1}
            borderRadius={100}
            p={1}
            mb={3}
            bg={card.color}
            justifyContent="center"
            alignItems="center">
            <Animated.View
              style={{
                height: '100%',
                width: '100%',
                opacity: fadeVal,
                flex: 1,
                overflow: 'hidden',
              }}>
              <Image
                source={{uri: logo}}
                style={{
                  height: '100%',
                  width: '100%',
                  resizeMode: 'contain',
                  borderRadius: 100,
                }}
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
          <View bg={cardBackground} ml={3} flex={1}>
            <Text fontWeight={200} fontSize={16}>
              {card.title}
            </Text>
            <Text
              fontWeight={100}
              _dark={{color: 'muted.400'}}
              _light={{color: 'muted.500'}}
              fontSize={16}>
              {card.subtitle}
            </Text>
            {card.tags && (
              <HStack flexWrap="wrap" space={2} py={1}>
                {card.tags.slice(0, 2).map(tag => (
                  <Pressable
                    key={JSON.stringify(tag)}
                    onPress={() => {
                      ReactNativeHapticFeedback.trigger('soft');
                      navigation.navigate('TagView', {
                        tag,
                      });
                    }}>
                    <HStack
                      space={1}
                      justifyContent="center"
                      alignItems="center"
                      m={0.5}
                      p={1}
                      px={2}
                      shadow={2}
                      bg="primary.500"
                      borderRadius={10}>
                      <FontAwesome5 name="tags" color="white" size={12} />
                      <Text color="white" fontWeight={300} fontSize={10}>
                        {tag}
                      </Text>
                    </HStack>
                  </Pressable>
                ))}
              </HStack>
            )}
          </View>
        </View>
      </Pressable>
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
