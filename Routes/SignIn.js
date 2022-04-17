import React from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Auth from '@react-native-firebase/auth';
import {Button, ScrollView, View} from 'native-base';

const SignIn = () => {
  const {top, bottom} = useSafeAreaInsets();
  const signIn = () => {
    Auth()
      .signInWithEmailAndPassword('matthew.lamperski@gmail.com', 'Tri77con')
      .then(cred => {
        console.log('SIGNED YOU IN');
      })
      .catch(err => console.log(err));
  };

  return (
    <View
      pt={top}
      bg="dark.500"
      style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
      <ScrollView>
        <Button
          onPress={() => {
            signIn();
          }}>
          Sign In
        </Button>
      </ScrollView>
    </View>
  );
};

export default SignIn;
