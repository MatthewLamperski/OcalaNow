import React, {useContext, useEffect, useRef, useState} from 'react';
import {HStack, Pressable, Spinner, useTheme, View} from 'native-base';
import {AppContext} from '../../AppContext';
import {useMMKV, useMMKVObject} from 'react-native-mmkv';
import Card from './Components/Card';
import SwipeCards from 'react-native-swipe-cards-deck';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {Alert, Linking, Platform, StyleSheet} from 'react-native';
import NoMoreCards from './Components/NoMoreCards';
import {getCards} from '../../FireFunctions';
import Geolocation from '@react-native-community/geolocation';

const Home = ({navigation}) => {
  const {user, setUser, userBank, setNotification} = useContext(AppContext);
  const theme = useTheme();
  const profilePicStorage = useMMKV();
  const [cards, setCards] = useState();
  const swiperRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState();
  const [profilePicBank, setProfilePic] = useMMKVObject(
    'profilePicBank',
    profilePicStorage,
  );
  useEffect(() => {
    getCards()
      .then(res => {
        setCards(res);
      })
      .catch(err => console.log(err));
  }, []);
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
  const dontShowLocationRequest = () => {
    console.log("Don't show again");
  };
  const enableLocationServices = () => {
    Linking.openSettings();
  };

  // Card Maintainence

  const handleSave = card => {
    ReactNativeHapticFeedback.trigger('notificationSuccess');
    setUser({
      ...user,
      saved: [...(user.saved ? [...user.saved] : []), card.docID],
    });
    return true;
  };
  const handleRecycle = card => {
    ReactNativeHapticFeedback.trigger('soft');
    setUser({
      ...user,
      recycled: [...(user.recycled ? [...user.recycled] : []), card.docID],
    });
    return true;
  };
  const handleMaybe = card => {
    console.log('navigating');
    navigation.navigate('CardDetailView', {
      card: card,
    });
    return true;
  };
  return (
    <View display="flex" px={4} pb={2} flex={1}>
      {!cards ? (
        <Spinner color="primary.500" />
      ) : (
        <SwipeCards
          ref={swiperRef}
          style={{alignItems: 'stretch', flexGrow: 1, paddingTop: 20}}
          cards={cards}
          renderCard={card => (
            <Card card={card} currentLocation={currentLocation} />
          )}
          keyExtractor={cardData => cardData.docID}
          actions={{
            nope: {onAction: handleRecycle, show: false},
            yup: {onAction: handleSave, show: false},
            maybe: {onAction: handleMaybe, show: false},
          }}
          renderNoMoreCards={NoMoreCards}
          showYup={false}
          showNope={false}
          hasMaybeAction
        />
      )}
      {cards && cards.length !== 0 && (
        <HStack
          space={9}
          alignItems="center"
          justifyContent="center"
          p={3}
          w="100%">
          <Pressable
            style={styles.actionButton}
            _light={{bg: 'muted.100', shadow: 2}}
            _dark={{bg: 'muted.700', shadow: 3}}
            onPress={() => {
              ReactNativeHapticFeedback.trigger('soft');
              swiperRef.current.swipeNope();
            }}>
            <FontAwesome5
              name="times"
              solid
              color={theme.colors.error['500']}
              size={30}
            />
          </Pressable>
          <Pressable
            style={styles.actionButton}
            _light={{bg: 'muted.100', shadow: 2}}
            _dark={{bg: 'muted.700', shadow: 3}}
            onPress={() => {
              ReactNativeHapticFeedback.trigger(
                Platform.select({ios: 'impactHeavy', android: 'impactMedium'}),
              );
              swiperRef.current.swipeMaybe();
            }}>
            <FontAwesome5
              name="chevron-up"
              color={theme.colors.primary['500']}
              size={30}
            />
          </Pressable>
          <Pressable
            style={styles.actionButton}
            _light={{bg: 'muted.100', shadow: 2}}
            _dark={{bg: 'muted.700', shadow: 3}}
            onPress={() => {
              ReactNativeHapticFeedback.trigger('notificationSuccess');
              swiperRef.current.swipeYup();
            }}>
            <FontAwesome5
              name="check"
              color={theme.colors.green['500']}
              size={30}
            />
          </Pressable>
        </HStack>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    height: 60,
    width: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home;
