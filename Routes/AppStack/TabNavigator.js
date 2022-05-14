import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Dimensions, Platform, useColorScheme} from 'react-native';
import {useTheme} from 'native-base';
import Home from './Home';
import Discover from './Discover';
import Profile from './Profile';
import Feed from './Feed';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  return (
    <Tab.Navigator
      screenOptions={({route}) => screenOptions({route, colorScheme, theme})}>
      <Tab.Screen name="Home" component={Home} options={options} />
      <Tab.Screen name="Discover" component={Discover} options={options} />
      <Tab.Screen name="Feed" component={Feed} options={options} />
      <Tab.Screen name="Profile" component={Profile} options={options} />
    </Tab.Navigator>
  );
};

const deviceHeight = Dimensions.get('window').height;

const screenOptions = ({route, colorScheme, theme}) => ({
  tabBarStyle: {
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    backgroundColor:
      colorScheme === 'dark'
        ? theme.colors.muted['900']
        : theme.colors.muted['100'],
    height: Platform.OS === 'ios' ? deviceHeight * 0.1 : deviceHeight * 0.075,
    borderTopWidth: 0,
  },
  tabBarIcon: ({focused, size}) => {
    let iconName;
    let iconColor = focused
      ? theme.colors.primary['400']
      : theme.colors.muted['400'];

    if (route.name === 'Home') {
      iconName = focused ? 'home' : 'home-outline';
    } else if (route.name === 'Discover') {
      iconName = focused ? 'compass' : 'compass-outline';
    } else if (route.name === 'Feed') {
      iconName = focused ? 'newspaper' : 'newspaper-outline';
    } else if (route.name === 'Profile') {
      iconName = focused ? 'bookmark' : 'bookmark-outline';
    }
    return (
      <Ionicons
        name={iconName}
        color={iconColor}
        size={focused ? size + 4 : size}
      />
    );
  },
  tabBarShowLabel: false,
  lazy: true,
});

const options = {header: () => null};

export default TabNavigator;
