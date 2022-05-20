import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {Button, HStack, useTheme, View} from 'native-base';
import {
  Animated,
  AppState,
  Dimensions,
  PanResponder,
  Platform,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {AppContext} from '../../../AppContext';
import NoMoreCards from './NoMoreCards';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {shareCardLink} from '../../../FireFunctions';

const SCREEN_WIDTH = Dimensions.get('window').width;
const Deck = ({cards, renderCard, refresh, navigation, getInitialCards}) => {
  const {colors} = useTheme();
  const colorScheme = useColorScheme();
  const {
    saved,
    setSaved,
    recycled,
    setRecycled,
    user,
    setError,
    setNotification,
  } = useContext(AppContext);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [actionsDisabled, setActionsDisabled] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (evt, gestureState) => true,
        onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
          return gestureState.dx !== 0 && gestureState.dy !== 0;
        },
        onPanResponderMove: (evt, gestureState) => {
          position.setValue({x: gestureState.dx, y: gestureState.dy});
        },
        onPanResponderRelease: (evt, gestureState) => {
          if (gestureState.dx > 120) {
            // Save
            saveCurrentCard(gestureState);
          } else if (gestureState.dx < -120) {
            // Recycle
            recycleCurrentCard(gestureState);
          } else {
            Animated.spring(position, {
              toValue: {x: 0, y: 0},
              friction: 4,
            }).start();
          }
        },
      }),
    [currentIdx],
  );
  useEffect(() => {
    const lag = setTimeout(() => {
      Animated.timing(position, {
        toValue: {x: 100, y: -30},
      }).start(() => {
        Animated.spring(position, {
          toValue: {x: 0, y: 0},
          friction: 4,
        }).start();
      });
    }, 8000);
    return () => clearTimeout(lag);
  }, [currentIdx]);
  useEffect(() => {
    console.log('setting value', currentIdx);
    position.setValue({x: 0, y: 0});
  }, [currentIdx]);
  const position = useRef(new Animated.ValueXY()).current;
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });
  const saveCurrentCard = ({dy = 0}) => {
    setActionsDisabled(true);
    ReactNativeHapticFeedback.trigger('notificationSuccess');
    Animated.spring(position, {
      toValue: {x: SCREEN_WIDTH + 100, y: dy},
      restSpeedThreshold: 1000,
      restDisplacementThreshold: 100,
      useNativeDriver: false,
    }).start(() => {
      console.log('Running now!');
      if (
        !saved
          .map(savedCard => savedCard.docID)
          .includes(cards[currentIdx].docID)
      ) {
        setSaved(prevState => [...prevState, cards[currentIdx]]);
      }
      setCurrentIdx(prevState => prevState + 1);
      setActionsDisabled(false);
    });
  };
  const recycleCurrentCard = ({dy = 0}) => {
    setActionsDisabled(true);
    ReactNativeHapticFeedback.trigger('soft');
    Animated.spring(position, {
      toValue: {x: -SCREEN_WIDTH - 100, y: dy},
      restSpeedThreshold: 1000,
      restDisplacementThreshold: 100,
      useNativeDriver: false,
    }).start(() => {
      if (!recycled.includes(cards[currentIdx].docID)) {
        setRecycled(prevState => [...prevState, cards[currentIdx].docID]);
      }
      setCurrentIdx(prevState => prevState + 1);
      setActionsDisabled(false);
    });
  };
  const handleUnrecycle = () => {
    setCurrentIdx(0);
    setRecycled([]);
    refresh();
  };
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
      setCurrentIdx(0);
      getInitialCards();
    } else {
      console.log(recycled);
    }
  }, [refreshOnActive]);
  return (
    <View flex={1}>
      <View position="relative" flex={1}>
        {currentIdx === cards.length ? (
          <View flex={1} pt={4}>
            <NoMoreCards
              recycled={recycled}
              handleUnrecycle={() => handleUnrecycle()}
            />
          </View>
        ) : (
          cards
            .map((card, i) => {
              if (i < currentIdx) {
                return null;
              } else if (i === currentIdx) {
                return (
                  <Animated.View
                    {...panResponder.panHandlers}
                    key={i}
                    style={[
                      {
                        transform: [
                          {
                            rotate,
                          },
                          ...position.getTranslateTransform(),
                        ],
                      },
                      styles.cardContainer,
                      {
                        backgroundColor:
                          colorScheme === 'dark'
                            ? colors.muted['800']
                            : colors.muted['100'],
                      },
                    ]}>
                    {renderCard(card)}
                  </Animated.View>
                );
              } else {
                return null;
              }
            })
            .reverse()
        )}
      </View>
      {cards && currentIdx !== cards.length && (
        <HStack
          space={9}
          alignItems="center"
          justifyContent="center"
          p={3}
          w="100%">
          <Button
            isLoading={actionsDisabled}
            borderWidth={2}
            borderColor="error.500"
            p={0}
            m={0}
            style={styles.actionButton}
            _light={{bg: 'muted.100', _pressed: {bg: 'muted.200'}}}
            _dark={{bg: 'muted.800', _pressed: {bg: 'muted.800'}}}
            onPress={() => {
              recycleCurrentCard({dy: 0});
            }}>
            <FontAwesome5
              name="times"
              solid
              color={colors.error['500']}
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
              color={colors.primary['500']}
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
              color={colors.primary['500']}
              size={20}
            />
          </Button>
          <Button
            borderWidth={2}
            borderColor="success.500"
            shadow={1}
            p={0}
            m={0}
            isLoading={actionsDisabled}
            style={styles.actionButton}
            _light={{bg: 'muted.100', _pressed: {bg: 'muted.200'}}}
            _dark={{bg: 'muted.800', _pressed: {bg: 'muted.800'}}}
            onPress={() => {
              saveCurrentCard({dy: 0});
            }}>
            <FontAwesome5
              name="check"
              color={colors.success['500']}
              size={30}
            />
          </Button>
        </HStack>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  actionButton: {
    height: 60,
    width: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Deck;
