import React, {useEffect, useState} from 'react';
import {getCompanies} from '../../FireFunctions';
import Geocoder from '@timwangdev/react-native-geocoder/src/geocoder';
import {Box, HStack, ScrollView, Text, useTheme, View} from 'native-base';
import MapView, {Marker} from 'react-native-maps';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Logo from '../Logo';

const Discover = () => {
  const [companies, setCompanies] = useState();
  const {top} = useSafeAreaInsets();
  const theme = useTheme();
  useEffect(() => {
    if (companies === undefined) {
      getCompanies()
        .then(async resObj => {
          let tmpCompanies = [];
          for (const company of resObj) {
            let result = await Geocoder.geocodeAddress(company.address);
            if (result.length !== 0) {
              tmpCompanies.push({
                lat: result[0].position.lat,
                lng: result[0].position.lng,
                ...company,
              });
            } else {
              console.log(company.address);
            }
          }
          setCompanies(tmpCompanies);
        })
        .catch(err => {
          console.log(err);
        });
    }
  }, []);
  return (
    <View style={{flex: 1}}>
      <MapView
        showsUserLocation={true}
        showsPointsOfInterest={false}
        style={{
          flex: 1,
        }}
        initialRegion={{
          latitude: 29.1872,
          longitude: -82.1401,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}>
        {companies &&
          companies.map(company => (
            <Marker
              key={company.docID}
              coordinate={{latitude: company.lat, longitude: company.lng}}
              onPress={() => console.log(JSON.stringify(company))}>
              <Box
                bg={`rgb(${company.background.red}, ${company.background.green}, ${company.background.blue})`}
                shadow={3}
                borderRadius={40}
                p={0.5}>
                <Logo logo={company.logo} />
              </Box>
            </Marker>
          ))}
      </MapView>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        p={3}
        style={{position: 'absolute', top: 0, display: 'flex'}}
        horizontal={true}
        pt={top}>
        <HStack
          p={3}
          pr={8}
          space={2}
          display="flex"
          justifyContent="center"
          alignItems="center">
          <Box
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            rounded="3xl"
            p={3}
            px={4}
            bg="muted.800">
            <FontAwesome5
              name="walking"
              size={16}
              color={theme.colors.primary['500']}
            />
            <Text pl={3} color="white" fontSize={14}>
              Walking Distance
            </Text>
          </Box>
          <Box
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            rounded="3xl"
            p={3}
            px={4}
            bg="muted.800">
            <FontAwesome5
              name="utensils"
              size={16}
              color={theme.colors.primary['500']}
            />
            <Text pl={3} color="white" fontSize={14}>
              Food
            </Text>
          </Box>
          <Box
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            rounded="3xl"
            p={3}
            px={4}
            bg="muted.800">
            <FontAwesome5
              name="beer"
              size={16}
              color={theme.colors.primary['500']}
            />
            <Text pl={3} color="white" fontSize={14}>
              Bars
            </Text>
          </Box>
          <Box
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            rounded="3xl"
            p={3}
            px={4}
            bg="muted.800">
            <FontAwesome5
              name="ticket-alt"
              size={16}
              color={theme.colors.primary['500']}
            />
            <Text pl={3} color="white" fontSize={14}>
              Events
            </Text>
          </Box>
        </HStack>
      </ScrollView>
    </View>
  );
};

export default Discover;
