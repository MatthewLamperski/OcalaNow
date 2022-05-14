import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Box,
  Button,
  HStack,
  Pressable,
  Spinner,
  Text,
  useTheme,
  View,
  VStack,
} from 'native-base';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {AppContext} from '../../AppContext';
import {
  activated,
  getAsset,
  getCard,
  getNextEventDate,
  getTimeUntilNextUse,
  goToEvent,
  openNavigation,
  shareCardLink,
  unGoToEvent,
  useDeal,
} from '../../FireFunctions';
import {getDistance} from 'geolib';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import SocialLink from './Components/SocialLink';
import LinearGradient from 'react-native-linear-gradient';
import analytics from '@react-native-firebase/analytics';

const CardDetailView = ({route, navigation}) => {
  const {bottom} = useSafeAreaInsets();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const {
    user,
    setUser,
    currentLocation,
    setError,
    getUserLocation,
    savedBank,
    setSavedBank,
  } = useContext(AppContext);
  const [logo, setLogo] = useState();
  const [loaded, setLoaded] = useState(false);
  const [buttonPressed, setButtonPressed] = useState(false);
  const [card, setCard] = useState(route.params.card);
  const [shareLoading, setShareLoading] = useState(false);
  const [savedLoading, setSaveLoading] = useState(false);
  const mapRef = useRef(null);
  const fadeVal = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (card.docID) {
      getAsset('logo', card.docID)
        .then(url => setLogo(url))
        .catch(err => console.log(err));
    }
  }, [card]);
  const [active, setActive] = useState(activated(card, user));
  useEffect(() => {
    setActive(activated(card, user));
  }, [buttonPressed]);
  useEffect(() => {
    if (card.type) {
    } else {
      getCard(card)
        .then(doc => setCard(doc))
        .catch(err => setCard(null));
    }
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
  const mapSubtitle = () => {
    switch (card.type) {
      case 'info':
        return card.data.company.location.address;
      case 'deal':
        return card.deal.company.location.address;
      case 'event':
        return card.event.location.name;
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

  const expiration = () => {
    try {
      const date = new Date(card.deal.expiration.seconds * 1000);
      const month = date.toLocaleString('default', {month: 'long'});
      const day = date.toLocaleString('default', {day: 'numeric'});
      const time = date.toLocaleString('default', {timeStyle: 'short'});
      return `${month} ${day}`;
    } catch (err) {
      console.log(card.deal);
      return '';
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

  const socials = () => {
    switch (card.type) {
      case 'info':
        return card.data.company.socials ? card.data.company.socials : [];
      case 'event':
        return card.event.socials ? card.event.socials : [];
      case 'deal':
        return card.deal.company.socials ? card.deal.company.socials : [];
    }
  };

  const buttonText = () => {
    if (active) {
      switch (card.type) {
        case 'info':
          return 'Take Me There';
        case 'deal':
          return 'Redeem';
        case 'event':
          return "I'm going!";
      }
    } else {
      switch (card.type) {
        case 'info':
          return 'Take Me There';
        case 'deal':
          return getTimeUntilNextUse(card, user);
        case 'event':
          return 'Not going?';
      }
    }
  };
  const onButtonPress = () => {
    setButtonPressed(!buttonPressed);

    if (active) {
      if (card.type === 'info') {
        openNavigation(address(), user.uid, card);
      } else if (card.type === 'deal') {
        useDeal(card, user, setUser);
      } else if (card.type === 'event') {
        goToEvent(card, user, setUser);
      }
    } else {
      if (card.type === 'info') {
        openNavigation(address(), user.uid, card);
      } else if (card.type === 'event') {
        unGoToEvent(card, user, setUser);
      }
    }
    return true;
  };
  const disabled = () => {
    switch (card.type) {
      case 'info':
        return false;
      case 'deal':
        return !active;
      case 'event':
        return false;
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);
  useEffect(() => {
    analytics()
      .logEvent('card_detail_seen', {
        card: card.docID,
        uid: user.uid,
      })
      .then(() => console.log('card_detail_seen logged'));
  }, []);
  if (card.type) {
    return (
      <View flex={1}>
        <ScrollView>
          <View
            h={Dimensions.get('window').height * 0.25}
            p={4}
            w="100%"
            position="relative"
            bg={card.color}>
            <Animated.View
              style={{
                width: '100%',
                height: '100%',
                opacity: fadeVal,
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
            {!loaded && (
              <Spinner
                position="absolute"
                top={0}
                bottom={0}
                right={0}
                left={0}
                size="large"
                color={colorScheme === 'dark' ? 'white' : 'black'}
              />
            )}
          </View>
          <VStack w="100%" space={1} px={3} py={2}>
            <Pressable
              bg="red.500"
              position="relative"
              overflow="hidden"
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
              style={{height: 175, width: '100%'}}
              shadow={3}
              borderRadius={20}
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
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  right: 0,
                  left: 0,
                }}
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
            <HStack
              flex={1}
              mt={2}
              space={2}
              justifyContent="flex-start"
              alignItems="baseline">
              {card.type === 'event' && (
                <HStack
                  justifyContent="flex-start"
                  alignItems="baseline"
                  space={2}>
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
                <>
                  <FontAwesome5
                    name={getDistanceBetween() > 1.5 ? 'car' : 'walking'}
                    size={16}
                    color={
                      colorScheme === 'dark'
                        ? theme.colors.muted['400']
                        : theme.colors.muted['500']
                    }
                  />
                  <Text shadow={3} fontWeight={300}>
                    {getDistanceBetween()} mi
                  </Text>
                </>
              )}
              <HStack
                justifyContent="flex-start"
                alignItems="baseline"
                overflow="hidden"
                space={2}>
                <FontAwesome5
                  name="map-marker-alt"
                  color={
                    colorScheme === 'dark'
                      ? theme.colors.muted['400']
                      : theme.colors.muted['500']
                  }
                  size={16}
                />
                <Text numberOfLines={1} fontWeight={200}>
                  {mapSubtitle()}
                </Text>
              </HStack>
            </HStack>
            <ScrollView horizontal>
              <HStack
                p={2}
                space={3}
                justifyContent="center"
                alignItems="center">
                <Pressable
                  onPress={() => {
                    ReactNativeHapticFeedback.trigger('soft');
                    Linking.openURL(`tel:${phone()}`);
                  }}
                  justifyContent="center"
                  alignItems="center">
                  <LinearGradient
                    colors={[
                      theme.colors.primary['500'],
                      theme.colors.primary['400'],
                    ]}
                    useAngle
                    angle={75}
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 25,
                      height: 50,
                      width: 50,
                    }}>
                    <Box shadow={1}>
                      <FontAwesome5 name="phone-alt" color="white" size={25} />
                    </Box>
                  </LinearGradient>

                  <Text fontSize={10}>Call</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    ReactNativeHapticFeedback.trigger('soft');
                    Linking.openURL(website());
                  }}
                  justifyContent="center"
                  alignItems="center">
                  <LinearGradient
                    colors={[
                      theme.colors.primary['500'],
                      theme.colors.primary['400'],
                    ]}
                    useAngle
                    angle={45}
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 25,
                      height: 50,
                      width: 50,
                    }}>
                    <Box shadow={1}>
                      <FontAwesome5 name="globe" color="white" size={25} />
                    </Box>
                  </LinearGradient>
                  <Text fontSize={10}>Website</Text>
                </Pressable>
                {socials().map((social, idx) => (
                  <SocialLink key={idx} social={social} />
                ))}
              </HStack>
            </ScrollView>
            {card.type !== 'info' && (
              <View>
                <Text fontWeight={200}>
                  {card.type === 'event' ? 'Description' : 'Terms'}
                </Text>
                {card.type === 'event' ? (
                  <View flex={1}>
                    <Text>{card.event.description}</Text>
                  </View>
                ) : (
                  <View>
                    {[`Expires on ${expiration()}.`, ...card.deal.terms].map(
                      (term, idx) => (
                        <HStack
                          key={idx}
                          space={2}
                          p={2}
                          justifyContent="flex-start"
                          alignItems="center">
                          <FontAwesome5
                            name="circle"
                            solid
                            color={colorScheme === 'dark' ? 'white' : 'black'}
                            size={10}
                          />
                          <Text>{term}</Text>
                        </HStack>
                      ),
                    )}
                  </View>
                )}
              </View>
            )}
          </VStack>
        </ScrollView>
        <View
          borderTopWidth={colorScheme === 'dark' ? 1 : 0}
          borderTopColor="muted.700"
          shadow={3}
          pb={bottom}
          p={4}>
          {card.tags && (
            <HStack flexWrap="wrap" space={2} py={1}>
              {card.tags.slice(0, 3).map((tag, idx) => (
                <Pressable
                  overflow="visible"
                  key={idx}
                  onPress={() => {
                    ReactNativeHapticFeedback.trigger('soft');
                    if (Platform.OS === 'ios') {
                      navigation.goBack();
                    }
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
          <View>
            <VStack space={1}>
              <Text fontSize={18} fontWeight={200}>
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
              <HStack justifyContent="space-between" alignItems="center">
                <Button
                  flex={1}
                  mx={1}
                  p={3}
                  isDisabled={disabled()}
                  _text={{shadow: 2}}
                  onButtonPress={() => {
                    onButtonPress();
                  }}
                  borderRadius={100}>
                  {buttonText()}
                </Button>
                {card.type === 'event' && !active && (
                  <Button
                    flex={1}
                    mx={1}
                    p={3}
                    borderRadius={100}
                    _text={{shadow: 2}}
                    onButtonPress={() => {
                      openNavigation(address(), user.uid, card);
                    }}>
                    Take me!
                  </Button>
                )}
                {user.saved && !user.saved.includes(card.docID) && (
                  <Button
                    isLoading={savedLoading}
                    p={0}
                    m={1}
                    borderWidth={2}
                    borderColor="primary.500"
                    style={styles.actionButton}
                    _light={{bg: 'muted.100', _pressed: {bg: 'muted.200'}}}
                    _dark={{bg: 'muted.800', _pressed: {bg: 'muted.800'}}}
                    onPress={() => {
                      setSaveLoading(true);
                      ReactNativeHapticFeedback.trigger(
                        Platform.select({
                          ios: 'impactHeavy',
                          android: 'impactMedium',
                        }),
                      );
                      if (card.docID) {
                        if (user.saved) {
                          if (!user.saved.includes(card.docID)) {
                            setUser(prevState => ({
                              ...prevState,
                              saved: [...prevState.saved, card.docID],
                            }));
                            setSavedBank({
                              ...savedBank,
                              [user.uid]: savedBank[user.uid]
                                ? [...savedBank[user.uid], card]
                                : [card],
                            });
                          }
                        } else {
                        }
                      }
                    }}>
                    <FontAwesome5
                      solid
                      name="bookmark"
                      color={theme.colors.primary['500']}
                      size={15}
                    />
                  </Button>
                )}
                <Button
                  isLoading={shareLoading}
                  p={0}
                  m={1}
                  borderWidth={2}
                  borderColor="primary.500"
                  style={styles.actionButton}
                  _light={{bg: 'muted.100', _pressed: {bg: 'muted.200'}}}
                  _dark={{bg: 'muted.800', _pressed: {bg: 'muted.800'}}}
                  onPress={() => {
                    ReactNativeHapticFeedback.trigger(
                      Platform.select({
                        ios: 'impactHeavy',
                        android: 'impactMedium',
                      }),
                    );
                    setShareLoading(true);
                    shareCardLink(card, user.uid)
                      .then(() => setShareLoading(false))
                      .catch(err => {
                        setShareLoading(false);
                        if (!(JSON.stringify(err) === '{}')) {
                          setError({
                            title: 'Something went wrong...',
                            message:
                              "We couldn't generate a link for that card. Try again later.",
                          });
                        }
                      });
                  }}>
                  <FontAwesome5
                    solid
                    name="share-square"
                    color={theme.colors.primary['500']}
                    size={15}
                  />
                </Button>
              </HStack>
            </VStack>
          </View>
        </View>
      </View>
    );
  } else if (card === null) {
    return (
      <View justifyContent="center" alignItems="center" flex={1}>
        <Text>We couldn't find this... Please check back later!</Text>
      </View>
    );
  } else {
    return (
      <View justifyContent="center" alignItems="center" flex={1}>
        <Spinner />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  actionButton: {
    height: 45,
    width: 45,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIndicator: {
    marginVertical: 'auto',
  },
});

export default CardDetailView;
