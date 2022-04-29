/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import type {Node} from 'react';
import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {NativeBaseProvider} from 'native-base/src/core/NativeBaseProvider';
import {appTheme} from './Theme';
import {useMMKV, useMMKVObject} from 'react-native-mmkv';
import {AppContext} from './AppContext';
import Auth from '@react-native-firebase/auth';
import SplashScreen from './Routes/SplashScreen';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TabNavigator from './Routes/TabNavigator';
import AuthStack from './Routes/AuthStack/AuthStack';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

const App: () => Node = () => {
  const userStorage = useMMKV();
  const [user, setUser] = useMMKVObject('user', userStorage);
  const [authCredential, setAuthCredential] = useState();
  const [initializing, setInitializing] = useState(true);
  const context = {
    user,
    setUser,
  };
  // Functions
  const configureGoogleSignIn = () => {
    GoogleSignin.configure({
      webClientId:
        '28992864864-1unij7fj1jq5jdlapibrr2k9ecdfo4f8.apps.googleusercontent.com',
    });
  };
  const onAuthStateChanged = authUser => {
    if (authUser) {
      setAuthCredential(authUser);
      setUser(authUser);
      if (initializing) {
        setInitializing(false);
      }
    } else {
      setAuthCredential(null);
      if (initializing) {
        setInitializing(false);
      }
    }
  };
  // Effects
  useEffect(() => {
    // Run on App start
    configureGoogleSignIn();
  }, []);
  useEffect(() => {
    const authSubscriber = Auth().onAuthStateChanged(onAuthStateChanged);
    return authSubscriber;
  }, []);
  if (initializing) {
    return (
      <NativeBaseProvider theme={appTheme}>
        <SplashScreen />
      </NativeBaseProvider>
    );
  }
  const forFade = ({current}) => ({
    cardStyle: {
      opacity: current.progress,
    },
  });
  const Stack = createNativeStackNavigator();
  return (
    <AppContext.Provider value={context}>
      <NativeBaseProvider theme={appTheme}>
        <NavigationContainer>
          <Stack.Navigator>
            {authCredential === null ? (
              <Stack.Screen
                name="AuthStack"
                component={AuthStack}
                options={{
                  header: () => null,
                  animation: 'fade',
                }}
              />
            ) : (
              <Stack.Screen
                name="TabNavigator"
                options={{animation: 'fade'}}
                component={TabNavigator}
              />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </NativeBaseProvider>
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
