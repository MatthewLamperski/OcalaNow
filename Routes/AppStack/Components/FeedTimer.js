import React, {useEffect, useState} from 'react';
import {HStack, Text, useTheme, VStack} from 'native-base';
import {getNextFeedDate} from '../../../FireFunctions';
import LinearGradient from 'react-native-linear-gradient';

const FeedTimer = () => {
  const {colors} = useTheme();
  const [interval, setMyInterval] = useState();
  const [timer, setTimer] = useState(getNextFeedDate() - new Date());
  const days = () => {
    return Math.floor(timer / 1000 / 60 / 60 / 24).toLocaleString('en-US', {
      minimumIntegerDigits: 2,
    });
  };
  const hours = () => {
    return Math.floor((timer / 1000 / 60 / 60) % 24).toLocaleString('en-US', {
      minimumIntegerDigits: 2,
    });
  };
  const minutes = () => {
    return Math.floor((timer / 1000 / 60) % 60).toLocaleString('en-US', {
      minimumIntegerDigits: 2,
    });
  };
  const seconds = () => {
    return (Math.floor((timer / 1000) % 60) + 1).toLocaleString('en-US', {
      minimumIntegerDigits: 2,
    });
  };
  const feedTitle = () => {
    const feedTime = getNextFeedDate();
    if (feedTime.getDay() === 1) {
      return "'Comin' out the Gate'";
    } else {
      return "'Saddle Up'";
    }
  };
  useEffect(() => {
    setMyInterval(
      setInterval(() => {
        setTimer(prevState => prevState - 1000);
      }, 1000),
    );
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (timer === 0) {
      clearInterval(interval);
    }
  }, [timer]);

  return (
    <LinearGradient
      colors={[
        colors.primary['300'],
        colors.primary['400'],
        colors.primary['500'],
      ]}
      useAngle
      angle={75}
      style={{
        width: '100%',
        padding: 7,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <HStack space={3} justifyContent="center" alignItems="center">
        <VStack justifyContent="center" alignItems="center">
          <Text color="white" fontSize={20} fontWeight={300}>
            {days()}
          </Text>
          <Text color="white" fontSize={12}>
            DAYS
          </Text>
        </VStack>
        <VStack justifyContent="center" alignItems="center">
          <Text color="white" fontSize={20} fontWeight={300}>
            {hours()}
          </Text>
          <Text color="white" fontSize={12}>
            HRS
          </Text>
        </VStack>
        <VStack justifyContent="center" alignItems="center">
          <Text color="white" fontSize={20} fontWeight={300}>
            {minutes()}
          </Text>
          <Text color="white" fontSize={12}>
            MIN
          </Text>
        </VStack>
        <VStack justifyContent="center" alignItems="center">
          <Text color="white" fontSize={20} fontWeight={300}>
            {seconds()}
          </Text>
          <Text color="white" fontSize={12}>
            SEC
          </Text>
        </VStack>
      </HStack>
      <Text color="white" my={2}>
        Until next {feedTitle()}
      </Text>
    </LinearGradient>
  );
};

export default FeedTimer;
