import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import {Platform, useColorScheme} from 'react-native';
import {Pressable, Text, useTheme} from 'native-base';
import HeaderTitle from './HeaderTitle';
import CardDetailView from './CardDetailView';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import TagView from './TagView';

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
      <Stack.Screen name="TagView" component={TagView} />
      <Stack.Group
        screenOptions={({navigation}) => ({
          presentation: 'modal',
          headerLeft: () => {
            return Platform.OS === 'ios' ? (
              <Pressable p={2} pr={3} onPress={() => navigation.goBack()}>
                <FontAwesome5
                  name="times"
                  color={
                    colorScheme === 'dark'
                      ? theme.colors.lightText
                      : theme.colors.darkText
                  }
                  size={16}
                />
              </Pressable>
            ) : null;
          },
          headerTitle: () => <Text> </Text>,
        })}>
        <Stack.Screen name="CardDetailView" component={CardDetailView} />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default AppStack;
