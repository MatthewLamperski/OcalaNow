import React, {useContext} from 'react';
import {Button, ScrollView, Text, View} from 'native-base';
import {AppContext} from '../AppContext';
import Auth from '@react-native-firebase/auth';
import {useMMKV, useMMKVObject} from 'react-native-mmkv';
import {signOut} from '../FireFunctions';

const Home = () => {
  const {user, setUser, userBank} = useContext(AppContext);
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
        <Button
          my={2}
          onPress={() => {
            signOut();
          }}>
          Sign Out
        </Button>
        <Button
          onPress={() => {
            setUser(prevState => ({
              ...prevState,
              testing: 'ummm I think I got it',
            }));
          }}>
          Set Interests
        </Button>
        <Button
          my={2}
          onPress={() => {
            if (user) {
              setProfilePic({
                ...profilePicBank,
                [user.uid]: `${user.uid} testing`,
              });
            }
          }}>
          Set Profile Pic
        </Button>
        <Text>{JSON.stringify(user, null, 2)}</Text>
      </ScrollView>
    </View>
  );
};

export default Home;
