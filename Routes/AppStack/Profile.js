import React, {useContext} from 'react';
import {Button, ScrollView, Text, View} from 'native-base';
import {signOut} from '../../FireFunctions';
import {AppContext} from '../../AppContext';

const Profile = () => {
  const {user} = useContext(AppContext);
  return (
    <View flex={1}>
      <ScrollView>
        <Button
          onButtonPress={() => {
            signOut();
          }}
          my={2}>
          Sign Out
        </Button>
        <Text>{JSON.stringify(user, null, 2)}</Text>
      </ScrollView>
    </View>
  );
};

export default Profile;
