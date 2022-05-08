import React, {useContext, useEffect, useRef, useState} from 'react';
import {getCards, getTags} from '../../FireFunctions';
import {
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
import {Alert, Dimensions, Linking, useColorScheme} from 'react-native';
import {AppContext} from '../../AppContext';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Carousel from 'react-native-snap-carousel';
import CarouselCard from './Components/CarouselCard';

const Discover = ({navigation}) => {
  const {setNotification, user} = useContext(AppContext);
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const [cards, setCards] = useState();
  const [displayedCards, setDisplayedCards] = useState();
  const [tags, setTags] = useState();
  const [currentLocation, setCurrentLocation] = useState();
  const [centerRegion, setCenterRegion] = useState();
  const [showCarousel, setShowCarousel] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [currentRegion, setCurrentRegion] = useState();
  const mapRef = useRef(null);
  const carouselRef = useRef(null);
  const getCurrentLocation = (title, message) => {
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
            title: title ? title : 'Location not found',
            message: message
              ? message
              : 'OcalaNow works much better with your location. Tap to learn more',
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
  };
  const dontShowLocationRequest = () => {
    console.log("Don't show again");
  };
  const enableLocationServices = () => {
    Linking.openSettings().then(res => console.log(res));
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
  const filterBackground = filter =>
    activeFilters.includes(filter)
      ? 'primary.500'
      : colorScheme === 'dark'
      ? 'muted.800'
      : 'white';
  const filterText = filter =>
    activeFilters.includes(filter)
      ? 'white'
      : colorScheme === 'dark'
      ? 'white'
      : 'black';
  const filterIcon = filter =>
    activeFilters.includes(filter) ? 'white' : theme.colors.primary['500'];

  const markerOpacity = card =>
    activeFilters.length === 0
      ? 1
      : activeFilters.filter(tag => card.tags.includes(tag)).length >= 1
      ? 1
      : 0.2;

  const sortCardsByMatch = (card1, card2) => {
    /*
      Takes in card1 and card2
        - point is given to card if card tag is in user interests
        - card with more points is greater than card with less points
     */
    const interests = user.interests ? user.interests : [];

    const tags1 = card1.tags;

    const intersection1 = tags1.filter(tag => interests.includes(tag));
    const tagMatchLevel1 = intersection1.length / card1.tags.length;
    // Tag Match level of 1 means all card tags are in user interests
    const interestsMatchLevel1 = intersection1.length / interests.length;
    // Interest Match level of 1 means that all user interests are in card tags
    const overallMatch1 = tagMatchLevel1 * interestsMatchLevel1;

    const tags2 = card2.tags;
    const intersection2 = tags2.filter(tag => interests.includes(tag));
    const tagMatchLevel2 = intersection2.length / card2.tags.length;
    const interestsMatchLevel2 = intersection2.length / interests.length;
    const overallMatch2 = tagMatchLevel2 * interestsMatchLevel2;

    return overallMatch1 < overallMatch2;
  };
  const onMarkerPress = ({docID}) => {
    const idx = cards.map(thisCard => thisCard.docID).indexOf(docID);
    if (!showCarousel) {
      setShowCarousel(idx);
    }
    ReactNativeHapticFeedback.trigger('soft');
    if (carouselRef.current) {
      carouselRef.current.snapToItem(idx, false);
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
  const onPressWalkingDistance = () => {
    ReactNativeHapticFeedback.trigger('soft');
    setShowCarousel();
    if (currentLocation) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        latitudeDelta: 0.0942219283403034,
        longitudeDelta: 0.06299802738402605,
      });
    } else {
      getCurrentLocation(
        "Couldn't get walking distance",
        'To use this feature, please enable location services for OcalaNow.',
      );
    }
  };
  const onPressFilter = filter => {
    ReactNativeHapticFeedback.trigger('soft');
    if (activeFilters.includes(filter)) {
      console.log(
        'Pre',
        [...activeFilters.slice(0, activeFilters.indexOf(filter))],
        'Post',
        [...activeFilters.slice(activeFilters.indexOf(filter) + 1)],
      );
      setActiveFilters(prevState => [
        ...prevState.slice(0, prevState.indexOf(filter)),
        ...prevState.slice(prevState.indexOf(filter) + 1),
      ]);
    } else {
      setActiveFilters(prevState => [...prevState, filter]);
    }
  };
  const filterByTag = card => {
    const intersection = tags.filter(tag => card.tags.includes(tag));
    return intersection.length >= 1;
  };
  useEffect(() => {
    getTags()
      .then(tags => setTags(tags))
      .catch(err => console.log(err));
  }, []);
  useEffect(() => {
    getCards()
      .then(cards => setCards(cards.sort(sortCardsByMatch)))
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
    getCurrentLocation();
  }, []);
  useEffect(() => {
    if (activeFilters) {
      console.log(activeFilters);
    } else {
      setDisplayedCards();
    }
  }, [activeFilters]);

  return (
    <View style={{flex: 1}}>
      <MapView
        showsCompass={false}
        showsTraffic={false}
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
            strokeColor={
              colorScheme === 'dark'
                ? theme.colors.primary['600']
                : theme.colors.primary['400']
            }
          />
        )}
        {cards &&
          (displayedCards ? displayedCards : cards).map(card => (
            <Marker
              key={card.docID}
              coordinate={{latitude: lat(card), longitude: lng(card)}}>
              <Pressable onPress={() => onMarkerPress(card)}>
                <PresenceTransition
                  initial={{opacity: 0}}
                  visible
                  animate={{opacity: 1, transition: {duration: 500}}}>
                  <View
                    opacity={markerOpacity(card)}
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
      <View py={3} position="absolute" bg="transparent" bottom={0} w="100%">
        <Carousel
          ref={carouselRef}
          data={cards}
          renderItem={({item}) => (
            <CarouselCard
              carouselRef={carouselRef}
              setShowCarousel={setShowCarousel}
              navigation={navigation}
              card={item}
            />
          )}
          firstItem={showCarousel ? showCarousel : 0}
          sliderWidth={Dimensions.get('window').width}
          itemWidth={Dimensions.get('window').width - 20}
          onSnapToItem={idx => zoomToMarker(idx)}
        />
        <HStack px={3} p={1} justifyContent="space-between" alignItems="center">
          <View
            _light={{bg: 'white'}}
            _dark={{bg: 'muted.800'}}
            shadow={3}
            p={1}
            rounded="100">
            <Pressable
              p={2}
              justifyContent="center"
              alignItems="center"
              onPress={() => {
                ReactNativeHapticFeedback.trigger('soft');
                carouselRef.current.snapToPrev();
              }}>
              <FontAwesome5
                name="chevron-left"
                color={colorScheme === 'dark' ? 'white' : 'black'}
                size={20}
              />
            </Pressable>
          </View>
          <View
            _light={{bg: 'white'}}
            _dark={{bg: 'muted.800'}}
            justifyContent="center"
            alignItems="center"
            shadow={3}
            p={1}
            rounded="100">
            <Pressable
              p={2}
              justifyContent="center"
              alignItems="center"
              onPress={() => {
                ReactNativeHapticFeedback.trigger('soft');
                carouselRef.current.snapToNext();
              }}>
              <FontAwesome5
                name="chevron-right"
                color={colorScheme === 'dark' ? 'white' : 'black'}
                size={20}
              />
            </Pressable>
          </View>
        </HStack>
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
            <Pressable onPress={onPressWalkingDistance}>
              <View
                _light={{bg: 'white'}}
                _dark={{bg: 'muted.800'}}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                rounded="3xl"
                p={3}
                px={4}>
                <FontAwesome5
                  name="walking"
                  size={20}
                  color={theme.colors.primary['500']}
                />
              </View>
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
                    onPressFilter(tag.text);
                  }}>
                  <View
                    bg={filterBackground(tag.text)}
                    shadow={1}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    rounded="3xl"
                    p={3}
                    px={4}>
                    <FontAwesome5
                      name={tag.icon}
                      size={16}
                      color={filterIcon(tag.text)}
                    />
                    <Text
                      color={filterText(tag.text)}
                      fontWeight={200}
                      pl={3}
                      fontSize={14}>
                      {tag.text}
                    </Text>
                  </View>
                </Pressable>
              </PresenceTransition>
            ))}
        </HStack>
      </ScrollView>
    </View>
  );
};

export default Discover;
