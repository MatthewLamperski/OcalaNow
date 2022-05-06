import React, {useContext, useEffect, useRef, useState} from 'react';
import {getCards, getTags} from '../../FireFunctions';
import {
  Box,
  HStack,
  PresenceTransition,
  Pressable,
  ScrollView,
  Text,
  useTheme,
  View,
} from 'native-base';
import MapView, {Circle, Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import {Alert, Dimensions, Linking} from 'react-native';
import {AppContext} from '../../AppContext';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Carousel from 'react-native-snap-carousel';
import CarouselCard from './Components/CarouselCard';

const Discover = () => {
  const {setNotification} = useContext(AppContext);
  const theme = useTheme();
  const [cards, setCards] = useState();
  const [tags, setTags] = useState();
  const [currentLocation, setCurrentLocation] = useState();
  const [centerRegion, setCenterRegion] = useState();
  const mapRef = useRef(null);
  const carouselRef = useRef(null);
  const dontShowLocationRequest = () => {
    console.log("Don't show again");
  };
  const enableLocationServices = () => {
    Linking.openSettings();
  };
  const lat = card => {
    switch (card.type) {
      case 'info':
        return card.data.company.location.coordinate.lat;
      case 'deal':
        return card.deal.company.location.coordinate.lat;
      case 'event':
        return card.event.location.coordinate.lat;
    }
  };
  const lng = card => {
    switch (card.type) {
      case 'info':
        return card.data.company.location.coordinate.lng;
      case 'deal':
        return card.deal.company.location.coordinate.lng;
      case 'event':
        return card.event.location.coordinate.lng;
    }
  };
  const icon = card => {
    switch (card.type) {
      case 'info':
        return 'store-alt';
      case 'deal':
        return 'tags';
      case 'event':
        return 'calendar-alt';
    }
  };
  const onMarkerPress = ({docID}) => {
    ReactNativeHapticFeedback.trigger('soft');
    const idx = cards.map(thisCard => thisCard.docID).indexOf(docID);
    if (carouselRef.current) {
      carouselRef.current.snapToItem(idx);
    }
    console.log(idx);
  };
  const zoomToMarker = idx => {
    const newRegion = {
      latitude: lat(cards[idx]),
      longitude: lng(cards[idx]),
      latitudeDelta: 0.04,
      longitudeDelta: 0.02,
    };
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion);
    }
  };
  useEffect(() => {
    getTags()
      .then(tags => setTags(tags))
      .catch(err => console.log(err));
  }, []);
  useEffect(() => {
    getCards()
      .then(cards => setCards(cards))
      .catch(err => console.log(err));
  }, []);
  useEffect(() => {
    if (currentLocation) {
      setCenterRegion({
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        latitudeDelta: 0.0942219283403034,
        longitudeDelta: 0.06299802738402605,
      });
    }
  }, [currentLocation]);
  useEffect(() => {
    if (centerRegion) {
      mapRef.current.animateToRegion(centerRegion);
    }
  }, [centerRegion]);
  useEffect(() => {
    Geolocation.requestAuthorization();
    Geolocation.getCurrentPosition(
      position => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      error => {
        if (error.PERMISSION_DENIED) {
          setNotification({
            title: 'Location not found',
            message:
              'OcalaNow works much better with your location. Tap to learn more',
            onPress: () => {
              Alert.alert(
                'Enable Location Services',
                "OcalaNow uses your location to enhance your experience. We can help you plan your find your way around Ocala! \nTo enable location services, go to settings, and set location services to 'While using the app'.",
                [
                  {
                    text: "Don't Show Again",
                    onPress: dontShowLocationRequest,
                    style: 'destructive',
                  },
                  {
                    text: 'Open Settings',
                    onPress: enableLocationServices,
                    style: 'cancel',
                  },
                ],
              );
            },
          });
        }
      },
    );
  }, []);

  return (
    <View style={{flex: 1}}>
      <MapView
        ref={mapRef}
        showsUserLocation={true}
        showsPointsOfInterest={false}
        style={{
          flex: 1,
        }}
        rotateEnabled={false}
        initialRegion={{
          latitude: 29.187145810393602,
          longitude: -82.13579337453811,
          latitudeDelta: 0.027679984586725936,
          longitudeDelta: 0.01851075253006229,
        }}>
        {centerRegion && (
          <Circle
            center={{
              latitude: currentLocation.lat,
              longitude: currentLocation.lng,
            }}
            radius={1.5 * 1609.34}
            fillColor={theme.colors.primary['500'] + '30'}
            strokeColor={theme.colors.primary['600']}
          />
        )}
        {cards &&
          cards.map(card => (
            <Marker
              key={card.docID}
              coordinate={{latitude: lat(card), longitude: lng(card)}}>
              <Pressable onPress={() => onMarkerPress(card)}>
                <PresenceTransition
                  initial={{opacity: 0}}
                  visible
                  animate={{opacity: 1, transition: {duration: 500}}}>
                  <View
                    p={1.5}
                    shadow={3}
                    bg="primary.500"
                    rounded="2xl"
                    justifyContent="center"
                    alignItems="center">
                    <FontAwesome5 name={icon(card)} color="white" size={14} />
                  </View>
                </PresenceTransition>
              </Pressable>
            </Marker>
          ))}
      </MapView>
      <View
        py={3}
        position="absolute"
        bg="transparent"
        bottom={0}
        w="100%"
        h="40%">
        <Carousel
          ref={carouselRef}
          data={cards}
          renderItem={({item}) => <CarouselCard card={item} />}
          sliderWidth={Dimensions.get('window').width}
          itemWidth={Dimensions.get('window').width - 20}
          onSnapToItem={idx => zoomToMarker(idx)}
        />
      </View>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        style={{position: 'absolute', top: 0, display: 'flex'}}
        horizontal={true}>
        <HStack
          p={3}
          space={2}
          display="flex"
          justifyContent="center"
          alignItems="center">
          <PresenceTransition
            initial={{opacity: 0}}
            visible
            animate={{opacity: 1, transition: {duration: 200}}}>
            <Pressable
              onPress={() => {
                ReactNativeHapticFeedback.trigger('soft');
                console.log('Walking Distance');
              }}>
              <Box
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                rounded="3xl"
                p={3}
                px={4}
                bg="muted.800">
                <FontAwesome5
                  name="walking"
                  size={16}
                  color={theme.colors.primary['500']}
                />
                <Text fontWeight={200} pl={3} color="white" fontSize={14}>
                  Walking Distance
                </Text>
              </Box>
            </Pressable>
          </PresenceTransition>
          {tags &&
            tags.map(tag => (
              <PresenceTransition
                key={tag.text}
                initial={{opacity: 0}}
                visible
                animate={{opacity: 1, transition: {duration: 200}}}>
                <Pressable
                  onPress={() => {
                    ReactNativeHapticFeedback.trigger('soft');
                    console.log(tag);
                  }}>
                  <Box
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    rounded="3xl"
                    p={3}
                    px={4}
                    bg="muted.800">
                    <FontAwesome5
                      name={tag.icon}
                      size={16}
                      color={theme.colors.primary['500']}
                    />
                    <Text fontWeight={200} pl={3} color="white" fontSize={14}>
                      {tag.text}
                    </Text>
                  </Box>
                </Pressable>
              </PresenceTransition>
            ))}
        </HStack>
      </ScrollView>
    </View>
  );
};

export default Discover;
