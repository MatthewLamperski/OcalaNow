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
import SignIn from './Routes/SignIn';
import TabNavigator from './Routes/TabNavigator';

const App: () => Node = () => {
  const userStorage = useMMKV();
  const [user, setUser] = useMMKVObject('user', userStorage);
  const [authCredential, setAuthCredential] = useState();
  const [initializing, setInitializing] = useState(true);
  const context = {
    user,
    setUser,
  };
  const onAuthStateChanged = authUser => {
    if (authUser) {
      setAuthCredential(authUser);
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
                name="SignIn"
                component={SignIn}
                options={{
                  title: 'Sign in',
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
