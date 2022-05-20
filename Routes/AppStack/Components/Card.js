import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  HStack,
  PresenceTransition,
  Pressable,
  Text,
  useTheme,
  View,
  VStack,
} from 'native-base';
import {
  getAsset,
  getNextEventDate,
  openNavigation,
} from '../../../FireFunctions';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Platform,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {getDistance} from 'geolib';
import {AppContext} from '../../../AppContext';
import MapView, {Marker} from 'react-native-maps';
import analytics from '@react-native-firebase/analytics';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const Card = ({card, currentLocation, navigation}) => {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const {user} = useContext(AppContext);
  const [logo, setLogo] = useState();
  const [loaded, setLoaded] = useState(false);
  const mapRef = useRef(null);
  const fadeVal = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    analytics()
      .logEvent('card_seen', {
        card: card.docID,
        uid: user.uid,
      })
      .then(() => console.log('card_seen logged'));
  }, []);
  useEffect(() => {
    setLogo(undefined);
    getAsset('logo', card.docID)
      .then(url => setLogo(url))
      .catch(err => console.log(err));
  }, [card.docID]);

  useEffect(() => {
    const tags = card.tags;
    const interests = user.interests ? user.interests : [];
    const intersection = tags.filter(tag => interests.includes(tag));
    const tagMatchLevel = intersection.length / card.tags.length;
    // Tag Match level of 1 means all card tags are in user interests
    const interestsMatchLevel = intersection.length / interests.length;
    // Interest Match level of 1 means that all user interests are in card tags
    const overallMatch = tagMatchLevel * interestsMatchLevel;
  }, []);

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

  const getDistanceBetween = () => {
    return Number(
      getDistance(
        {lat: lat(), lng: lng()},
        {lat: currentLocation.lat, lng: currentLocation.lng},
      ) * 0.000621,
    ).toFixed(1);
  };

  const fitToMarker = () => {
    if (mapRef.current) {
      const coordinates = currentLocation
        ? [
            {
              latitude: lat(),
              longitude: lng(),
            },
            {latitude: currentLocation.lat, longitude: currentLocation.lng},
          ]
        : [
            {
              latitude: lat(),
              longitude: lng(),
            },
          ];
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: currentLocation
          ? {top: 15, bottom: 15, left: 100, right: 100}
          : {
              top: 100,
              bottom: 100,
              left: 100,
              right: 100,
            },
        animated: true,
      });
    }
  };

  const address = () => {
    switch (card.type) {
      case 'info':
        return card.data.company.location.address + ' Ocala, FL';
      case 'event':
        return card.event.location.address + ' Ocala, FL';
      case 'deal':
        return card.deal.company.location.address + ' Ocala, FL';
    }
  };
  const phone = () => {
    switch (card.type) {
      case 'info':
        return card.data.company.phone;
      case 'event':
        return card.event.contact.phone;
      case 'deal':
        return card.deal.company.phone;
    }
  };

  const website = () => {
    switch (card.type) {
      case 'info':
        return card.data.company.website;
      case 'event':
        return card.event.contact.website;
      case 'deal':
        return card.deal.company.website;
    }
  };

  return (
    <PresenceTransition
      initial={{opacity: 0, scale: 0.5}}
      animate={{opacity: 1, scale: 1, transition: {duration: 300}}}
      visible>
      <View bg="transparent" w="100%" h="100%">
        <Pressable
          onPress={() => {
            navigation.navigate('CardDetailView', {
              card: card,
            });
          }}
          justifyContent="center"
          alignItems="center"
          shadow={3}
          bg={card.color}
          borderRadius={20}
          position="relative"
          p={5}
          flex={1}>
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
          <ActivityIndicator
            size="large"
            animating={!loaded}
            style={styles.activityIndicator}
          />
        </Pressable>
        <VStack space={1} px={2} py={2}>
          <Pressable
            onPress={() => {
              Alert.alert(
                'Get Directions',
                `Open location in ${Platform.select({
                  android: 'Google',
                  ios: 'Apple',
                })} Maps?`,
                [
                  {text: 'Cancel', style: 'cancel'},
                  {
                    text: 'Open',
                    style: 'default',
                    onPress: () => {
                      openNavigation(address(), user.uid, card);
                    },
                  },
                ],
              );
            }}
            position="relative"
            width="100%"
            style={{height: 75}}
            shadow={3}
            borderRadius={20}
            overflow="hidden"
            my={2}>
            <MapView
              pitchEnabled={false}
              rotateEnabled={false}
              scrollEnabled={false}
              zoomEnabled={false}
              scrollDuringRotateOrZoomEnabled={false}
              zoomTapEnabled={false}
              zoomControlEnabled={false}
              showsUserLocation
              ref={mapRef}
              style={{flex: 1, borderRadius: 20, position: 'relative'}}
              initialRegion={{
                latitude: lat(),
                longitude: lng(),
                latitudeDelta: 0.001,
                longitudeDelta: 0.001,
              }}
              onMapReady={fitToMarker}>
              <Marker coordinate={{latitude: lat(), longitude: lng()}}>
                <View
                  display="flex"
                  bg="primary.500"
                  style={{height: 30, width: 30}}
                  borderWidth={1}
                  borderColor="primary.50"
                  shadow={2}
                  borderRadius={15}
                  justifyContent="center"
                  alignItems="center">
                  <FontAwesome5
                    name={
                      card.type === 'deal'
                        ? 'tag'
                        : card.type === 'event'
                        ? 'calendar-alt'
                        : card.type === 'info'
                        ? 'store-alt'
                        : 'dot-circle'
                    }
                    color="white"
                    size={14}
                  />
                </View>
              </Marker>
            </MapView>
          </Pressable>
          <HStack space={2} justifyContent="flex-start" alignItems="baseline">
            {card.type === 'event' && (
              <HStack justifyContent="center" alignItems="center" space={2}>
                <FontAwesome5
                  name="calendar-alt"
                  size={16}
                  color={colorScheme === 'dark' ? 'white' : 'black'}
                />
                <Text shadow={3} fontWeight={300}>
                  {getNextEventDate(card)}
                </Text>
              </HStack>
            )}
            {currentLocation && (
              <HStack justifyContent="center" alignItems="center" space={2}>
                <FontAwesome5
                  name={getDistanceBetween() > 1.5 ? 'car' : 'walking'}
                  size={16}
                  color={colorScheme === 'dark' ? 'white' : 'black'}
                />
                <Text shadow={3} fontWeight={300}>
                  {getDistanceBetween()} mi
                </Text>
              </HStack>
            )}
          </HStack>
          {card.tags && (
            <HStack flexWrap="wrap" space={2} py={1}>
              {card.tags.slice(0, 3).map(tag => (
                <Pressable
                  key={tag}
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
          )}
          <Pressable
            onPress={() => {
              navigation.navigate('CardDetailView', {
                card: card,
              });
            }}>
            <VStack space={1}>
              <Text fontSize={20} fontWeight={200}>
                {card.title}
              </Text>
              <HStack justifyContent="flex-start" alignItems="center" space={1}>
                <FontAwesome5
                  name={card.type === 'info' ? 'store-alt' : 'map-marker-alt'}
                  color={
                    colorScheme === 'dark'
                      ? theme.colors.muted['400']
                      : theme.colors.muted['500']
                  }
                  size={16}
                />
                <Text
                  fontWeight={100}
                  _dark={{color: 'muted.400'}}
                  _light={{color: 'muted.500'}}
                  fontSize={16}>
                  {card.subtitle}
                </Text>
              </HStack>
            </VStack>
          </Pressable>
        </VStack>
      </View>
    </PresenceTransition>
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
  actionButton: {
    height: 50,
    width: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Card;
