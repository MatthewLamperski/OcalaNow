import React, {useContext, useEffect, useState} from 'react';
import {getTags} from '../../FireFunctions';
import {AppContext} from '../../AppContext';
import {FlatGrid} from 'react-native-super-grid';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Button, useTheme, View} from 'native-base';
import {useColorScheme} from 'react-native';
import TagPreview from './Components/TagPreview';
import messaging from '@react-native-firebase/messaging';

const InterestsSelectionView = ({navigation}) => {
  const {bottom} = useSafeAreaInsets();
  const {colors} = useTheme();
  const colorScheme = useColorScheme();
  const {user, setUser, setError} = useContext(AppContext);
  const [tags, setTags] = useState();
  const [selected, setSelected] = useState(
    user.interests ? user.interests : [],
  );
  const [buttonHeight, setButtonHeight] = useState(0);
  useEffect(() => {
    getTags()
      .then(res => {
        console.log(res.length);
        setTags(res);
      })
      .catch(err => {
        console.log(err);
        setError({
          title: 'Something went wrong...',
          message:
            "We couldn't load any interests. Try closing the app and coming back.",
        });
      });
  }, []);

  const onButtonLayout = ({nativeEvent}) => {
    setButtonHeight(nativeEvent.layout.height);
  };
  useEffect(() => {
    if (selected.length === 0) {
      setButtonHeight(0);
    }
  }, [selected]);
  return (
    <View position="relative" flex={1}>
      <FlatGrid
        contentInsetAdjustmentBehavior="automatic"
        keyExtractor={item => item.text}
        itemDimension={130}
        data={tags}
        style={{
          backgroundColor:
            colorScheme === 'dark' ? colors.muted['800'] : colors.muted['100'],
          flex: 1,
        }}
        contentContainerStyle={{paddingBottom: buttonHeight}}
        renderItem={({item}) => (
          <TagPreview
            selected={selected}
            setSelected={setSelected}
            item={item}
          />
        )}
      />
      {selected.length > 0 && (
        <View
          onLayout={onButtonLayout}
          bg="transparent"
          justifyContent="center"
          alignItems="center"
          w="100%"
          p={2}
          shadow={3}
          px={5}
          pb={bottom}
          position="absolute"
          bottom={0}>
          <Button
            w="100%"
            onButtonPress={() => {
              selected.forEach(interest => {
                messaging()
                  .subscribeToTopic(interest.replace(/\s/, ''))
                  .then(res => console.log('subscribed to:', interest, res));
              });
              setUser(prevState => ({
                ...prevState,
                interests: selected,
              }));
              navigation.replace('TabNavigator');
            }}
            borderRadius={100}>
            Continue to OcalaNow
          </Button>
        </View>
      )}
    </View>
  );
};

export default InterestsSelectionView;
