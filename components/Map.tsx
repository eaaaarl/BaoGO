import { icons } from '@/constant/image';
import { useGetNearbyDriversQuery } from '@/feature/user/api/userApi';
import { useAppSelector } from '@/libs/redux/hooks';
import React, { useEffect, useState } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from "react-native-maps-directions";

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

const directionsAPI = process.env.EXPO_PUBLIC_GOOGLE_DIRECTIONS_API_KEY;

export default function Map() {

  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  } = useAppSelector((state) => state.location)
  const { selectedDriver } = useAppSelector((state) => state.driver)


  const { data: nearbyDrivers } = useGetNearbyDriversQuery({
    userLatitude: userLatitude!,
    userLongitude: userLongitude!,
    radiusInKm: 5
  }, {
    skip: !userLatitude || !userLongitude
  });

  console.log(nearbyDrivers);

  const [markers, setMarkers] = useState<any[]>([]);
  useEffect(() => {
    if (nearbyDrivers) {
      const newMarkers = nearbyDrivers.map((driver) => ({
        id: driver.id,
        latitude: driver.latitude,
        longitude: driver.longitude,
        title: driver.profiles?.full_name,
      }));

      setMarkers(newMarkers);
    }
  }, [nearbyDrivers]);

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
      {markers.map((marker, index) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.title}
          image={
            selectedDriver === +marker.id ? icons.selectedMarker : icons.marker
          }
        />
      ))}

      {destinationLatitude && destinationLongitude && (
        <>
          <Marker
            key="destination"
            coordinate={{
              latitude: destinationLatitude,
              longitude: destinationLongitude,
            }}
            title="Destination"
            image={icons.pin}
          />
          <MapViewDirections
            origin={{
              latitude: userLatitude!,
              longitude: userLongitude!,
            }}
            destination={{
              latitude: destinationLatitude,
              longitude: destinationLongitude,
            }}
            apikey={directionsAPI!}
            strokeColor="#0286FF"
            strokeWidth={2}
          />
        </>
      )}
    </MapView>
  );
}