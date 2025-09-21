import { useGetProfileUserQuery } from '@/feature/auth/api/authApi';
import { useAppSelector } from '@/libs/redux/hooks';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Home() {
  const { user } = useAppSelector((state) => state.auth)
  const { data } = useGetProfileUserQuery(user?.id as string, { skip: !user?.id })
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    address: 'Getting location...',
    coordinates: { lat: 0, lng: 0 }
  });
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [totalRides, setTotalRides] = useState(0);
  const insets = useSafeAreaInsets();

  // Mock locations in Davao City
  const mockLocations = [
    {
      address: 'SM City Davao, J.P. Laurel Avenue, Davao City',
      coordinates: { lat: 7.0731, lng: 125.6128 }
    },
    {
      address: 'Abreeza Mall, J.P. Laurel Avenue, Davao City',
      coordinates: { lat: 7.0669, lng: 125.6101 }
    },
    {
      address: 'Victoria Plaza, R. Magsaysay Avenue, Davao City',
      coordinates: { lat: 7.0764, lng: 125.6147 }
    },
    {
      address: 'People\'s Park, Palma Gil Street, Davao City',
      coordinates: { lat: 7.0731, lng: 125.6128 }
    },
    {
      address: 'Roxas Avenue, Davao City Center',
      coordinates: { lat: 7.0731, lng: 125.6128 }
    }
  ];

  const recentTrips = [
    {
      id: 1,
      rider: 'John Doe',
      from: '1901 Thornridge Cir. Shiloh',
      to: '4140 Parker Rd. Allentown',
      fare: 250,
      date: '16 July 2025',
      time: '10:30 PM',
      seats: 4,
      status: 'Completed'
    },
    {
      id: 2,
      rider: 'Maria Santos',
      from: 'SM City Davao, J.P. Laurel Ave',
      to: 'Francisco Bangoy Airport',
      fare: 320,
      date: '15 July 2025',
      time: '2:15 PM',
      seats: 2,
      status: 'Completed'
    },
    {
      id: 3,
      rider: 'Carlos Rodriguez',
      from: 'Abreeza Mall, Davao City',
      to: 'University of Mindanao',
      fare: 180,
      date: '14 July 2025',
      time: '8:45 AM',
      seats: 3,
      status: 'Completed'
    }
  ];

  // Simulate getting user location
  useEffect(() => {
    const getLocation = () => {
      const randomLocation = mockLocations[Math.floor(Math.random() * mockLocations.length)];
      setCurrentLocation(randomLocation);
    };

    getLocation();
    // Update location every 30 seconds to simulate movement
    const locationInterval = setInterval(getLocation, 30000);

    return () => clearInterval(locationInterval);
  }, []);

  useEffect(() => {
    const todayTrips = recentTrips.filter(trip => trip.date === '16 July 2025');
    const earnings = todayTrips.reduce((sum, trip) => sum + trip.fare, 0);
    setTodayEarnings(earnings);
    setTotalRides(recentTrips.length);
  }, []);

  const handleLocationRefresh = () => {
    const randomLocation = mockLocations[Math.floor(Math.random() * mockLocations.length)];
    setCurrentLocation(randomLocation);
    Alert.alert('Location Updated', 'Your current location has been refreshed.');
  };

  const renderTripCard = ({ item: trip }: { item: any }) => (
    <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4 mx-4">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
            <Text className="text-xs font-semibold text-blue-600">{trip.rider.split(' ').map(n => n[0]).join('')}</Text>
          </View>
          <Text className="text-sm font-semibold text-gray-800">{trip.rider}</Text>
        </View>
        <View className={`px-2 py-1 rounded-full ${trip.status === 'Completed' ? 'bg-green-100' : 'bg-yellow-100'}`}>
          <Text className={`text-xs font-medium ${trip.status === 'Completed' ? 'text-green-700' : 'text-yellow-700'}`}>
            {trip.status}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mb-3">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <View className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
            <Text className="text-sm text-gray-800 flex-1">{trip.from}</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2 h-2 bg-red-500 rounded-full mr-3" />
            <Text className="text-sm text-gray-800 flex-1">{trip.to}</Text>
          </View>
        </View>
        <View className="w-16 h-16 bg-gray-100 rounded-xl items-center justify-center">
          <Ionicons name="car" size={24} color="#6B7280" />
        </View>
      </View>

      <View className="border-t border-gray-100 pt-3">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm text-gray-500">Date & Time</Text>
          <Text className="text-sm font-medium text-gray-800">{trip.date}, {trip.time}</Text>
        </View>
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm text-gray-500">Seats</Text>
          <Text className="text-sm font-medium text-gray-800">{trip.seats} passengers</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-sm text-gray-500">Earnings</Text>
          <Text className="text-sm font-semibold text-green-600">₱{trip.fare}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      showsVerticalScrollIndicator={false}
    >
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
          <TouchableOpacity
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            onPress={handleLocationRefresh}
          >
            <Ionicons name="refresh" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Current Location Card */}
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Ionicons name="location" size={20} color="#3B82F6" />
              <Text className="text-lg font-semibold text-gray-800 ml-2">Current Location</Text>
            </View>
            <TouchableOpacity onPress={handleLocationRefresh}>
              <Ionicons name="refresh" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <Text className="text-sm text-gray-600 leading-5">
            {currentLocation.address}
          </Text>
          <View className="flex-row items-center mt-2">
            <Text className="text-xs text-gray-400">
              Lat: {currentLocation.coordinates.lat.toFixed(4)},
              Lng: {currentLocation.coordinates.lng.toFixed(4)}
            </Text>
          </View>
        </View>

        {/* Online Status Toggle */}
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <View className={`w-3 h-3 rounded-full mr-3 ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
              <Text className="text-lg font-semibold text-gray-800">
                {isOnline ? 'You\'re Online' : 'You\'re Offline'}
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: '#E5E7EB', true: '#10B981' }}
              thumbColor="#ffffff"
            />
          </View>
          <Text className="text-sm text-gray-500">
            {isOnline
              ? 'Ready to receive ride requests'
              : 'Turn on to start earning'
            }
          </Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View className="px-4 mb-6">
        <View className="flex-row gap-x-3">

          <View className="bg-white flex-1 p-4 rounded-2xl shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-gray-500">Total Rides</Text>
              <View className="p-1.5 rounded-lg bg-blue-100">
                <Ionicons name="car-sport" size={16} color="#3B82F6" />
              </View>
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-1">{totalRides}</Text>
            <Text className="text-xs text-gray-500">
              Completed rides
            </Text>
          </View>

          <View className="bg-white flex-1 p-4 rounded-2xl shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-gray-500">Status</Text>
              <View className={`p-1.5 rounded-lg ${isOnline ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Ionicons
                  name={isOnline ? "checkmark-circle" : "pause-circle"}
                  size={16}
                  color={isOnline ? "#10B981" : "#6B7280"}
                />
              </View>
            </View>
            <Text className="text-lg font-bold text-gray-800 mb-1">
              {isOnline ? "Online" : "Offline"}
            </Text>
            <Text className="text-xs text-gray-500">
              {isOnline ? "Available" : "Not accepting"}
            </Text>
          </View>
        </View>
      </View>

      <View className="pb-6">
        <View className="flex-row items-center justify-between mb-4 px-4">
          <Text className="text-xl font-semibold text-gray-900">Recent Rides</Text>
          <TouchableOpacity>
            <Text className="text-sm text-blue-600 font-medium">View All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={recentTrips}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTripCard}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          ListEmptyComponent={() => (
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-100 mx-4">
              <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="car-outline" size={32} color="#9CA3AF" />
              </View>
              <Text className="text-gray-500 text-center font-medium">No rides yet</Text>
              <Text className="text-gray-400 text-sm text-center mt-1">
                Turn online to start receiving ride requests
              </Text>
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
}