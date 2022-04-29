import React, {useContext} from 'react';
import {Button, ScrollView, Text, View} from 'native-base';
import {AppContext} from '../AppContext';
import Auth from '@react-native-firebase/auth';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useMMKV, useMMKVObject} from 'react-native-mmkv';

const Home = () => {
  const {user, setUser} = useContext(AppContext);
  const {top, bottom} = useSafeAreaInsets();
  const signIn = () => {
    Auth()
      .signInWithEmailAndPassword('matthew.lamperski@gmail.com', 'Tri77con')
      .then(cred => {
        console.log('SIGNED YOU IN');
      })
      .catch(err => console.log(err));
  };
  const profilePicStorage = useMMKV();
  const [profilePicBank, setProfilePic] = useMMKVObject(
    'profilePicBank',
    profilePicStorage,
  );
  return (
    <View
      pt={2}
      style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
      <ScrollView>
        <Text>Home Tab</Text>
        <Text fontSize="xs">Extra Small</Text>
        <Text fontSize="sm">Small</Text>
        <Text fontSize="md">Medium</Text>
        <Text fontSize="lg">Large</Text>
        <Text fontSize="xl">Extra Large</Text>
        <Text>{JSON.stringify(user, null, 2)}</Text>
        <Button
          my={2}
          onPress={() => {
            Auth().signOut();
          }}>
          Sign Out
        </Button>
        <Button
          onPress={() => {
            signIn();
          }}>
          Sign In
        </Button>
        <Button
          my={2}
          onPress={() => {
            if (user) {
              setProfilePic({
                ...profilePicBank,
                [user.uid]: `${user.uid} profile pic`,
              });
            }
          }}>
          Set Profile Pic
        </Button>
        <Text>{JSON.stringify(profilePicBank, null, 2)}</Text>
      </ScrollView>
    </View>
  );
};

export default Home;
