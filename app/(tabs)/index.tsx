import GoogleTextInput from '@/components/GoogleTextInput';
import Map from '@/components/Map';
import RideCard from '@/components/RideCard';
import { icons, images } from '@/constant/image';
import { useGetProfileUserQuery } from '@/feature/auth/api/authApi';
import { useAppDispatch, useAppSelector } from '@/libs/redux/hooks';
import { clearSelectedDriver } from '@/libs/redux/state/driverSlice';
import { clearLocation, setDestinationLocation, setUserLocation } from '@/libs/redux/state/locationSlice';
import { supabase } from '@/libs/supabase';
import { Ride } from '@/libs/utils';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const recentRides = [
  {
    "ride_id": "1",
    "origin_address": "Kathmandu, Nepal",
    "destination_address": "Pokhara, Nepal",
    "origin_latitude": "27.717245",
    "origin_longitude": "85.323961",
    "destination_latitude": "28.209583",
    "destination_longitude": "83.985567",
    "ride_time": 391,
    "fare_price": "19500.00",
    "payment_status": "paid",
    "driver_id": 2,
    "user_id": "1",
    "created_at": "2024-08-12 05:19:20.620007",
    "driver": {
      "driver_id": "2",
      "first_name": "David",
      "last_name": "Brown",
      "profile_image_url": "https://ucarecdn.com/6ea6d83d-ef1a-483f-9106-837a3a5b3f67/-/preview/1000x666/",
      "car_image_url": "https://ucarecdn.com/a3872f80-c094-409c-82f8-c9ff38429327/-/preview/930x932/",
      "car_seats": 5,
      "rating": "4.60"
    }
  },
  {
    "ride_id": "2",
    "origin_address": "Jalkot, MH",
    "destination_address": "Pune, Maharashtra, India",
    "origin_latitude": "18.609116",
    "origin_longitude": "77.165873",
    "destination_latitude": "18.520430",
    "destination_longitude": "73.856744",
    "ride_time": 491,
    "fare_price": "24500.00",
    "payment_status": "paid",
    "driver_id": 1,
    "user_id": "1",
    "created_at": "2024-08-12 06:12:17.683046",
    "driver": {
      "driver_id": "1",
      "first_name": "James",
      "last_name": "Wilson",
      "profile_image_url": "https://ucarecdn.com/dae59f69-2c1f-48c3-a883-017bcf0f9950/-/preview/1000x666/",
      "car_image_url": "https://ucarecdn.com/a2dc52b2-8bf7-4e49-9a36-3ffb5229ed02/-/preview/465x466/",
      "car_seats": 4,
      "rating": "4.80"
    }
  },
  {
    "ride_id": "3",
    "origin_address": "Zagreb, Croatia",
    "destination_address": "Rijeka, Croatia",
    "origin_latitude": "45.815011",
    "origin_longitude": "15.981919",
    "destination_latitude": "45.327063",
    "destination_longitude": "14.442176",
    "ride_time": 124,
    "fare_price": "6200.00",
    "payment_status": "paid",
    "driver_id": 1,
    "user_id": "1",
    "created_at": "2024-08-12 08:49:01.809053",
    "driver": {
      "driver_id": "1",
      "first_name": "James",
      "last_name": "Wilson",
      "profile_image_url": "https://ucarecdn.com/dae59f69-2c1f-48c3-a883-017bcf0f9950/-/preview/1000x666/",
      "car_image_url": "https://ucarecdn.com/a2dc52b2-8bf7-4e49-9a36-3ffb5229ed02/-/preview/465x466/",
      "car_seats": 4,
      "rating": "4.80"
    }
  },
  {
    "ride_id": "4",
    "origin_address": "Okayama, Japan",
    "destination_address": "Osaka, Japan",
    "origin_latitude": "34.655531",
    "origin_longitude": "133.919795",
    "destination_latitude": "34.693725",
    "destination_longitude": "135.502254",
    "ride_time": 159,
    "fare_price": "7900.00",
    "payment_status": "paid",
    "driver_id": 3,
    "user_id": "1",
    "created_at": "2024-08-12 18:43:54.297838",
    "driver": {
      "driver_id": "3",
      "first_name": "Michael",
      "last_name": "Johnson",
      "profile_image_url": "https://ucarecdn.com/0330d85c-232e-4c30-bd04-e5e4d0e3d688/-/preview/826x822/",
      "car_image_url": "https://ucarecdn.com/289764fb-55b6-4427-b1d1-f655987b4a14/-/preview/930x932/",
      "car_seats": 4,
      "rating": "4.70"
    }
  }
]

export default function Index() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { userAddress } = useAppSelector((state) => state.location);

  const [hasPermission, setHasPermission] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const loading = false;
  const { data: profileUser } = useGetProfileUserQuery(user?.id as string);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
      return status === 'granted';
    } catch (error) {
      console.log('Permission error:', error);
      return false;
    }
  };

  const getCurrentLocation = useCallback(async () => {
    if (!user) return;

    setIsLoadingLocation(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Location Permission Required',
          'Please enable location permissions to see your current location and find nearby rides.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      dispatch(setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: address[0]?.street || 'Unknown location'
      }));

    } catch (error) {
      console.log('Location error:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please try again or check your location settings.'
      );
    } finally {
      setIsLoadingLocation(false);
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user) {
      getCurrentLocation();
    }
  }, [user, getCurrentLocation]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await getCurrentLocation();
    setTimeout(() => setIsRefreshing(false), 500);
  }, [getCurrentLocation]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    dispatch(clearSelectedDriver());
    dispatch(clearLocation());
    router.replace('/(auth)/sign-in');
  };

  const handleDestinationPress = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    dispatch(setDestinationLocation(location));
    router.push('/(root)/find-ride');
  };

  const handleManualRefresh = () => {
    getCurrentLocation();
  };

  return (
    <SafeAreaView className='bg-general-500'>
      <FlatList
        data={recentRides.slice(0, 5)}
        renderItem={({ item }) => <RideCard ride={item as unknown as Ride} />}
        keyExtractor={(item, index) => index.toString()}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#000']} // Android
            tintColor="#000" // iOS
            title="Pull to refresh location..." // iOS
            titleColor="#000" // iOS
          />
        }
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {!loading ? (
              <>
                <Image
                  source={images.noResult}
                  className="w-40 h-40"
                  alt="No recent rides found"
                  resizeMode="contain"
                />
                <Text className="text-sm">No recent rides found</Text>
              </>
            ) : (
              <ActivityIndicator size="small" color="#000" />
            )}
          </View>
        )}
        ListHeaderComponent={
          <>
            <View className="flex flex-row items-center justify-between my-5">
              <Text className="text-2xl font-JakartaExtraBold">
                Welcome {profileUser?.full_name}👋
              </Text>
              <TouchableOpacity
                onPress={handleSignOut}
                className="justify-center items-center w-10 h-10 rounded-full bg-white"
              >
                <Image source={icons.out} className="w-4 h-4" />
              </TouchableOpacity>
            </View>

            <GoogleTextInput
              icon={icons.search}
              containerStyle="bg-white shadow-md shadow-neutral-300"
              handlePress={handleDestinationPress}
            />

            <>
              <View className="flex flex-row items-center justify-between mt-5 mb-3">
                <Text className="text-xl font-JakartaBold">
                  Your current location
                </Text>
                <TouchableOpacity
                  onPress={handleManualRefresh}
                  disabled={isLoadingLocation}
                  className="flex flex-row items-center justify-center bg-white px-3 py-2 rounded-full shadow-sm"
                >
                  {isLoadingLocation ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <EvilIcons className='mb-2' name="refresh" size={24} color="black" />
                  )}
                  <Text className="text-sm font-semibold">
                    {isLoadingLocation ? 'Updating...' : 'Refresh'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex flex-row items-center bg-transparent h-[300px]">
                {userAddress ? (
                  <Map />
                ) : (
                  <View className="flex-1 justify-center items-center rounded-lg">
                    {isLoadingLocation ? (
                      <>
                        <ActivityIndicator size="large" color="#000" />
                      </>
                    ) : (
                      <>
                        <Text className="text-sm text-gray-600 mb-2 font-semibold">Location not available</Text>
                        <TouchableOpacity
                          onPress={handleManualRefresh}
                          className="bg-black px-4 py-2 rounded-full"
                        >
                          <Text className="text-white text-sm font-semibold">Enable Location</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                )}
              </View>
            </>

            <Text className="text-xl font-JakartaBold mt-5 mb-3">
              Recent Rides
            </Text>
          </>
        }
      />
    </SafeAreaView>
  );
}