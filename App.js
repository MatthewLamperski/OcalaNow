/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import type {Node} from 'react';
import React, {useEffect, useRef, useState} from 'react';
import {LogBox, StyleSheet, useColorScheme} from 'react-native';
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
import {getUser, updateUser} from './FireFunctions';
import AppStack from './Routes/AppStack/AppStack';
import analytics from '@react-native-firebase/analytics';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

const App: () => Node = () => {
  const colorScheme = useColorScheme();
  const userStorage = useMMKV();
  const savedStorage = useMMKV();
  const [userBank, setUserBank] = useMMKVObject('userBank', userStorage);
  const [savedBank, setSavedBank] = useMMKVObject('savedBank', savedStorage);
  const [shouldUpdateUser, setShouldUpdateUser] = useState(false);
  const [user, setUser] = useState();
  const [initializing, setInitializing] = useState(true);
  const [notification, setNotification] = useState();
  const [error, setError] = useState();
  const [currentLocation, setCurrentLocation] = useState();
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
    savedBank,
    setSavedBank,
  };
  // Functions
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
