import React, {useContext, useEffect, useState} from 'react';
import {Spinner, Text, View, VStack} from 'native-base';
import {AppContext} from '../../AppContext';
import {StyleSheet} from 'react-native';
import {getCards} from '../../FireFunctions';
import analytics from '@react-native-firebase/analytics';
import Deck from './Components/Deck';
import Card from './Components/Card';

const Home = ({navigation, route}) => {
  const {
    user,
    currentLocation,
    getUserLocation,
    saved,
    setSaved,
    recycled,
    setRecycled,
  } = useContext(AppContext);
  const [cards, setCards] = useState();
  const [actionsDisabled, setActionsDisabled] = useState(false);

  useEffect(() => {
    if (actionsDisabled) {
      setTimeout(() => {
        setActionsDisabled(false);
      }, 1000);
    }
  }, [actionsDisabled]);
  useEffect(() => {
    getInitialCards();
  }, []);
  useEffect(() => {
    getUserLocation();
  }, []);

  // Card Maintainence

  const getInitialCards = () => {
    setCards();
    getCards().then(res => {
      const tmpSaved = user.saved
        ? res.filter(card => user.saved.includes(card.docID))
        : [];
      setSaved(tmpSaved);
      const tmpRecycled = user.recycled ? user.recycled : [];
      setRecycled(tmpRecycled);
      const displayCards = res
        .filter(
          card =>
            !tmpSaved.map(savedCard => savedCard.docID).includes(card.docID) &&
            !tmpRecycled.includes(card.docID),
        )
        .sort(sortCardsByMatch);
      setCards(displayCards);
    });
  };

  const refreshCards = filterFunction => {
    setCards();
    getCards()
      .then(res => {
        const displayCards = res.filter(filterFunction).sort(sortCardsByMatch);
        setCards(displayCards);
      })
      .catch(err => console.log(err));
  };

  const filterCardsRefreshed = card => {
    /*
      Return if
        - User has saved and card is not in saved
        - User has recycled and card is not in recycled
     */
    const recycledEmpty = true;
    const savedEmpty = saved.length === 0;
    if (savedEmpty && recycledEmpty) {
      return true;
    } else if (!savedEmpty && recycledEmpty) {
      // Has saved but not recycled
      return !saved.map(savedCard => savedCard.docID).includes(card.docID);
    } else if (savedEmpty && !recycledEmpty) {
      // Has recycled but not saved
      return !recycled.includes(card.docID);
    } else {
      return (
        !saved.map(savedCard => savedCard.docID).includes(card.docID) &&
        !recycled.includes(card.docID)
      );
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

  const refresh = () => {
    analytics()
      .logEvent('unrecycle', {
        uid: user.uid,
      })
      .then(() => console.log('unrecycle logged'));
    refreshCards(filterCardsRefreshed);
  };
  useEffect(() => {
    if (cards) {
      console.log('CARDS LENGTH', cards.length);
    }
  }, [cards]);
  return (
    <View display="flex" px={4} pb={2} flex={1}>
      {!cards ? (
        <VStack flex={1} justifyContent="center" alignItems="center">
          <Spinner p={3} mx="auto" color="primary.500" />
          <Text fontSize={18} fontWeight={300}>
            Getting more...
          </Text>
        </VStack>
      ) : (
        <Deck
          cards={cards}
          setCards={setCards}
          refresh={refresh}
          getInitialCards={getInitialCards}
          navigation={navigation}
          renderCard={card => (
            <Card
              card={card}
              currentLocation={currentLocation}
              navigation={navigation}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    height: 60,
    width: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home;
