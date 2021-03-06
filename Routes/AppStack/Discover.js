import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {getCards, getTags} from '../../FireFunctions';
import {
  Button,
  HStack,
  PresenceTransition,
  Pressable,
  ScrollView,
  Spinner,
  Text,
  useTheme,
  View,
} from 'native-base';
import MapView, {Circle} from 'react-native-maps';
import {useColorScheme} from 'react-native';
import {AppContext} from '../../AppContext';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import BottomSheetCard from './Components/BottomSheetCard';
import CustomMarker from './Components/CustomMarker';

export const lightMapStyle = [
  {
    featureType: 'poi.business',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
];

export const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [
      {
        color: '#242f3e',
      },
    ],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#746855',
      },
    ],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#242f3e',
      },
    ],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#d59563',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#d59563',
      },
    ],
  },
  {
    featureType: 'poi.business',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [
      {
        color: '#263c3f',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#6b9a76',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      {
        color: '#38414e',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#212a37',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#9ca5b3',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [
      {
        color: '#746855',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#1f2835',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#f3d19c',
      },
    ],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [
      {
        color: '#2f3948',
      },
    ],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#d59563',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      {
        color: '#17263c',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#515c6d',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#17263c',
      },
    ],
  },
];

const Discover = ({navigation}) => {
  const {currentLocation, user, getUserLocation} = useContext(AppContext);
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const [cards, setCards] = useState();
  const [tags, setTags] = useState();
  const [centerRegion, setCenterRegion] = useState();
  const [activeFilters, setActiveFilters] = useState([]);
  const [currentCard, setCurrentCard] = useState();
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const mapRef = useRef(null);

  //Bottom Sheet stuff
  const bottomSheetRef = useRef(null);
  const [snapPoints, setSnapPoints] = useState(['10%', '30%', 450]);
  const handleSheetChanges = useCallback(idx => {
    console.log('handleSheetChanges', idx);
  }, []);

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
  const onMarkerPress = card => {
    const idx = cards.map(thisCard => thisCard.docID).indexOf(card.docID);
    console.log(cards[idx].title);
    setCurrentCard(cards[idx]);

    ReactNativeHapticFeedback.trigger('soft');
  };
  const onPressWalkingDistance = () => {
    ReactNativeHapticFeedback.trigger('soft');
    if (currentLocation) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        latitudeDelta: 0.0942219283403034,
        longitudeDelta: 0.06299802738402605,
      });
    } else {
      getUserLocation(
        "Couldn't get walking distance",
        'To use this feature, please enable location services for OcalaNow.',
      );
    }
  };
  const onPressFilter = filter => {
    ReactNativeHapticFeedback.trigger('soft');
    if (activeFilters.includes(filter)) {
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
    if (cards && !currentCard) {
      setCurrentCard(cards[Math.floor(Math.random() * cards.length)]);
    }
  }, [cards]);
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
    if (currentCard) {
      bottomSheetRef.current.snapToIndex(1);
    }
  }, [currentCard]);
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
    getUserLocation();
  }, []);

  return (
    <View style={{flex: 1}}>
      <MapView
        customMapStyle={colorScheme === 'dark' ? darkMapStyle : lightMapStyle}
        onRegionChange={() => bottomSheetRef.current.snapToIndex(0)}
        showsCompass={false}
        showsTraffic={false}
        showsBuildings={false}
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
          cards.map(card => (
            <CustomMarker
              card={card}
              filters={activeFilters}
              onPress={onMarkerPress}
            />
          ))}
      </MapView>
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
      <BottomSheet
        style={{
          backgroundColor:
            colorScheme === 'dark'
              ? theme.colors.muted['800']
              : theme.colors.muted['100'],
          borderTopRightRadius: 15,
          borderTopLeftRadius: 15,
        }}
        handleStyle={{
          backgroundColor:
            colorScheme === 'dark'
              ? theme.colors.muted['800']
              : theme.colors.muted['100'],
          borderTopRightRadius: 15,
          borderTopLeftRadius: 15,
        }}
        handleIndicatorStyle={{
          backgroundColor:
            colorScheme === 'dark'
              ? theme.colors.muted['100']
              : theme.colors.muted['800'],
        }}
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}>
        {currentCard ? (
          <View position="relative" flex={1}>
            <BottomSheetScrollView
              style={{
                backgroundColor:
                  colorScheme === 'dark'
                    ? theme.colors.muted['800']
                    : theme.colors.muted['100'],
              }}>
              <BottomSheetCard
                currentLocation={currentLocation}
                card={currentCard}
                navigation={navigation}
              />
            </BottomSheetScrollView>
            <View
              py={2}
              _dark={{borderTopWidth: 1, borderColor: 'muted.700'}}
              w="100%"
              shadow={3}
              position="absolute"
              bottom={0}>
              <Button
                py={3}
                borderRadius={100}
                onButtonPress={() => {
                  navigation.navigate('CardDetailView', {
                    card: currentCard,
                  });
                }}>
                Show me more
              </Button>
            </View>
          </View>
        ) : (
          <View p={4} flex={1}>
            <Spinner />
          </View>
        )}
      </BottomSheet>
    </View>
  );
};

export default Discover;
