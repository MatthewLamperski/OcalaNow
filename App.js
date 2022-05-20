/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import type {Node} from 'react';
import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  AppState,
  Linking,
  LogBox,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {NativeBaseProvider} from 'native-base/src/core/NativeBaseProvider';
import {appTheme} from './Theme';
import {useMMKV, useMMKVObject} from 'react-native-mmkv';
import {AppContext} from './AppContext';
import Auth from '@react-native-firebase/auth';
import SplashScreen from './Routes/SplashScreen';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AuthStack from './Routes/AuthStack/AuthStack';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import Toast from 'react-native-toast-message';
import {toastConfig} from './ToastConfig';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {
  getUser,
  requestUserNotificationPermission,
  updateMessagingToken,
  updateUser,
} from './FireFunctions';
import AppStack from './Routes/AppStack/AppStack';
import analytics from '@react-native-firebase/analytics';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Geolocation from '@react-native-community/geolocation';
import {utils} from '@react-native-firebase/app';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import messaging from '@react-native-firebase/messaging';

const App: () => Node = () => {
  const colorScheme = useColorScheme();
  const userStorage = useMMKV();
  const prefStorage = useMMKV();
  const [userBank, setUserBank] = useMMKVObject('userBank', userStorage);
  const [prefBank, setPrefBank] = useMMKVObject('prefBank', prefStorage);
  const [shouldUpdateUser, setShouldUpdateUser] = useState(false);
  const [user, setUser] = useState();
  const [initializing, setInitializing] = useState(true);
  const [notification, setNotification] = useState();
  const [error, setError] = useState();
  const [currentLocation, setCurrentLocation] = useState();
  const [saved, setSaved] = useState();
  const [recycled, setRecycled] = useState();
  const routeNameRef = useRef(null);
  const navigationRef = useRef(null);
  const context = {
    user,
    setUser,
    notification,
    setNotification,
    error,
    setError,
    userBank,
    currentLocation,
    setCurrentLocation,
    saved,
    setSaved,
    recycled,
    setRecycled,
    prefBank,
    setPrefBank,
    getUserLocation: (
      title = 'Location not found',
      message = 'OcalaNow works much better with your location. Tap to learn more',
    ) => {
      if (Platform.OS === 'ios') {
        Geolocation.requestAuthorization();
      } else if (Platform.OS === 'android') {
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
      }
      Geolocation.getCurrentPosition(
        position => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        err => {
          if (err.PERMISSION_DENIED) {
            if (prefBank && prefBank[user.uid]) {
            } else {
              setNotification({
                title,
                message,
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
          }
        },
      );
    },
  };
  useEffect(() => {
    messaging().onMessage(message => {
      const url = message?.data?.link;
      setNotification({
        title: message.notification.title,
        message: message.notification.body,
        onPress: url ? () => Linking.openURL(url) : () => {},
      });
    });
  }, []);
  // Functions
  const refreshUserLocation = (
    title = 'Location not found',
    message = 'OcalaNow works much better with your location. Tap to learn more',
  ) => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
    } else if (Platform.OS === 'android') {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
    }
    Geolocation.getCurrentPosition(
      position => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      err => {
        if (err.PERMISSION_DENIED) {
          if (prefBank && prefBank[user.uid]) {
          } else {
            setNotification({
              title,
              message,
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
        }
      },
    );
  };
  // Detecting App State
  const appState = useRef(AppState.currentState);
  const [checkLocation, setCheckLocation] = useState(false);
  useEffect(() => {
    const appStateSubscription = AppState.addEventListener(
      'change',
      nextAppState => {
        if (appState.current.match(/background/) && nextAppState === 'active') {
          setCheckLocation(true);
          setTimeout(() => {
            setCheckLocation(false);
          }, 1000);
        }
        appState.current = nextAppState;
      },
    );
    return () => {
      appStateSubscription.remove();
    };
  }, []);
  useEffect(() => {
    if (user && checkLocation) {
      refreshUserLocation();
    }
  }, [checkLocation]);
  const dontShowLocationRequest = () => {
    setPrefBank({
      ...prefBank,
      [user.uid]: true,
    });
  };
  const enableLocationServices = () => {
    Linking.openSettings();
  };
  const configureGoogleSignIn = () => {
    GoogleSignin.configure({
      webClientId:
        '28992864864-1unij7fj1jq5jdlapibrr2k9ecdfo4f8.apps.googleusercontent.com',
    });
  };
  const firstTimeSigningIn = userCred => {
    getUser(userCred.uid)
      .then(userDoc => {
        setUser({uid: userCred.id, ...userDoc});
        if (initializing) {
          setInitializing(false);
        }
      })
      .catch(err => {
        // First time registering (no user doc)
        setShouldUpdateUser(true);
        setUser({
          uid: userCred.uid,
          ...(userCred.email ? {email: userCred.email} : {}),
          ...(userCred.displayName ? {displayName: userCred.displayName} : {}),
        });
        if (initializing) {
          setInitializing(false);
        }
      });
  };
  const updateLocalUser = userCred => {
    getUser(userCred.uid)
      .then(userDoc => {
        setUser(userDoc);
        setShouldUpdateUser(true);
      })
      .catch(err => console.log("Couldn't update user"));
  };
  let authFlag = true;
  const onAuthStateChanged = async authUser => {
    if (authUser) {
      requestUserNotificationPermission()
        .then(() => {
          updateMessagingToken(authUser.uid).catch(err => console.log(err));
        })
        .catch(err => console.log(err));
      // Check user bank to see if user obj exists
      if (authFlag) {
        analytics()
          .setUserId(authUser.uid)
          .catch(err => console.log(err));
        authFlag = false;
        try {
          let currentUser = await userBank[authUser.uid];
          if (currentUser === undefined) {
            firstTimeSigningIn(authUser);
          } else {
            updateLocalUser(authUser);
            setUser(currentUser);
            if (initializing) {
              setInitializing(false);
            }
          }
        } catch (err) {
          firstTimeSigningIn(authUser);
        }
      }
    } else {
      authFlag = true;
      setShouldUpdateUser(false);
      setUser();
      if (initializing) {
        setInitializing(false);
      }
    }
  };

  // Effects
  useEffect(() => {
    LogBox.ignoreAllLogs();
    // Run on App start
    configureGoogleSignIn();
  }, []);
  useEffect(() => {
    return Auth().onAuthStateChanged(onAuthStateChanged);
  }, []);
  useEffect(() => {
    if (recycled && user) {
      setUser({
        ...user,
        recycled: recycled,
      });
    }
  }, [recycled]);
  useEffect(() => {
    if (saved && user) {
      setUser({
        ...user,
        saved: saved.map(savedCard => savedCard.docID),
      });
    }
  }, [saved]);
  useEffect(() => {
    if (user) {
      if (userBank) {
        setUserBank({
          ...userBank,
          [user.uid]: user,
        });
      } else {
        setUserBank({
          [user.uid]: user,
        });
      }
    }
  }, [user]);
  useEffect(() => {
    if (user) {
      updateMessagingToken(user.uid).catch(err => console.log(err));
      if (shouldUpdateUser) {
        updateUser(user)
          .then(() => {
            console.log('updated user');
          })
          .catch(err => console.log(err));
      }
    }
  }, [user]);
  useEffect(() => {
    if (notification) {
      ReactNativeHapticFeedback.trigger('notificationWarning');
      Toast.show({
        type: 'info',
        text1: notification.title,
        text2: notification.message,
        onHide: () => setNotification(),
        onPress: notification.onPress,
        props: {colorScheme},
      });
    } else if (error) {
      ReactNativeHapticFeedback.trigger('notificationError');
      Toast.show({
        type: 'error',
        text1: error.title,
        text2: error.message,
        onHide: () => setError(),
        onPress: error.onPress,
        props: {colorScheme},
      });
    }
  }, [error, notification]);

  useEffect(() => {
    dynamicLinks().onLink(link => {
      console.log('LINKED', link);
    });
  }, []);
  const linking = {
    prefixes: [
      'https://ocalanow.app',
      'https://ocalanow.page.link',
      'applinks://',
    ],
    async getInitialURL() {
      // First, you would need to get the initial URL from your third-party integration
      // The exact usage depend on the third-party SDK you use
      // For example, to get to get the initial URL for Firebase Dynamic Links:
      const {isAvailable} = utils().playServicesAvailability;

      if (isAvailable) {
        const initialLink = await dynamicLinks().getInitialLink();

        if (initialLink) {
          return initialLink.url;
        }
      }

      // As a fallback, you may want to do the default deep link handling
      const url = await Linking.getInitialURL();
      if (url !== null) {
        return url;
      }

      const message = await messaging().getInitialNotification();
      return message?.data?.link;
    },
    subscribe(listener) {
      const unsubscribeDynamicLinks = dynamicLinks().onLink(({url}) => {
        listener(url);
      });
      const linkingSubscription = Linking.addEventListener('url', ({url}) => {
        listener(url);
      });
      const unsubscribeNotification = messaging().onNotificationOpenedApp(
        message => {
          console.log('Noty opened app', JSON.stringify(message, null, 3));
          const url = message?.data?.link;
          if (url) {
            listener(url);
          }
        },
      );
      return () => {
        unsubscribeDynamicLinks();
        unsubscribeNotification();
        linkingSubscription.remove();
      };
    },
    config: {
      screens: {
        AppStack: {
          initialRouteName: 'TabNavigator',
          screens: {
            TabNavigator: {
              initialRouteName: 'Home',
              screens: {
                Home: 'home',
                Feed: 'feed',
                Discover: 'discover',
                Profile: 'saved',
              },
            },
            CardDetailView: 'cards/:card',
            TagView: 'tags/:tag',
          },
        },
        AuthStack: {},
      },
    },
  };
  if (initializing) {
    return (
      <NativeBaseProvider theme={appTheme}>
        <SplashScreen />
      </NativeBaseProvider>
    );
  }
  const Stack = createNativeStackNavigator();
  return (
    <AppContext.Provider value={context}>
      <GestureHandlerRootView style={{flex: 1}}>
        <NativeBaseProvider theme={appTheme}>
          <NavigationContainer
            linking={linking}
            ref={navigationRef}
            onReady={() => {
              routeNameRef.current =
                navigationRef.current.getCurrentRoute().name;
            }}
            onStateChange={async () => {
              const previousRouteName = routeNameRef.current;
              const currentRouteName =
                navigationRef.current.getCurrentRoute().name;
              if (previousRouteName !== currentRouteName) {
                await analytics().logScreenView({
                  screen_name: currentRouteName,
                  screen_class: currentRouteName,
                });
              }
              console.log(previousRouteName, currentRouteName);
              routeNameRef.current = currentRouteName;
            }}>
            <Stack.Navigator>
              {user ? (
                <Stack.Screen
                  name="AppStack"
                  options={{header: () => null, animation: 'fade'}}
                  component={AppStack}
                />
              ) : (
                <Stack.Screen
                  name="AuthStack"
                  component={AuthStack}
                  options={{
                    header: () => null,
                    animation: 'fade',
                  }}
                />
              )}
            </Stack.Navigator>
          </NavigationContainer>
          <Toast config={toastConfig} />
        </NativeBaseProvider>
      </GestureHandlerRootView>
    </AppContext.Provider>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
