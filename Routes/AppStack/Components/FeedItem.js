import React from 'react';
import {HStack, ScrollView, Text, useTheme, View, VStack} from 'native-base';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {useColorScheme} from 'react-native';
import CardPreview from './CardPreview';
import TagLogoGold from '../../../assets/svgs/TagLogoGold';

const FeedItem = ({item, navigation}) => {
  const {colors} = useTheme();
  const colorScheme = useColorScheme();
  const icon = () => {
    switch (item.type) {
      case 'saddle':
        return (
          <FontAwesome5
            name="horse-head"
            color={colors.primary['500']}
            size={20}
          />
        );
      case 'otg':
        return (
          <FontAwesome5
            name="hat-cowboy-side"
            color={colors.primary['500']}
            size={20}
          />
        );
      case 'info':
        return <TagLogoGold height={25} width={25} />;
    }
  };
  const title = () => {
    switch (item.type) {
      case 'saddle':
        return 'Saddle Up for the Weekend';
      case 'otg':
        return "Comin' out the Gate";
      case 'info':
        return 'OcalaNow Featured';
    }
  };
  const date = () => {
    const month = item.date.toDate().toLocaleString('default', {month: 'long'});
    const day = item.date.toDate().toLocaleString('default', {day: 'numeric'});
    const time = item.date
      .toDate()
      .toLocaleString('default', {timeStyle: 'short'});
    switch (item.type) {
      case 'saddle':
        return `The weekend of ${month} ${day}`;
      case 'otg':
        return `The week of ${month} ${day}`;
      case 'info':
        return `${month} ${day}, ${time}`;
    }
  };
  return (
    <View>
      <VStack space={3}>
        <HStack p={5} justifyContent="flex-start" alignItems="center" space={2}>
          <View
            shadow={1}
            style={{height: 50, width: 50, borderRadius: 40}}
            justifyContent="center"
            alignItems="center"
            _dark={{bg: 'muted.700'}}
            _light={{bg: 'white'}}>
            {icon()}
          </View>
          <VStack>
            <Text _light={{color: 'muted.700'}} fontSize={18} fontWeight={300}>
              {title()}
            </Text>
            <HStack space={2} justifyContent="flex-start" alignItems="center">
              <FontAwesome5
                solid
                name="calendar"
                size={16}
                color={
                  colorScheme === 'dark'
                    ? colors.muted['100']
                    : colors.muted['800']
                }
              />
              <Text
                fontSize={16}
                fontWeight={200}
                _light={{color: 'muted.500'}}
                _dark={{color: 'muted.400'}}>
                {date()}
              </Text>
            </HStack>
          </VStack>
        </HStack>
        <Text px={4} fontSize={14}>
          {item.text}
        </Text>
        <ScrollView showsHorizontalScrollIndicator={false} horizontal>
          <HStack
            p={3}
            justifyContent="center"
            alignItems="flex-start"
            space={3}>
            {item.cards.map(card => (
              <CardPreview navigation={navigation} cardObj={card} />
            ))}
          </HStack>
        </ScrollView>
      </VStack>
    </View>
  );
};

export default FeedItem;
