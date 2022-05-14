import React, {useContext, useEffect, useRef, useState} from 'react';
import {Button, HStack, Spinner, useTheme, View} from 'native-base';
import {AppContext} from '../../AppContext';
import Card from './Components/Card';
import SwipeCards from 'react-native-swipe-cards-deck';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {AppState, Platform, StyleSheet} from 'react-native';
import NoMoreCards from './Components/NoMoreCards';
import {getCards, shareCardLink} from '../../FireFunctions';
import analytics from '@react-native-firebase/analytics';

const Home = ({navigation, route}) => {
  const {
    user,
    setUser,
    setError,
    currentLocation,
    setCurrentLocation,
    setSavedBank,
    savedBank,
    getUserLocation,
  } = useContext(AppContext);
  const theme = useTheme();
  const [cards, setCards] = useState();
  const swiperRef = useRef(null);
  const [saved, setSaved] = useState(user.saved ? user.saved : []);
  const [recycled, setRecycled] = useState(user.recycled ? user.recycled : []);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [actionsDisabled, setActionsDisabled] = useState(false);
  const [showButtons, setShowButtons] = useState(true);
  const [shareLoading, setShareLoading] = useState(false);

  useEffect(() => {
    if (actionsDisabled) {
      setTimeout(() => {
        setActionsDisabled(false);
      }, 1000);
    }
  }, [actionsDisabled]);
  useEffect(() => {
    refreshCards(filterCards);
  }, []);
  useEffect(() => {
    getUserLocation();
  }, []);
  useEffect(() => {
    setUser({
      ...user,
      recycled: recycled,
    });
  }, [recycled]);
  useEffect(() => {
    setUser({
      ...user,
      saved: saved,
    });
  }, [saved]);
  const appState = useRef(AppState.currentState);
  const [refreshOnActive, setCheckLocation] = useState(false);
  useEffect(() => {
    const appStateSubscription = AppState.addEventListener(
      'change',
      nextAppState => {
        if (appState.current.match(/background/) && nextAppState === 'active') {
          console.log('Should be');
          setCheckLocation(true);
          setTimeout(() => {
            setCheckLocation(false);
          }, 1000);
        }
        appState.current = nextAppState;
      },
    );
    return () => {
      appStateSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (recycled.length === 0 && refreshOnActive) {
      console.log('refreshing');
      setSaved(user.saved ? user.saved : []);
      setRecycled(user.recycled ? user.recycled : []);
      refreshCards(filterCards);
    } else {
      console.log(recycled);
    }
  }, [refreshOnActive]);

  // Card Maintainence

  const refreshCards = filterFunction => {
    setCards();
    getCards()
      .then(res => {
        const displayCards = res.filter(filterFunction).sort(sortCardsByMatch);
        setCards(displayCards);
        if (displayCards.length > 0) {
          setShowButtons(true);
          setCurrentIdx(0);
        }
        const userSaved = res.filter(card => {
          if (!user.saved) {
            // User has not saved any
            return false;
          } else {
            return user.saved.includes(card.docID);
          }
        });
        setSavedBank({
          ...savedBank,
          [user.uid]: userSaved,
        });
      })
      .catch(err => console.log(err));
  };

  const filterCards = card => {
    /*
      Return if
        - User has saved and card is not in saved
        - User has recycled and card is not in recycled
     */
    const recycledEmpty = recycled.length === 0;
    const savedEmpty = saved.length === 0;
    if (savedEmpty && recycledEmpty) {
      return true;
    } else if (!savedEmpty && recycledEmpty) {
      // Has saved but not recycled
      return !saved.includes(card.docID);
    } else if (savedEmpty && !recycledEmpty) {
      // Has recycled but not saved
      return !recycled.includes(card.docID);
    } else {
      return !saved.includes(card.docID) && !recycled.includes(card.docID);
    }
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
      return !saved.includes(card.docID);
    } else if (savedEmpty && !recycledEmpty) {
      // Has recycled but not saved
      return !recycled.includes(card.docID);
    } else {
      return !saved.includes(card.docID) && !recycled.includes(card.docID);
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

  const saveCard = async card => {
    setActionsDisabled(true);
    ReactNativeHapticFeedback.trigger('notificationSuccess');
    if (card.docID) {
      if (!saved.includes(card.docID)) {
        setSaved(prevState => [...prevState, card.docID]);
        if (savedBank && savedBank[user.uid]) {
          if (
            !savedBank[user.uid]
              .map(savedCard => savedCard.docID)
              .includes(card.docID)
          ) {
            setSavedBank({
              ...savedBank,
              [user.uid]: savedBank[user.uid]
                ? [...savedBank[user.uid], card]
                : [card],
            });
          }
        } else {
          setSavedBank({
            ...savedBank,
            [user.uid]: savedBank[user.uid]
              ? [...savedBank[user.uid], card]
              : [card],
          });
        }
      }
    }
    analytics()
      .logEvent('card_swipe_right', {
        type: card.type,
        docID: card.docID,
        uid: user.uid,
      })
      .then(() => console.log('card_swipe_right logged'));
  };

  const handleSave = card => {
    saveCard(card);
    return true;
  };
  const handleRecycle = card => {
    setActionsDisabled(true);
    ReactNativeHapticFeedback.trigger('soft');
    if (card && card.docID) {
      if (!recycled.includes(card.docID)) {
        setRecycled(prevState => [...prevState, card.docID]);
      }
    }
    analytics()
      .logEvent('card_swipe_left', {
        type: card.type,
        docID: card.docID,
        uid: user.uid,
      })
      .then(() => console.log('card_swipe_left logged'));
    return true;
  };
  const handleUnrecycle = () => {
    analytics()
      .logEvent('unrecycle', {
        uid: user.uid,
      })
      .then(() => console.log('unrecycle logged'));
    setRecycled([]);
    refreshCards(filterCardsRefreshed);
  };
  return (
    <View display="flex" px={4} pb={2} flex={1}>
      {!cards ? (
        <Spinner my="auto" mx="auto" color="primary.500" />
      ) : (
        <SwipeCards
          smoothTransition={true}
          ref={swiperRef}
          style={{alignItems: 'stretch', flexGrow: 1, paddingTop: 20}}
          cards={cards}
          cardRemoved={card => setCurrentIdx(card + 1)}
          renderCard={card => (
            <Card
              card={card}
              currentLocation={currentLocation}
              navigation={navigation}
            />
          )}
          keyExtractor={cardData => cardData.docID}
          actions={{
            nope: {onAction: handleRecycle, show: false},
            yup: {onAction: handleSave, show: false},
          }}
          renderNoMoreCards={() => (
            <NoMoreCards
              setCurrentIdx={setCurrentIdx}
              setShowButtons={setShowButtons}
              handleUnrecycle={handleUnrecycle}
              recycled={recycled}
            />
          )}
          showYup={false}
          showNope={false}
        />
      )}
      {cards && cards.length !== 0 && showButtons && (
        <HStack
          space={9}
          alignItems="center"
          justifyContent="center"
          p={3}
          w="100%">
          <Button
            isDisabled={actionsDisabled}
            borderWidth={2}
            borderColor="error.500"
            p={0}
            m={0}
            style={styles.actionButton}
            _light={{bg: 'muted.100', _pressed: {bg: 'muted.200'}}}
            _dark={{bg: 'muted.800', _pressed: {bg: 'muted.800'}}}
            onPress={() => {
              ReactNativeHapticFeedback.trigger('soft');
              swiperRef.current.swipeNope();
              handleRecycle(cards[currentIdx]);
            }}>
            <FontAwesome5
              name="times"
              solid
              color={theme.colors.error['500']}
              size={30}
            />
          </Button>
          <Button
            p={0}
            m={0}
            borderWidth={2}
            borderColor="primary.500"
            style={styles.actionButton}
            _light={{bg: 'muted.100', _pressed: {bg: 'muted.200'}}}
            _dark={{bg: 'muted.800', _pressed: {bg: 'muted.800'}}}
            onPress={() => {
              ReactNativeHapticFeedback.trigger(
                Platform.select({ios: 'impactHeavy', android: 'impactMedium'}),
              );
              navigation.navigate('CardDetailView', {
                card: cards[currentIdx],
              });
            }}>
            <FontAwesome5
              name="chevron-up"
              color={theme.colors.primary['500']}
              size={30}
            />
          </Button>
          <Button
            isLoading={shareLoading}
            p={0}
            m={0}
            borderWidth={2}
            borderColor="primary.500"
            style={styles.actionButton}
            _light={{bg: 'muted.100', _pressed: {bg: 'muted.200'}}}
            _dark={{bg: 'muted.800', _pressed: {bg: 'muted.800'}}}
            onPress={() => {
              ReactNativeHapticFeedback.trigger(
                Platform.select({ios: 'impactHeavy', android: 'impactMedium'}),
              );
              setShareLoading(true);
              shareCardLink(cards[currentIdx], user.uid)
                .then(() => setShareLoading(false))
                .catch(err => {
                  setShareLoading(false);
                  if (!(JSON.stringify(err) === '{}')) {
                    setError({
                      title: 'Something went wrong...',
                      message:
                        "We couldn't generate a link for that card. Try again later.",
                    });
                  }
                });
            }}>
            <FontAwesome5
              solid
              name="share-square"
              color={theme.colors.primary['500']}
              size={20}
            />
          </Button>
          <Button
            borderWidth={2}
            borderColor="success.500"
            shadow={1}
            p={0}
            m={0}
            isDisabled={actionsDisabled}
            style={styles.actionButton}
            _light={{bg: 'muted.100', _pressed: {bg: 'muted.200'}}}
            _dark={{bg: 'muted.800', _pressed: {bg: 'muted.800'}}}
            onPress={() => {
              ReactNativeHapticFeedback.trigger('notificationSuccess');
              swiperRef.current.swipeYup();
              handleSave(cards[currentIdx]);
            }}>
            <FontAwesome5
              name="check"
              color={theme.colors.success['500']}
              size={30}
            />
          </Button>
        </HStack>
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
