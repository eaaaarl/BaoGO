import { useAppSelector } from '@/libs/redux/hooks';
import React from 'react';
import { Text } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

const calculateRegion = ({
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
}) => {
  if (!userLatitude || !userLongitude) {
    return {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  if (!destinationLatitude || !destinationLongitude) {
    return {
      latitude: userLatitude,
      longitude: userLongitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  const minLat = Math.min(userLatitude, destinationLatitude);
  const maxLat = Math.max(userLatitude, destinationLatitude);
  const minLng = Math.min(userLongitude, destinationLongitude);
  const maxLng = Math.max(userLongitude, destinationLongitude);

  const latitudeDelta = (maxLat - minLat) * 1.3; // Adding some padding
  const longitudeDelta = (maxLng - minLng) * 1.3; // Adding some padding

  const latitude = (userLatitude + destinationLatitude) / 2;
  const longitude = (userLongitude + destinationLongitude) / 2;

  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta,
  };
};

export default function Map() {

  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  } = useAppSelector((state) => state.location)

  const region = calculateRegion({
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  })

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={{ flex: 1, width: '100%', height: '100%' }}
      showsUserLocation={true}
      userInterfaceStyle='light'
      mapType='standard'
      initialRegion={region}
    >
      <Text>MAPS</Text>
    </MapView>
  );
}