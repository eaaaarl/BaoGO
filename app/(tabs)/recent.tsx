import React from 'react';
import { Text } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

export default function Map() {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={{ flex: 1, width: '100%', height: '100%' }}
      initialRegion={{
        latitude: 8.4458107, // San franciso agusan del sur
        longitude: 125.9175771,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      <Text>MAPS</Text>
    </MapView>
  );
}