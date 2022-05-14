import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  HStack,
  PresenceTransition,
  Pressable,
  Skeleton,
  Text,
  useTheme,
  View,
  VStack,
} from 'native-base';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {Animated, Image, useColorScheme} from 'react-native';
import {
  getAsset,
  getNextEventDate,
  shareCardLink,
} from '../../../FireFunctions';
import {getDistance} from 'geolib';
import {AppContext} from '../../../AppContext';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const CardPreviewTile = ({
  card,
  navigation,
  currentTag,
  scrollToTop,
  unsave,
}) => {
  const {currentLocation, savedBank, setSavedBank, user, setUser, setError} =
    useContext(AppContext);
  const colorScheme = useColorScheme();
  const {colors} = useTheme();
  const [logo, setLogo] = useState();
  const [loaded, setLoaded] = useState(false);
  const fadeVal = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    setLogo();
    getAsset('logo', card.docID)
      .then(url => setLogo(url))
      .catch(err => console.log(err));
  }, [card.docID]);
  const title = () => {
    switch (card.type) {
      case 'info':
        return card.title;
      case 'deal':
        return card.subtitle;
      case 'event':
        return card.title;
    }
  };
  const subtitle = () => {
    switch (card.type) {
      case 'info':
        return card.subtitle;
      case 'deal':
        return card.title;
      case 'event':
        return card.subtitle;
    }
  };
  const getDistanceBetween = () => {
    return Number(
      getDistance(
        {lat: lat(), lng: lng()},
        {lat: currentLocation.lat, lng: currentLocation.lng},
      ) * 0.000621,
    ).toFixed(1);
  };
  const lat = () => {
    switch (card.type) {
      case 'info':
        return card.data.company.location.coordinate.lat;
      case 'deal':
        return card.deal.company.location.coordinate.lat;
      case 'event':
        return card.event.location.coordinate.lat;
    }
  };
  const lng = () => {
    switch (card.type) {
      case 'info':
        return card.data.company.location.coordinate.lng;
      case 'deal':
        return card.deal.company.location.coordinate.lng;
      case 'event':
        return card.event.location.coordinate.lng;
    }
  };
  const location = () => {
    switch (card.type) {
      case 'info':
        return card.data.company.location.address;
      case 'deal':
        return card.deal.company.location.address;
      case 'event':
        return card.event.location.name;
    }
  };
  const eventDate = card => {
    try {
      const date = getNextEventDate(card);
      return date;
    } catch (err) {
      console.log(card.docID, typeof card.event.startTime, err);
      return '';
    }
  };
  if (card) {
    return (
      <PresenceTransition
        initial={{opacity: 0, translateY: 20}}
        animate={{opacity: 1, transition: {duration: 300}}}
        visible>
        <Pressable
          my={1}
          p={3}
          flex={1}
          onPress={() => {
            ReactNativeHapticFeedback.trigger('soft');
            navigation.navigate('CardDetailView', {
              card: card,
            });
          }}>
          <View borderRadius={15} flex={1} w="100%">
            <View
              position="relative"
              justifyContent="center"
              alignItems="center"
              shadow={1}
              borderRadius={15}
              flex={1}
              p={2}
              bg={card.color}
              h={150}>
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
                  key={card.docID}
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
              <HStack
                space={2}
                justifyContent="center"
                alignItems="center"
                p={2}
                position="absolute"
                top={0}
                right={0}>
                <Pressable
                  bg="primary.500"
                  aspectRatio={1}
                  borderRadius={50}
                  justifyContent="center"
                  alignItems="center"
                  p={2}
                  onPress={() => {
                    ReactNativeHapticFeedback.trigger('soft');
                    shareCardLink(card, user.uid).catch(err => {
                      if (!(JSON.stringify(err) === '{}')) {
                        setError({
                          title: 'Something went wrong...',
                          message:
                            "We couldn't generate a link for that card. Try again later.",
                        });
                      }
                    });
                  }}>
                  <FontAwesome5 name="share-square" color="white" size={16} />
                </Pressable>
                {unsave && (
                  <Pressable
                    bg="error.500"
                    borderRadius={50}
                    justifyContent="center"
                    alignItems="center"
                    p={2}
                    onPress={() => {
                      ReactNativeHapticFeedback.trigger('soft');
                      setUser(prevState => ({
                        ...prevState,
                        saved: [
                          ...prevState.saved.slice(
                            0,
                            prevState.saved.indexOf(card.docID),
                          ),
                          ...prevState.saved.slice(
                            prevState.saved.indexOf(card.docID) + 1,
                          ),
                        ],
                      }));
                      setSavedBank({
                        ...savedBank,
                        [user.uid]: [
                          ...savedBank[user.uid].slice(
                            0,
                            savedBank[user.uid]
                              .map(savedCard => savedCard.docID)
                              .indexOf(card.docID),
                          ),
                          ...savedBank[user.uid].slice(
                            savedBank[user.uid]
                              .map(savedCard => savedCard.docID)
                              .indexOf(card.docID) + 1,
                          ),
                        ],
                      });
                    }}>
                    <FontAwesome5 name="trash-alt" color="white" size={16} />
                  </Pressable>
                )}
              </HStack>
            </View>
            <HStack
              py={2}
              justifyContent="flex-start"
              alignItems="center"
              space={2}>
              {card.type === 'event' && (
                <>
                  <FontAwesome5
                    name="calendar-alt"
                    size={16}
                    color={colorScheme === 'dark' ? 'white' : 'black'}
                  />
                  <Text shadow={3} fontWeight={300}>
                    {eventDate(card)}
                  </Text>
                </>
              )}
              {currentLocation && (
                <>
                  <FontAwesome5
                    name={getDistanceBetween() > 1.5 ? 'car' : 'walking'}
                    size={16}
                    color={
                      colorScheme === 'dark'
                        ? colors.muted['400']
                        : colors.muted['500']
                    }
                  />
                  <Text shadow={3} fontWeight={300}>
                    {getDistanceBetween()} mi
                  </Text>
                </>
              )}
              <FontAwesome5
                name="map-marker-alt"
                color={
                  colorScheme === 'dark'
                    ? colors.muted['400']
                    : colors.muted['500']
                }
                size={16}
              />
              <Text flex={1} numberOfLines={1} fontWeight={200}>
                {location()}
              </Text>
            </HStack>
            <HStack
              flexWrap="wrap"
              space={2}
              py={1}
              justifyContent="flex-start"
              alignItems="center">
              {card.tags.slice(0, 3).map(tag => (
                <Pressable
                  key={JSON.stringify(tag)}
                  onPress={() => {
                    if (tag === currentTag) {
                      ReactNativeHapticFeedback.trigger('notificationError');
                      scrollToTop();
                    } else {
                      ReactNativeHapticFeedback.trigger('soft');
                      navigation.push('TagView', {
                        tag,
                      });
                    }
                  }}>
                  <HStack
                    space={1}
                    justifyContent="center"
                    alignItems="center"
                    m={0.5}
                    p={1}
                    px={3}
                    shadow={2}
                    bg="primary.500"
                    borderRadius={10}>
                    <FontAwesome5 name="tags" color="white" size={12} />
                    <Text color="white" fontWeight={300} fontSize={12}>
                      {tag}
                    </Text>
                  </HStack>
                </Pressable>
              ))}
            </HStack>
            <VStack mt={1} space={1}>
              <Text fontSize={18} fontWeight={300} numberOfLines={1}>
                {title()}
              </Text>
              <Text fontSize={16} fontWeight={200}>
                {subtitle()}
              </Text>
            </VStack>
          </View>
        </Pressable>
      </PresenceTransition>
    );
  } else {
    return <Skeleton style={{height: 50, width: 50, borderRadius: 15}} />;
  }
};

export default CardPreviewTile;
