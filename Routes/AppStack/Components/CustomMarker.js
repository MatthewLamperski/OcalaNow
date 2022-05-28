import React, {useEffect, useMemo, useRef} from 'react';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {View} from 'native-base';
import {Marker} from 'react-native-maps';

const CustomMarker = ({card, filters, onPress}) => {
  const markerRef = useRef(null);
  const markerOpacity = useMemo(() => {
    if (filters.length === 0) {
      return 1;
    } else if (filters.filter(tag => card.tags.includes(tag)).length >= 1) {
      return 1;
    } else {
      return 0.2;
    }
  }, [filters]);

  useEffect(() => {
    markerRef.current.redraw();
  }, [filters]);

  const lat = useMemo(() => {
    switch (card.type) {
      case 'info':
        return card.data.company.location.coordinate.lat;
      case 'deal':
        return card.deal.company.location.coordinate.lat;
      case 'event':
        return card.event.location.coordinate.lat;
    }
  }, [card.type]);
  const lng = useMemo(() => {
    switch (card.type) {
      case 'info':
        return card.data.company.location.coordinate.lng;
      case 'deal':
        return card.deal.company.location.coordinate.lng;
      case 'event':
        return card.event.location.coordinate.lng;
    }
  }, [card.type]);

  const icon = useMemo(() => {
    switch (card.type) {
      case 'info':
        return 'store-alt';
      case 'deal':
        return 'tags';
      case 'event':
        return 'calendar-alt';
    }
  }, [card.type]);
  return (
    <Marker
      ref={markerRef}
      tracksViewChanges={false}
      onPress={() => {
        onPress(card);
      }}
      key={card.docID}
      coordinate={{latitude: lat, longitude: lng}}>
      <View
        opacity={markerOpacity}
        p={1.5}
        shadow={3}
        bg="primary.500"
        rounded="2xl"
        justifyContent="center"
        alignItems="center">
        <FontAwesome5 name={icon} color="white" size={14} />
      </View>
    </Marker>
  );
};

export default CustomMarker;
