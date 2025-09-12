import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Home() {
  const [isOnline, setIsOnline] = useState(false);
  const insets = useSafeAreaInsets();

  // Mock data
  const driverStats = {
    todayEarnings: 850,
    todayTrips: 6,
  };

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
    }
  ];

  const TripCard = ({ trip }: { trip: any }) => (
    <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
      {/* Route */}
      <View className="flex-row items-center mb-3">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <View className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
            <Text className="text-sm text-gray-800 flex-1">{trip.from}</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2 h-2 bg-gray-400 rounded-full mr-3" />
            <Text className="text-sm text-gray-800 flex-1">{trip.to}</Text>
          </View>
        </View>
        {/* Small map placeholder */}
        <View className="w-16 h-16 bg-gray-100 rounded-xl items-center justify-center">
          <View className="w-8 h-1 bg-blue-500 rounded transform rotate-45" />
        </View>
      </View>

      {/* Trip Details */}
      <View className="border-t border-gray-100 pt-3">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm text-gray-500">Date & Time</Text>
          <Text className="text-sm font-medium text-gray-800">{trip.date}, {trip.time}</Text>
        </View>
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm text-gray-500">Rider</Text>
          <Text className="text-sm font-medium text-gray-800">{trip.rider}</Text>
        </View>
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm text-gray-500">Seats</Text>
          <Text className="text-sm font-medium text-gray-800">{trip.seats}</Text>
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
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header */}
      <View
        className="px-4 pt-4 pb-6"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-semibold text-gray-900">
            Welcome Driver Earl
          </Text>
          <TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
            <Ionicons name="refresh" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Online Status Toggle */}
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
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
              <Text className="text-sm text-gray-500">Today&apos;s Earnings</Text>
              <View className="bg-green-100 p-1.5 rounded-lg">
                <Ionicons name="wallet" size={16} color="#10B981" />
              </View>
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-1">₱{driverStats.todayEarnings}</Text>
            <Text className="text-xs text-gray-500">{driverStats.todayTrips} trips completed</Text>
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
            <Text className="text-2xl font-bold text-gray-800 mb-1">
              {isOnline ? "Online" : "Offline"}
            </Text>
            <Text className="text-xs text-gray-500">
              {isOnline ? "Available for rides" : "Not accepting rides"}
            </Text>
          </View>
        </View>
      </View>

      {/* Recent Rides */}
      <View className="px-4">
        <Text className="text-xl font-semibold text-gray-900 mb-4">Recent Rides</Text>

        {recentTrips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}

        {/* Empty State */}
        {recentTrips.length === 0 && (
          <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-100">
            <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
              <Ionicons name="car-outline" size={32} color="#9CA3AF" />
            </View>
            <Text className="text-gray-500 text-center font-medium">No rides yet</Text>
            <Text className="text-gray-400 text-sm text-center mt-1">
              Turn online to start receiving ride requests
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}