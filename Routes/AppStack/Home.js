import React, {useContext, useEffect, useRef, useState} from 'react';
import {HStack, Pressable, Spinner, useTheme, View} from 'native-base';
import {AppContext} from '../../AppContext';
import {useMMKV, useMMKVObject} from 'react-native-mmkv';
import {getCards} from '../../FireFunctions';
import Card from './Components/Card';
import SwipeCards from 'react-native-swipe-cards-deck';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {Platform} from 'react-native';

const Home = () => {
  const {user, setUser, userBank} = useContext(AppContext);
  const theme = useTheme();
  const profilePicStorage = useMMKV();
  const [cards, setCards] = useState();
  const swiperRef = useRef(null);
  const [profilePicBank, setProfilePic] = useMMKVObject(
    'profilePicBank',
    profilePicStorage,
  );
  useEffect(() => {
    getCards()
      .then(res => {
        setCards(res);
      })
      .catch(err => console.log(err));
  }, []);
  const handleSave = card => {
    console.log(`Saved ${card.title}`);
    return true;
  };
  const handleRecycle = card => {
    console.log(`Recycled ${card.title}`);
    return true;
  };
  const handleMaybe = card => {
    console.log(`Maybe for ${card.title}`);
    return true;
  };
  return (
    <View display="flex" p={4} flex={1}>
      {!cards ? (
        <Spinner color="primary.500" />
      ) : (
        <SwipeCards
          ref={swiperRef}
          style={{alignItems: 'stretch', flexGrow: 1, paddingTop: 20}}
          cards={cards}
          renderCard={card => <Card card={card} />}
          keyExtractor={cardData => cardData.docID}
          actions={{
            nope: {onAction: handleRecycle, show: false},
            yup: {onAction: handleSave, show: false},
            maybe: {onAction: handleMaybe, show: false},
          }}
          showYup={false}
          showNope={false}
          hasMaybeAction
        />
      )}
      {cards && (
        <HStack
          alignItems="center"
          justifyContent="space-between"
          p={3}
          w="100%">
          <Pressable
            onPress={() => {
              ReactNativeHapticFeedback.trigger('soft');
              swiperRef.current.swipeNope();
            }}>
            <FontAwesome5
              name="times-circle"
              solid
              color={theme.colors.error['500']}
              size={40}
            />
          </Pressable>
          <Pressable
            onPress={() => {
              ReactNativeHapticFeedback.trigger(
                Platform.select({ios: 'impactHeavy', android: 'impactMedium'}),
              );
              console.log('more Info');
            }}>
            <FontAwesome5
              name="chevron-circle-up"
              solid
              color={theme.colors.primary['500']}
              size={40}
            />
          </Pressable>
          <Pressable
            onPress={() => {
              ReactNativeHapticFeedback.trigger('notificationSuccess');
              swiperRef.current.swipeYup();
            }}>
            <FontAwesome5
              name="check-circle"
              solid
              color={theme.colors.green['500']}
              size={40}
            />
          </Pressable>
        </HStack>
      )}
    </View>
  );
};

export default Home;
