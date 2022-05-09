import React, {useEffect, useState} from 'react';
import {
  HStack,
  PresenceTransition,
  Pressable,
  ScrollView,
  Text,
  useTheme,
  View,
} from 'native-base';
import FeedTimer from './Components/FeedTimer';
import {FlatList, useColorScheme} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import firestore from '@react-native-firebase/firestore';
import FeedItem from './Components/FeedItem';

const Feed = ({navigation}) => {
  const {colors} = useTheme();
  const colorScheme = useColorScheme();
  const [filter, setFilter] = useState('Latest');
  const [items, setItems] = useState();
  const [displayedItems, setDisplayedItems] = useState();
  useEffect(() => {
    if (items) {
      if (filter) {
        if (filter === 'Latest') {
          setDisplayedItems(items);
        } else if (filter === 'Saddle Up') {
          setDisplayedItems(items.filter(item => item.type === 'saddle'));
        } else if (filter === 'OTG') {
          setDisplayedItems(items.filter(item => item.type === 'otg'));
        } else {
          setDisplayedItems(items);
        }
      } else {
        setDisplayedItems(items);
      }
    }
  }, [filter, items]);
  useEffect(() => {
    firestore()
      .collection('feed')
      .orderBy('date', 'desc')
      .limit(10)
      .onSnapshot(snapshot => {
        setItems(
          snapshot.docs.map(doc => ({
            docID: doc.id,
            ...doc.data(),
          })),
        );
      });
  }, []);
  useEffect(() => {
    if (items) {
      console.log(items[0].docID);
    }
  }, [items]);
  const showTimer = () => {
    let date = new Date();
    if (date.getDay() === 1) {
      if (date.getHours() < 8) {
        return true;
      } else {
        return false;
      }
    } else if (date.getDay() === 5) {
      if (date.getHours() < 12) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  };
  const filterPressed = thisFilter => {
    ReactNativeHapticFeedback.trigger('soft');
    if (filter === thisFilter) {
      setFilter('Latest');
    } else {
      setFilter(thisFilter);
    }
  };
  const filterBackground = thisFilter => {
    if (filter === thisFilter) {
      return 'primary.500';
    } else {
      if (colorScheme === 'dark') {
        return 'muted.700';
      } else {
        return 'white';
      }
    }
  };
  const iconColor = thisFilter => {
    if (filter === thisFilter) {
      return 'white';
    } else {
      if (colorScheme === 'dark') {
        return colors.primary['500'];
      } else {
        return colors.primary['500'];
      }
    }
  };
  const textColor = thisFilter => {
    if (filter === thisFilter) {
      return 'white';
    } else {
      if (colorScheme === 'dark') {
        return 'white';
      } else {
        return 'muted.800';
      }
    }
  };
  return (
    <View flex={1}>
      <PresenceTransition
        initial={{opacity: 0}}
        animate={{opacity: 1, transition: {duration: 500}}}
        flex={1}
        visible>
        <View flex={1}>
          {showTimer() && <FeedTimer />}
          <View>
            <ScrollView showsHorizontalScrollIndicator={false} horizontal>
              <HStack
                space={2}
                p={3}
                justifyContent="center"
                alignItems="center">
                <Pressable onPress={() => filterPressed('Latest')}>
                  <HStack
                    shadow={1}
                    justifyContent="center"
                    alignItems="center"
                    space={2}
                    borderRadius={50}
                    bg={filterBackground('Latest')}
                    p={2}
                    px={3}>
                    <FontAwesome5
                      name="clock"
                      color={iconColor('Latest')}
                      size={18}
                    />
                    <Text color={textColor('Latest')} fontWeight={200}>
                      Latest
                    </Text>
                  </HStack>
                </Pressable>
                <Pressable onPress={() => filterPressed('Saddle Up')}>
                  <HStack
                    shadow={1}
                    justifyContent="center"
                    alignItems="center"
                    space={2}
                    borderRadius={50}
                    bg={filterBackground('Saddle Up')}
                    p={2}
                    px={3}>
                    <FontAwesome5
                      name="horse-head"
                      color={iconColor('Saddle Up')}
                      size={18}
                    />
                    <Text color={textColor('Saddle Up')} fontWeight={200}>
                      Saddle Up
                    </Text>
                  </HStack>
                </Pressable>
                <Pressable onPress={() => filterPressed('OTG')}>
                  <HStack
                    shadow={1}
                    justifyContent="center"
                    alignItems="center"
                    space={2}
                    borderRadius={50}
                    bg={filterBackground('OTG')}
                    p={2}
                    px={3}>
                    <FontAwesome5
                      name="hat-cowboy-side"
                      color={iconColor('OTG')}
                      size={18}
                    />
                    <Text color={textColor('OTG')} fontWeight={200}>
                      Out the Gate
                    </Text>
                  </HStack>
                </Pressable>
              </HStack>
            </ScrollView>
          </View>
          <FlatList
            data={displayedItems}
            renderItem={({item}) => (
              <FeedItem navigation={navigation} item={item} />
            )}
            ItemSeparatorComponent={() => (
              <View
                w="100%"
                _light={{bg: 'muted.300'}}
                _dark={{bg: 'muted.700'}}
                style={{height: 0.5}}
              />
            )}
          />
        </View>
      </PresenceTransition>
    </View>
  );
};

export default Feed;
