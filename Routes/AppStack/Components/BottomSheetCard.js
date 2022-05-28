import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {
  Box,
  HStack,
  Pressable,
  ScrollView,
  Skeleton,
  Text,
  useTheme,
  View,
  VStack,
} from 'native-base';
import {
  Alert,
  Animated,
  Image,
  Linking,
  Platform,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import {
  getAsset,
  getNextEventDate,
  openNavigation,
} from '../../../FireFunctions';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {getDistance} from 'geolib';
import {AppContext} from '../../../AppContext';
import LinearGradient from 'react-native-linear-gradient';
import SocialLink from './SocialLink';
import MapView, {Marker} from 'react-native-maps';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import analytics from '@react-native-firebase/analytics';
import {darkMapStyle, lightMapStyle} from '../Discover';

const BottomSheetCard = ({card, navigation, currentLocation}) => {
  const {colors} = useTheme();
  const {user} = useContext(AppContext);
  const colorScheme = useColorScheme();
  const [logo, setLogo] = useState();
  const [loaded, setLoaded] = useState(false);
  const mapRef = useRef(null);
  const fadeVal = useRef(new Animated.Value(0)).current;
  const cardBackground = colorScheme === 'dark' ? colors.muted['800'] : 'white';
  const tabBarHeight = useBottomTabBarHeight();
  useEffect(() => {
    if (tabBarHeight) {
      console.log('tab bar height', tabBarHeight);
    }
  }, []);
  useEffect(() => {
    analytics().logEvent('bottom_sheet_card_seen', {
      card: card.docID,
      user: user.uid,
    });
  }, [card.docID]);
  useEffect(() => {
    setLoaded(false);
    setLogo();
    fadeVal.setValue(0);
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
        return card.subtitle;
    }
  };
  const subtitle = () => {
    switch (card.type) {
      case 'info':
        return card.subtitle;
      case 'deal':
        return card.title;
      case 'event':
        return card.title;
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
        {lat: lat, lng: lng},
        {lat: currentLocation.lat, lng: currentLocation.lng},
      ) * 0.000621,
    ).toFixed(1);
  };
  const lat = useMemo(() => {
    switch (card.type) {
      case 'info':
        return card.data.company.location.coordinate.lat;
      case 'deal':
        return card.deal.company.location.coordinate.lat;
      case 'event':
        return card.event.location.coordinate.lat;
    }
  }, [card.type]);
  const lng = useMemo(() => {
    switch (card.type) {
      case 'info':
        return card.data.company.location.coordinate.lng;
      case 'deal':
        return card.deal.company.location.coordinate.lng;
      case 'event':
        return card.event.location.coordinate.lng;
    }
  }, [card.type]);

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
  useEffect(() => {
    fitToMarker();
  }, [card.docID]);
  const fitToMarker = () => {
    if (mapRef.current) {
      const coordinates = currentLocation
        ? [
            {
              latitude: lat,
              longitude: lng,
            },
            {latitude: currentLocation.lat, longitude: currentLocation.lng},
          ]
        : [
            {
              latitude: lat,
              longitude: lng,
            },
          ];
      requestAnimationFrame(() =>
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: currentLocation
            ? {top: 15, bottom: 15, left: 15, right: 15}
            : {
                top: 15,
                bottom: 15,
                left: 15,
                right: 15,
              },
          animated: true,
        }),
      );
    }
  };
  return (
    <View pb={tabBarHeight + 30} position="relative" flex={1} p={4}>
      <HStack justifyContent="flex-start" alignItems="flex-start" space={4}>
        <View
          borderRadius={40}
          borderWidth={2}
          borderColor="primary.400"
          style={{height: 80, width: 80}}
          shadow={2}
          justifyContent="center"
          alignItems="center"
          bg="transparent">
          <Animated.View
            style={{
              height: 70,
              width: 70,
              borderRadius: 40,
              backgroundColor: card.color,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              opacity: fadeVal,
              padding: 5,
            }}>
            <Image
              onLoadEnd={() => {
                setLoaded(true);
                console.log('loaded');
                Animated.timing(fadeVal, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
                }).start();
              }}
              source={{uri: logo}}
              key={logo ? logo : 'ocalanow'}
              style={{
                height: '100%',
                width: '100%',
                borderRadius: 40,
                resizeMode: 'contain',
              }}
            />
          </Animated.View>
          {!loaded && (
            <Skeleton
              bg={card.color}
              style={{
                height: 73,
                width: 73,
                borderRadius: 40,
                position: 'absolute',
              }}
            />
          )}
        </View>
        <VStack flex={1}>
          <Text numberOfLines={2} fontWeight={300} fontSize={22}>
            {title()}
          </Text>
          <Text
            numberOfLines={2}
            fontWeight={200}
            fontSize={14}
            _light={{color: 'muted.500'}}
            _dark={{color: 'muted.400'}}>
            {subtitle()}
          </Text>
          {card.tags && (
            <HStack flexWrap="wrap" space={2} py={1}>
              {card.tags.slice(0, 3).map((tag, idx) => (
                <Pressable
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
                    shadow={1}
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
        </VStack>
      </HStack>
      <View borderRadius={10} overflow="hidden" my={2} h={60}>
        <MapView
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
          pitchEnabled={false}
          rotateEnabled={false}
          scrollEnabled={false}
          zoomEnabled={false}
          scrollDuringRotateOrZoomEnabled={false}
          zoomTapEnabled={false}
          zoomControlEnabled={false}
          showsMyLocationButton={false}
          customMapStyle={colorScheme === 'dark' ? darkMapStyle : lightMapStyle}
          showsUserLocation
          ref={mapRef}
          style={{
            borderRadius: 20,
            flex: 1,
          }}
          initialRegion={{
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.001,
            longitudeDelta: 0.001,
          }}
          onMapReady={fitToMarker}>
          <Marker coordinate={{latitude: lat, longitude: lng}}>
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
      </View>
      <Pressable
        py={1}
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
        }}>
        {card.type === 'event' && (
          <HStack
            my={2}
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
        <HStack alignItems="center" justifyContent="flex-start" space={2}>
          {currentLocation && (
            <HStack justifyContent="center" alignItems="center" space={2}>
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
            </HStack>
          )}
          <FontAwesome5
            name="map-marker-alt"
            color={
              colorScheme === 'dark' ? colors.muted['400'] : colors.muted['500']
            }
            size={16}
          />
          <Text flex={1} numberOfLines={1} fontWeight={200}>
            {mapSubtitle()}
          </Text>
        </HStack>
      </Pressable>
      <HStack py={3} space={3} justifyContent="center" alignItems="center">
        <ScrollView horizontal>
          <Pressable
            mx={2}
            onPress={() => {
              ReactNativeHapticFeedback.trigger('soft');
              Linking.openURL(`tel:${phone()}`);
            }}
            justifyContent="center"
            alignItems="center">
            <LinearGradient
              colors={[colors.primary['500'], colors.primary['400']]}
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
                <FontAwesome5 name="phone-alt" color="white" size={25} />
              </Box>
            </LinearGradient>

            <Text fontSize={10}>Call</Text>
          </Pressable>
          <Pressable
            mx={2}
            onPress={() => {
              ReactNativeHapticFeedback.trigger('soft');
              Linking.openURL(website());
            }}
            justifyContent="center"
            alignItems="center">
            <LinearGradient
              colors={[colors.primary['500'], colors.primary['400']]}
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
        </ScrollView>
      </HStack>
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

export default BottomSheetCard;
