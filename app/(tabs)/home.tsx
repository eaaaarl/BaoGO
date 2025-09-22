import GoogleTextInput from '@/components/GoogleTextInput';
import Map from '@/components/Map';
import RideCard from '@/components/RideCard';
import { icons, images } from '@/constant/image';
import { useGetProfileUserQuery } from '@/feature/auth/api/authApi';
import { useGetRecentRidesQuery } from '@/feature/ride/api/rideApi';
import { useAppDispatch, useAppSelector } from '@/libs/redux/hooks';
import { clearSelectedDriver } from '@/libs/redux/state/driverSlice';
import { clearLocation, setDestinationLocation, setUserLocation } from '@/libs/redux/state/locationSlice';
import { supabase } from '@/libs/supabase';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function Index() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { userAddress } = useAppSelector((state) => state.location);

  const [hasPermission, setHasPermission] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const loading = false;
  const { data: profileUser, isLoading: profileUserLoading, refetch: profileUserRefetch } = useGetProfileUserQuery(user?.id as string);
  const { data: recentsRides, isLoading: recentsRideLoading, refetch: recentsRideRefetch } = useGetRecentRidesQuery({
    currentUserId: user?.id as string,
    userRole: 'Rider'
  })


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
        address: address[0]?.street || address[0]?.city || address[0]?.name || 'Unknown location'
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
    await profileUserRefetch()
    await recentsRideRefetch()
    setTimeout(() => setIsRefreshing(false), 500);
  }, [getCurrentLocation, profileUserRefetch, recentsRideRefetch]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    dispatch(clearSelectedDriver());
    dispatch(clearLocation());
    router.replace('/(auth)/welcome');
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
        data={recentsRides?.rides}
        renderItem={({ item }) => <RideCard ride={item} />}
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
              <Text className="text-2xl font-semibold">
                Welcome {profileUser?.full_name}
              </Text>
              <TouchableOpacity
                onPress={handleSignOut}
                className="justify-center items-center w-12 h-12 rounded-full bg-white"
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
                <Text className="text-xl font-semibold">
                  Your current location
                </Text>
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

      {profileUserLoading || recentsRideLoading && (<LoadingOverlay />)}
    </SafeAreaView>
  );
}

function LoadingOverlay() {
  return (
    <View className="absolute inset-0 bg-black/5 flex-1 justify-center items-center z-50">
      <View className="bg-white rounded-2xl p-4 mx-8 items-center shadow-lg">
        <ActivityIndicator size="large" color="#0286FF" />
      </View>
    </View>
  )
}