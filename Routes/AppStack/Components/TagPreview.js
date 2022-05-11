import React, {useEffect, useRef, useState} from 'react';
import {getTagPic} from '../../../FireFunctions';
import {
  HStack,
  PresenceTransition,
  Pressable,
  Skeleton,
  Text,
  useTheme,
  View,
} from 'native-base';
import {Animated, Image, useColorScheme} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const TagPreview = ({item, setSelected, selected}) => {
  const colorScheme = useColorScheme();
  const {colors} = useTheme();
  const [pic, setPic] = useState();
  const [loaded, setLoaded] = useState(false);
  const fadeVal = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    getTagPic(item.text)
      .then(url => setPic(url))
      .catch(err => console.log(err));
  }, []);
  const isSelected = selected.includes(item.text);
  return (
    <PresenceTransition
      initial={{opacity: 0, translateY: 20}}
      animate={{opacity: 1, transition: {duration: 300}}}
      visible>
      <Pressable
        onPress={() => {
          ReactNativeHapticFeedback.trigger('soft');
          if (selected.includes(item.text)) {
            setSelected(prevState => [
              ...prevState.slice(0, prevState.indexOf(item.text)),
              ...prevState.slice(prevState.indexOf(item.text) + 1),
            ]);
          } else {
            setSelected(prevState => [...prevState, item.text]);
          }
        }}>
        <View
          justifyContent="center"
          alignItems="center"
          shadow={loaded ? 2 : 0}
          flex={1}
          borderRadius={20}
          h={200}>
          <Animated.View
            style={{
              height: '100%',
              width: '100%',
              opacity: fadeVal,
              position: 'relative',
              flex: 1,
              borderRadius: 20,
            }}>
            <Image
              source={{uri: pic}}
              style={{
                height: '100%',
                width: '100%',
                resizeMode: 'cover',
                borderRadius: 20,
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
            {!loaded && (
              <Skeleton
                bg="primary.100"
                style={{
                  height: '100%',
                  width: '100%',
                  borderRadius: 20,
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                }}
              />
            )}
            <View
              bg={
                isSelected
                  ? colors.muted[colorScheme === 'dark' ? '800' : '100'] + '60'
                  : 'transparent'
              }
              borderRadius={20}
              borderWidth={isSelected ? 2 : 0}
              borderColor="primary.500"
              flex={1}
              position="absolute"
              top={0}
              bottom={0}
              left={0}
              right={0}
              justifyContent="center"
              alignItems="center">
              {isSelected && (
                <FontAwesome5
                  name="check-circle"
                  color={colors.primary['500']}
                  size={50}
                />
              )}
            </View>
          </Animated.View>
        </View>
        <HStack p={2} justifyContent="space-between" alignItems="center">
          <Text
            color={
              isSelected
                ? 'primary.500'
                : colorScheme === 'dark'
                ? 'white'
                : 'muted.800'
            }
            italic
            fontSize={18}
            fontWeight={300}>
            {item.text}
          </Text>
          <FontAwesome5
            name={item.icon}
            color={
              isSelected
                ? colors.primary['500']
                : colorScheme === 'dark'
                ? 'white'
                : colors.muted['800']
            }
            size={18}
          />
        </HStack>
      </Pressable>
    </PresenceTransition>
  );
};

export default TagPreview;
