import React, {useContext} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import {Platform, useColorScheme} from 'react-native';
import {Pressable, Text, useTheme} from 'native-base';
import HeaderTitle from './HeaderTitle';
import CardDetailView from './CardDetailView';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import TagView from './TagView';
import InterestsSelectionView from './InterestsSelectionView';
import {AppContext} from '../../AppContext';
import HeaderLeft from './Components/HeaderLeft';
import HeaderRight from './HeaderRight';
import SettingsView from './SettingsView';

const Stack = createNativeStackNavigator();

const AppStack = () => {
  const {user} = useContext(AppContext);
  const colorScheme = useColorScheme();
  const theme = useTheme();
  let initialRoute = 'TabNavigator';
  if (!user.interests) {
    initialRoute = 'InterestsSelectionView';
  }
  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerStyle: {
          backgroundColor:
            colorScheme === 'dark'
              ? theme.colors.muted['900']
              : theme.colors.muted['100'],
        },
        headerTintColor:
          colorScheme === 'dark'
            ? theme.colors.primary['200']
            : theme.colors.primary['500'],
      }}>
      <Stack.Screen
        options={({route, navigation}) => ({
          headerTitle: () => (
            <HeaderTitle route={route} navigation={navigation} />
          ),
          headerLeft: () => (
            <HeaderLeft route={route} navigation={navigation} />
          ),
          headerRight: () => (
            <HeaderRight route={route} navigation={navigation} />
          ),
          animation: 'fade',
        })}
        name="TabNavigator"
        component={TabNavigator}
      />
      <Stack.Screen
        name="InterestsSelectionView"
        component={InterestsSelectionView}
        options={{
          headerTitle: 'Select Your Interests',
          headerLargeTitleShadowVisible: false,
          headerShadowVisible: false,
          headerLargeTitleStyle: {
            color:
              colorScheme === 'dark'
                ? theme.colors.primary['500']
                : theme.colors.primary['500'],
            fontFamily: 'TruenoUltBlkIt',
            fontSize: 28,
          },
          headerTitleStyle: {
            color:
              colorScheme === 'dark'
                ? theme.colors.primary['200']
                : theme.colors.primary['500'],
            fontFamily: 'TruenoUltBlkIt',
          },
          headerLargeTitle: true,
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="TagView"
        component={TagView}
        options={({route}) => ({
          headerBackTitleVisible: false,
          headerLargeTitleStyle: {
            color:
              colorScheme === 'dark'
                ? theme.colors.primary['200']
                : theme.colors.primary['500'],
            fontFamily: 'TruenoUltBlkIt',
          },
          headerTitleStyle: {
            color:
              colorScheme === 'dark'
                ? theme.colors.primary['200']
                : theme.colors.primary['500'],
            fontFamily: 'TruenoUltBlkIt',
          },
          headerLargeTitle: true,
          headerTitle: route.params.tag,
          headerLargeTitleShadowVisible: false,
          headerShadowVisible: false,
        })}
      />
      <Stack.Screen
        name="SettingsView"
        component={SettingsView}
        options={{
          headerTitle: () => (
            <Text
              italic
              _light={{color: 'primary.500'}}
              _dark={{color: 'primary.200'}}
              fontWeight={300}
              fontSize={18}>
              Settings
            </Text>
          ),
          headerBackTitleVisible: false,
        }}
      />
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
