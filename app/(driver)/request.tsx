import { useGetRiderRequestRideQuery } from '@/feature/driver/api/driverApi';
import { Ride } from '@/feature/driver/api/interface';
import { useAppSelector } from '@/libs/redux/hooks';
import React, { useState } from 'react';
import {
  FlatList,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Request() {
  const insets = useSafeAreaInsets();
  const currentUserId = useAppSelector((state) => state.auth.user?.id)
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

  const { data: getRiderRequestRide } = useGetRiderRequestRideQuery({ driverId: currentUserId as string })

  console.log('Data', JSON.stringify(getRiderRequestRide, null, 2))

  const handleAccept = (requestId: any) => {
    setActiveRequests(activeRequests.filter(req => req.id !== requestId));
    alert(`Request ${requestId} accepted! Redirecting to chat...`);
  };

  const handleDecline = (requestId: any) => {
    setActiveRequests(activeRequests.filter(req => req.id !== requestId));
  };

  const RequestCard = ({ ride }: { ride: Ride }) => (
    <View className="bg-white rounded-2xl p-4 my-4 shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
            <Text>{ride.driver.profile.full_name.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text className="text-lg font-semibold text-gray-800">{ride.driver.profile.full_name}</Text>
            {/* <Text className="text-sm text-gray-500">{request.requestTime}</Text> */}
          </View>
        </View>
        {/* <View className="items-end">
          <Text className="text-xl font-bold text-green-600">₱{request.estimatedFare}</Text>
          <Text className="text-sm text-gray-500">{request.distance}</Text>
        </View> */}
      </View>

      <View className="mb-4">
        <View className="flex-row items-start mb-2">
          <View className="w-3 h-3 bg-green-500 rounded-full mt-1.5 mr-3" />
          <View className="flex-1">
            <Text className="text-xs text-gray-500 mb-1">PICKUP</Text>
            <Text className="text-sm font-medium text-gray-800">{ride.pickup}</Text>
          </View>
        </View>
        <View className="flex-row items-start">
          <View className="w-3 h-3 bg-red-500 rounded-full mt-1.5 mr-3" />
          <View className="flex-1">
            <Text className="text-xs text-gray-500 mb-1">DESTINATION</Text>
            <Text className="text-sm font-medium text-gray-800">{ride.destination}</Text>
          </View>
        </View>
      </View>

      {/*  <View className="bg-gray-50 rounded-xl p-3 mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm text-gray-600 font-n">Seats needed</Text>
          <Text className="text-sm font-medium text-gray-800">4</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-sm text-gray-600">Payment</Text>
          <Text className="text-sm font-medium text-gray-800">{request.paymentMethod}</Text>
        </View> 
      </View> */}

      <View className="flex-row gap-x-3">
        <TouchableOpacity
          onPress={() => handleDecline(ride.id)}
          className="flex-1 bg-gray-100 py-3 px-4 rounded-xl"
        >
          <Text className="text-center font-semibold text-gray-700">Decline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleAccept(ride.id)}
          className="flex-1 bg-green-500 py-3 px-4 rounded-xl"
        >
          <Text className="text-center font-semibold text-white">Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50"
    >
      <FlatList
        data={getRiderRequestRide}
        renderItem={({ item }) => <RequestCard ride={item} />}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        className='px-4'
        ListHeaderComponent={
          <>
            <View
              className=""
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-semibold text-gray-900">
                  Ride Requests
                </Text>
                <View className="bg-blue-100 px-3 py-1 rounded-full">
                  <Text className="text-blue-600 font-semibold text-sm">
                    {getRiderRequestRide?.length} pending
                  </Text>
                </View>
              </View>
              <Text className="text-gray-500 mt-1">Accept rides to start earning</Text>
            </View>
          </>
        }
      />
    </SafeAreaView>
  );
}