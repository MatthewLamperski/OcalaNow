import React, {useContext, useRef, useState} from 'react';
import {HStack, Spinner, Text, useTheme, View} from 'native-base';
import {AppContext} from '../../AppContext';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CardPreviewTile from './Components/CardPreviewTile';
import {FlatList, useColorScheme} from 'react-native';
import NoMoreCards from './Components/NoMoreCards';

const Profile = ({navigation}) => {
  const {colors} = useTheme();
  const colorscheme = useColorScheme();
  const {bottom} = useSafeAreaInsets();
  const {user, currentLocation, saved, setSaved} = useContext(AppContext);
  const [sort, setSort] = useState();
  const flatListRef = useRef(null);
  // const onSortPress = ({nativeEvent: {event}}) => {
  //   setSort(event);
  // };
  // const actions = [
  //   ...(currentLocation
  //     ? [
  //         {
  //           id: 'closest',
  //           title: 'Closest to Me',
  //           state: sort && sort === 'closest' ? 'on' : 'off',
  //         },
  //       ]
  //     : []),
  //   {
  //     id: 'match',
  //     title: 'Match Level',
  //     state: sort && sort === 'match' ? 'on' : 'off',
  //   },
  // ];
  // const lat = card => {
  //   switch (card.type) {
  //     case 'info':
  //       return card.data.company.location.coordinate.lat;
  //     case 'deal':
  //       return card.deal.company.location.coordinate.lat;
  //     case 'event':
  //       return card.event.location.coordinate.lat;
  //   }
  // };
  // const lng = card => {
  //   switch (card.type) {
  //     case 'info':
  //       return card.data.company.location.coordinate.lng;
  //     case 'deal':
  //       return card.deal.company.location.coordinate.lng;
  //     case 'event':
  //       return card.event.location.coordinate.lng;
  //   }
  // };
  // const sortCardsByMatch = (card1, card2) => {
  //   /*
  //     Takes in card1 and card2
  //       - point is given to card if card tag is in user interests
  //       - card with more points is greater than card with less points
  //    */
  //   const interests = user.interests ? user.interests : [];
  //
  //   const tags1 = card1.tags;
  //
  //   const intersection1 = tags1.filter(tag => interests.includes(tag));
  //   const tagMatchLevel1 = intersection1.length / card1.tags.length;
  //   // Tag Match level of 1 means all card tags are in user interests
  //   const interestsMatchLevel1 = intersection1.length / interests.length;
  //   // Interest Match level of 1 means that all user interests are in card tags
  //   const overallMatch1 = tagMatchLevel1 * interestsMatchLevel1;
  //
  //   const tags2 = card2.tags;
  //   const intersection2 = tags2.filter(tag => interests.includes(tag));
  //   const tagMatchLevel2 = intersection2.length / card2.tags.length;
  //   const interestsMatchLevel2 = intersection2.length / interests.length;
  //   const overallMatch2 = tagMatchLevel2 * interestsMatchLevel2;
  //
  //   return overallMatch1 < overallMatch2;
  // };
  if (saved && saved.length === 0) {
    return (
      <View flex={1} p={5}>
        <NoMoreCards
          title="Nothing saved yet..."
          subtitle="Head over to the Home tab and see if you see anything you like!"
        />
      </View>
    );
  } else {
    return (
      <FlatList
        initialNumToRender={5}
        ListHeaderComponent={
          saved ? (
            <HStack px={4} pt={2} justifyContent="flex-end" alignItems="center">
              <Text
                fontWeight={300}
                italic
                _dark={{color: 'primary.200'}}
                _light={{color: 'primary.500'}}>
                {saved ? saved.length : 'None'} Saved
              </Text>
            </HStack>
          ) : null
        }
        style={{
          backgroundColor:
            colorscheme === 'dark' ? colors.muted['800'] : colors.muted['100'],
        }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{paddingBottom: bottom}}
        data={saved}
        ref={flatListRef}
        renderItem={({item}) => (
          <CardPreviewTile card={item} navigation={navigation} unsave />
        )}
        keyExtractor={(item, index) => item.docID}
        ListEmptyComponent={
          saved ? (
            <View p={3} flex={1} />
          ) : (
            <Spinner p={5} color="primary.500" />
          )
        }
        ItemSeparatorComponent={() => (
          <View
            _dark={{bg: 'muted.700'}}
            _light={{bg: 'muted.200'}}
            h={0.4}
            w="100%"
          />
        )}
      />
    );
  }
};

export default Profile;
