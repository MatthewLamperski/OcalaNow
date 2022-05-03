import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import {useColorScheme} from 'react-native';
import {useTheme} from 'native-base';
import HeaderTitle from './HeaderTitle';

const Stack = createNativeStackNavigator();

const AppStack = () => {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor:
            colorScheme === 'dark'
              ? theme.colors.muted['900']
              : theme.colors.muted['100'],
        },
        headerTintColor:
          colorScheme === 'dark'
            ? theme.colors.lightText
            : theme.colors.darkText,
      }}>
      <Stack.Screen
        options={({route, navigation}) => ({
          headerTitle: () => (
            <HeaderTitle route={route} navigation={navigation} />
          ),
        })}
        name="TabNavigator"
        component={TabNavigator}
      />
    </Stack.Navigator>
  );
};

export default AppStack;
