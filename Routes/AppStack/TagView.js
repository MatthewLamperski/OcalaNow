import React, {useContext, useEffect, useRef, useState} from 'react';
import {FlatList, HStack, Spinner, Text, useTheme, View} from 'native-base';
import {getCardsByTag} from '../../FireFunctions';
import {AppContext} from '../../AppContext';
import CardPreviewTile from './Components/CardPreviewTile';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {MenuView} from '@react-native-menu/menu';
import {getDistance} from 'geolib';

const TagView = ({route, navigation}) => {
  const {bottom} = useSafeAreaInsets();
  const {colors} = useTheme();
  const {setError, currentLocation, user} = useContext(AppContext);
  const {tag} = route.params;
  const [cards, setCards] = useState();
  const [sort, setSort] = useState();
  const flatListRef = useRef(null);
  useEffect(() => {
    getCardsByTag(tag)
      .then(res => {
        if (tag === 'Live Events') {
          setCards(
            res.sort((a, b) => {
              const aType = a.type;
              const bType = b.type;
              if (aType === 'event' && bType !== 'event') {
                return -1;
              } else if (aType !== 'event' && bType === 'event') {
                return 1;
              } else {
                return 0;
              }
            }),
          );
        } else {
          setCards(res);
        }
      })
      .catch(err => {
        console.log(err);
        setError({
          title: 'Something went wrong...',
          message:
            'Please try again later, or contact support (matthew@ocalanow.app)',
        });
      });
  }, []);
  const onSortPress = ({nativeEvent: {event}}) => {
    setSort(event);
  };
  useEffect(() => {
    if (cards && sort) {
      if (sort === 'closest') {
        setCards(prevState => [
          ...prevState.sort((a, b) => {
            const distA = Number(
              getDistance(
                {lat: lat(a), lng: lng(a)},
                {lat: currentLocation.lat, lng: currentLocation.lng},
              ),
            );
            const distB = Number(
              getDistance(
                {lat: lat(b), lng: lng(b)},
                {
                  lat: currentLocation.lat,
                  lng: currentLocation.lng,
                },
              ),
            );
            return distA > distB;
          }),
        ]);
      } else if (sort === 'match') {
        setCards(prevState => [...prevState.sort(sortCardsByMatch)]);
      }
    }
  }, [sort]);
  const actions = [
    ...(currentLocation
      ? [
          {
            id: 'closest',
            title: 'Closest to Me',
            state: sort && sort === 'closest' ? 'on' : 'off',
          },
        ]
      : []),
    {
      id: 'match',
      title: 'Match Level',
      state: sort && sort === 'match' ? 'on' : 'off',
    },
  ];
  const lat = card => {
    switch (card.type) {
      case 'info':
        return card.data.company.location.coordinate.lat;
      case 'deal':
        return card.deal.company.location.coordinate.lat;
      case 'event':
        return card.event.location.coordinate.lat;
    }
  };
  const lng = card => {
    switch (card.type) {
      case 'info':
        return card.data.company.location.coordinate.lng;
      case 'deal':
        return card.deal.company.location.coordinate.lng;
      case 'event':
        return card.event.location.coordinate.lng;
    }
  };
  const sortCardsByMatch = (card1, card2) => {
    /*
      Takes in card1 and card2
        - point is given to card if card tag is in user interests
        - card with more points is greater than card with less points
     */
    const interests = user.interests ? user.interests : [];

    const tags1 = card1.tags;

    const intersection1 = tags1.filter(tag => interests.includes(tag));
    const tagMatchLevel1 = intersection1.length / card1.tags.length;
    // Tag Match level of 1 means all card tags are in user interests
    const interestsMatchLevel1 = intersection1.length / interests.length;
    // Interest Match level of 1 means that all user interests are in card tags
    const overallMatch1 = tagMatchLevel1 * interestsMatchLevel1;

    const tags2 = card2.tags;
    const intersection2 = tags2.filter(tag => interests.includes(tag));
    const tagMatchLevel2 = intersection2.length / card2.tags.length;
    const interestsMatchLevel2 = intersection2.length / interests.length;
    const overallMatch2 = tagMatchLevel2 * interestsMatchLevel2;

    return overallMatch1 < overallMatch2;
  };
  return (
    <FlatList
      ListHeaderComponent={
        cards ? (
          <HStack
            px={4}
            pt={2}
            justifyContent="space-between"
            alignItems="center">
            <Text
              fontWeight={300}
              italic
              _dark={{color: 'primary.200'}}
              _light={{color: 'primary.500'}}>
              {cards.length} Results
            </Text>
            <MenuView
              title="Sort By"
              onPressAction={onSortPress}
              actions={actions}>
              <View p={2}>
                <FontAwesome5
                  name="sort"
                  color={colors.primary['500']}
                  size={20}
                />
              </View>
            </MenuView>
          </HStack>
        ) : null
      }
      _light={{bg: 'muted.100'}}
      _dark={{bg: 'muted.800'}}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{paddingBottom: bottom}}
      data={cards}
      ref={flatListRef}
      renderItem={({item}) => (
        <CardPreviewTile
          scrollToTop={() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToOffset({
                animated: true,
                offset: 0,
              });
            }
          }}
          currentTag={tag}
          card={item}
          navigation={navigation}
        />
      )}
      keyExtracor={item => item.docID}
      ListEmptyComponent={
        cards ? (
          <Text>Nothing to see here!</Text>
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
};

export default TagView;
