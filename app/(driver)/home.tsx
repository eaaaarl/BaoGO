import { images } from '@/constant/image';
import { useGetProfileUserQuery } from '@/feature/auth/api/authApi';
import { useGetIsAvailableStatusQuery, useToggleStatusMutation } from '@/feature/driver/api/driverApi';
import { Ride } from '@/feature/ride/api/interface';
import { useGetRecentRidesQuery } from '@/feature/ride/api/rideApi';
import { useAppSelector } from '@/libs/redux/hooks';
import { formatDate } from '@/libs/utils';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface LocationState {
  latitude: string;
  longitude: string;
  address: string;
}

export default function Home() {
  const { user } = useAppSelector((state) => state.auth);
  const { data, isLoading: profileLoading, refetch: profileRefetch } = useGetProfileUserQuery(user?.id as string, {
    skip: !user?.id
  });

  // Remove the local isOnline state - we'll use isAvailable from API
  const insets = useSafeAreaInsets();
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [myLocation, setMyLocation] = useState<LocationState>({
    latitude: '',
    longitude: '',
    address: ''
  });
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const refreshTimeoutRef = useRef<number | null>(null);
  const isRefreshingRef = useRef(false);

  const { data: recentsRide, isLoading: recentsRideLoading, refetch: recentsRideRefetch } = useGetRecentRidesQuery({
    currentUserId: user?.id as string,
    userRole: 'Driver'
  }, {
    skip: !user?.id
  });

  const { data: availabilityData, isLoading: isAvailableLoading, refetch: refetchAvailableStatus } = useGetIsAvailableStatusQuery({
    driver_id: user?.id as string
  }, {
    skip: !user?.id
  });

  // Extract the boolean value from the API response
  const isAvailable = availabilityData?.is_available || false;

  const [toggleStatus, { isLoading: toggleStatusLoading }] = useToggleStatusMutation();

  const handleToggleStatus = async (value: boolean) => {
    try {
      await toggleStatus({
        driver_id: user?.id as string,
        is_available: value
      }).unwrap();

      console.log(`Status changed to: ${value ? 'online' : 'offline'}`);

    } catch (error) {
      console.error('Toggle status error:', error);
      Alert.alert(
        'Connection Issue',
        'Could not update your status. Please check your internet connection.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
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
            {
              text: 'Open Settings',
              onPress: () => Location.requestForegroundPermissionsAsync()
            }
          ]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const formattedAddress = [
        address.city,
        address.subregion,
        address.country
      ].filter(Boolean).join(', ');

      setMyLocation({
        address: formattedAddress,
        latitude: String(location.coords.latitude),
        longitude: String(location.coords.longitude)
      });

    } catch (error) {
      console.log('Location error:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please try again or check your location settings.'
      );
    } finally {
      setIsLoadingLocation(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      getCurrentLocation();
    }
  }, [user, getCurrentLocation]);

  const completedRides = recentsRide?.rides?.filter((r) => r.status === 'completed')?.length || 0;

  const renderTripCard = ({ item: trip }: { item: Ride }) => {
    const name = trip.rider?.full_name?.split(' ') || [];
    const initials = name.map((n) => n.charAt(0)).join('').slice(0, 2);

    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'completed':
          return { bg: 'bg-green-100', text: 'text-green-700' };
        case 'cancelled':
          return { bg: 'bg-red-100', text: 'text-red-700' };
        default:
          return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
      }
    };

    const statusColors = getStatusColor(trip.status);

    return (
      <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4 mx-4">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
              <Text className="text-xs font-semibold text-blue-600">{initials}</Text>
            </View>
            <Text className="text-sm font-semibold text-gray-800">
              {trip?.rider?.full_name || 'Unknown Rider'}
            </Text>
          </View>
          <View className={`px-2 py-1 rounded-full ${statusColors.bg}`}>
            <Text className={`text-xs font-medium ${statusColors.text}`}>
              {trip.status}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center mb-3">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-2">
              <View className="w-2 h-2 bg-green-500 rounded-full mr-3" />
              <Text
                className="text-sm text-gray-800 flex-1"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {trip.pickup_location || 'Unknown pickup location'}
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-red-500 rounded-full mr-3" />
              <Text
                className="text-sm text-gray-800 flex-1"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {trip.destination_location || 'Unknown destination'}
              </Text>
            </View>
          </View>

          {trip.destination_longitude && trip.destination_latitude && (
            <View className="w-16 h-16 bg-gray-100 rounded-xl items-center justify-center overflow-hidden">
              <Image
                source={{
                  uri: `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${trip.destination_longitude},${trip.destination_latitude}&zoom=10&marker=lonlat:${trip.pickup_longitude},${trip.pickup_latitude};color:red;size:large&marker=lonlat:${trip.destination_longitude},${trip.destination_latitude};color:green;size:large&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`,
                }}
                className="w-full h-full rounded-xl"
                resizeMode="cover"
              />
            </View>
          )}
        </View>

        <View className="border-t border-gray-100 pt-3">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm text-gray-500">Date & Time</Text>
            <Text className="text-sm font-medium text-gray-800">
              {trip.completed_at ? formatDate(trip.completed_at) : 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const OverlayLoading = () => (
    <View className="absolute inset-0 bg-black/5 flex-1 justify-center items-center z-50">
      <View className="bg-white rounded-2xl p-4 mx-8 items-center shadow-lg">
        <ActivityIndicator size="large" color="#0286FF" />
      </View>
    </View>
  );

  const handleRefresh = useCallback(async () => {
    // Prevent multiple simultaneous refreshes
    if (isRefreshingRef.current) {
      return;
    }

    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    isRefreshingRef.current = true;
    setIsRefreshing(true);

    try {
      // Run all refresh operations in parallel for better performance
      await Promise.all([
        profileRefetch(),
        recentsRideRefetch(),
        refetchAvailableStatus(),
        getCurrentLocation()
      ]);
    } catch (error) {
      console.log('Refresh error:', error);
      // Optionally show an error message to user
      Alert.alert(
        'Refresh Failed',
        'Unable to refresh data. Please check your connection and try again.'
      );
    } finally {
      // Add a small delay to prevent immediate re-triggering
      refreshTimeoutRef.current = setTimeout(() => {
        setIsRefreshing(false);
        isRefreshingRef.current = false;
      }, 500); // 500ms delay
    }
  }, [profileRefetch, recentsRideRefetch, refetchAvailableStatus, getCurrentLocation]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const isLoading = profileLoading || recentsRideLoading || isLoadingLocation || isAvailableLoading;

  return (
    <View>
      <FlatList
        data={recentsRide?.rides || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTripCard}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        }
        ListHeaderComponent={
          <>
            <View
              className="px-4 pt-4 pb-6"
              style={{ paddingTop: insets.top + 16 }}
            >
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
                    <Text className="text-lg font-bold text-blue-600">
                      {data?.full_name ? data.full_name.charAt(0).toUpperCase() : 'U'}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-xl font-semibold text-gray-900">
                      {data?.full_name || 'User'}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      Have a great day on the road!
                    </Text>
                  </View>
                </View>
              </View>

              <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <Ionicons name="location" size={20} color="#3B82F6" />
                    <Text className="text-lg font-semibold text-gray-800 ml-2">Current Location</Text>
                  </View>
                </View>
                <Text className="text-sm text-gray-600 leading-5">
                  {isLoadingLocation ? 'Getting location...' : myLocation.address || 'Location not available'}
                </Text>
                {myLocation.latitude && myLocation.longitude && (
                  <View className="flex-row items-center mt-2">
                    <Text className="text-xs text-gray-400">
                      Lat: {myLocation.latitude}, Lng: {myLocation.longitude}
                    </Text>
                  </View>
                )}
              </View>

              <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <View className={`w-3 h-3 rounded-full mr-3 ${isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <Text className="text-lg font-semibold text-gray-800">
                      {isAvailable ? 'You\'re Online' : 'You\'re Offline'}
                    </Text>

                    {isAvailableLoading && !availabilityData && (
                      <ActivityIndicator
                        size="small"
                        color="#3B82F6"
                        style={{ marginLeft: 8 }}
                      />
                    )}
                  </View>

                  <Switch
                    value={isAvailable}
                    onValueChange={handleToggleStatus}
                    trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                    thumbColor="#ffffff"
                    disabled={isAvailableLoading && !availabilityData}
                  />
                </View>

                <Text className="text-sm text-gray-500">
                  {isAvailable
                    ? 'Ready to receive ride requests'
                    : 'Turn on to start earning'
                  }
                </Text>
              </View>
            </View>

            <View className="px-4 mb-6">
              <View className="flex-row gap-x-3">
                <View className="bg-white flex-1 p-4 rounded-2xl shadow-sm border border-gray-100">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm text-gray-500">Total Rides</Text>
                    <View className="rounded-lg">
                      <Image source={images.baobao2} resizeMode='contain' className='w-9 h-9' />
                    </View>
                  </View>
                  <Text className="text-2xl font-bold text-gray-800 mb-1">{completedRides}</Text>
                  <Text className="text-xs text-gray-500">
                    Completed rides
                  </Text>
                </View>

                <View className="bg-white flex-1 p-4 rounded-2xl shadow-sm border border-gray-100">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm text-gray-500">Status</Text>
                    <View className={`p-1.5 rounded-lg ${isAvailable ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Ionicons
                        name={isAvailable ? "checkmark-circle" : "pause-circle"}
                        size={16}
                        color={isAvailable ? "#10B981" : "#6B7280"}
                      />
                    </View>
                  </View>
                  <Text className="text-lg font-bold text-gray-800 mb-1">
                    {isAvailable ? "Online" : "Offline"}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {isAvailable ? "Available" : "Not accepting"}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row items-center justify-between mb-4 px-4">
              <Text className="text-xl font-semibold text-gray-900">Recent Rides</Text>
              <TouchableOpacity>
                <Text className="text-sm text-blue-600 font-medium">View All</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={() => (
          <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-100 mx-4">
            <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
              <Ionicons name="car-outline" size={32} color="#9CA3AF" />
            </View>
            <Text className="text-gray-500 text-center font-medium">No rides yet</Text>
            <Text className="text-gray-400 text-center mt-1">
              Turn online to start receiving ride requests
            </Text>
          </View>
        )}
      />
      {isLoading && <OverlayLoading />}
    </View>
  );
}