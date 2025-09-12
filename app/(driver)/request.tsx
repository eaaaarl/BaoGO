import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Request() {
  const insets = useSafeAreaInsets();
  const [activeRequests, setActiveRequests] = useState([
    {
      id: 1,
      rider: 'John Doe',
      from: '1901 Thornridge Cir. Shiloh',
      to: '4140 Parker Rd. Allentown',
      distance: '12.5 km',
      estimatedFare: 250,
      requestTime: '2 min ago',
      seats: 2,
      paymentMethod: 'Cash',
      riderPhone: '+63 912 345 6789'
    },
    {
      id: 2,
      rider: 'Maria Santos',
      from: 'SM City Davao, J.P. Laurel Ave',
      to: 'Francisco Bangoy Airport',
      distance: '8.2 km',
      estimatedFare: 320,
      requestTime: '5 min ago',
      seats: 1,
      paymentMethod: 'GCash',
      riderPhone: '+63 998 765 4321'
    },
    {
      id: 3,
      rider: 'Carlos Rivera',
      from: 'Ayala Center Cebu',
      to: 'University of San Carlos',
      distance: '15.1 km',
      estimatedFare: 180,
      requestTime: '8 min ago',
      seats: 3,
      paymentMethod: 'Cash',
      riderPhone: '+63 917 888 9999'
    }
  ]);

  const handleAccept = (requestId: any) => {
    setActiveRequests(activeRequests.filter(req => req.id !== requestId));
    // Navigate to chat or ride details
    alert(`Request ${requestId} accepted! Redirecting to chat...`);
  };

  const handleDecline = (requestId: any) => {
    setActiveRequests(activeRequests.filter(req => req.id !== requestId));
  };

  const RequestCard = ({ request }: { request: any }) => (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
            <Ionicons name="person" size={20} color="#0286FF" />
          </View>
          <View>
            <Text className="text-lg font-semibold text-gray-800">{request.rider}</Text>
            <Text className="text-sm text-gray-500">{request.requestTime}</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-xl font-bold text-green-600">₱{request.estimatedFare}</Text>
          <Text className="text-sm text-gray-500">{request.distance}</Text>
        </View>
      </View>

      {/* Route */}
      <View className="mb-4">
        <View className="flex-row items-start mb-2">
          <View className="w-3 h-3 bg-green-500 rounded-full mt-1.5 mr-3" />
          <View className="flex-1">
            <Text className="text-xs text-gray-500 mb-1">PICKUP</Text>
            <Text className="text-sm font-medium text-gray-800">{request.from}</Text>
          </View>
        </View>
        <View className="flex-row items-start">
          <View className="w-3 h-3 bg-red-500 rounded-full mt-1.5 mr-3" />
          <View className="flex-1">
            <Text className="text-xs text-gray-500 mb-1">DESTINATION</Text>
            <Text className="text-sm font-medium text-gray-800">{request.to}</Text>
          </View>
        </View>
      </View>

      {/* Trip Details */}
      <View className="bg-gray-50 rounded-xl p-3 mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm text-gray-600">Seats needed</Text>
          <Text className="text-sm font-medium text-gray-800">{request.seats}</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-sm text-gray-600">Payment</Text>
          <Text className="text-sm font-medium text-gray-800">{request.paymentMethod}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-x-3">
        <TouchableOpacity
          onPress={() => handleDecline(request.id)}
          className="flex-1 bg-gray-100 py-3 px-4 rounded-xl"
        >
          <Text className="text-center font-semibold text-gray-700">Decline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleAccept(request.id)}
          className="flex-1 bg-green-500 py-3 px-4 rounded-xl"
        >
          <Text className="text-center font-semibold text-white">Accept</Text>
        </TouchableOpacity>
      </View>

      {/* Contact Button */}
      <TouchableOpacity className="mt-3 flex-row items-center justify-center py-2">
        <Ionicons name="call" size={16} color="#0286FF" />
        <Text className="text-blue-600 font-medium ml-2">Call Rider</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header */}
      <View
        className="px-4 pt-4 pb-6 bg-white border-b border-gray-100"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-semibold text-gray-900">
            Ride Requests
          </Text>
          <View className="bg-blue-100 px-3 py-1 rounded-full">
            <Text className="text-blue-600 font-semibold text-sm">
              {activeRequests.length} pending
            </Text>
          </View>
        </View>
        <Text className="text-gray-500 mt-1">Accept rides to start earning</Text>
      </View>

      {/* Requests List */}
      <View className="px-4 pt-4">
        {activeRequests.length > 0 ? (
          activeRequests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))
        ) : (
          // Empty State
          <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-100 mt-8">
            <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="car-outline" size={32} color="#9CA3AF" />
            </View>
            <Text className="text-gray-500 text-center font-semibold text-lg mb-2">
              No ride requests
            </Text>
            <Text className="text-gray-400 text-sm text-center">
              Make sure you&apos;re online to receive ride requests
            </Text>

            {/* Go Online Button */}
            <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-xl mt-4">
              <Text className="text-white font-semibold">Go Online</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Tips Section */}
      {activeRequests.length > 0 && (
        <View className="px-4 mt-4">
          <View className="bg-blue-50 rounded-xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="bulb" size={20} color="#0286FF" />
              <Text className="text-blue-800 font-semibold ml-2">Tips</Text>
            </View>
            <Text className="text-blue-700 text-sm">
              • Accept requests quickly for better rider experience
              {'\n'}• Call rider if pickup location is unclear
              {'\n'}• Confirm payment method before starting trip
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}