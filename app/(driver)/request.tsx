import { images } from '@/constant/image';
import { useAcceptRiderRequestRideMutation, useDeclineRiderRequestRideMutation, useGetRiderRequestRideQuery } from '@/feature/driver/api/driverApi';
import { Ride } from '@/feature/driver/api/interface';
import { useCreateChatRoomMutation } from '@/feature/message/api/messageApi';
import { useCreateRidesMutation } from '@/feature/ride/api/rideApi';
import { useAppSelector } from '@/libs/redux/hooks';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Request() {
  const currentUserId = useAppSelector((state) => state.auth.user?.id)
  const [refreshing, setRefreshing] = useState(false);

  const { data: getRiderRequestRide, refetch } = useGetRiderRequestRideQuery({
    driverId: currentUserId as string
  });

  const [declineRiderRequest, { isLoading: declineRiderRequestLoading }] = useDeclineRiderRequestRideMutation()
  const [acceptRiderRequest, { isLoading: acceptRiderRequestLoading }] = useAcceptRiderRequestRideMutation()
  const [createChatRoom, { isLoading: createChatRoomLoading }] = useCreateChatRoomMutation()
  const [createRides, { isLoading: createRidesLoading }] = useCreateRidesMutation()

  console.log('getRiderRequestRide', getRiderRequestRide)

  const handleAccept = (ride: Ride) => {
    Alert.alert(
      "Accept Ride Request",
      "Are you sure you want to accept this ride request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: () => confirmAccept(ride)
        },
      ]
    );
  };

  const confirmAccept = async (ride: Ride) => {
    try {

      const result = await acceptRiderRequest({
        requestId: ride.id,
        driverId: currentUserId as string
      }).unwrap();

      if (result.error) {
        console.error("Accept error:", result.error);
        Alert.alert(
          "Error",
          result.error.message || "Failed to accept ride request"
        );
      } else if (result?.success) {


        const responseChatRoom = await createChatRoom({
          driverId: currentUserId as string,
          riderId: ride.rider_id,
        })

        const chatRoomId = responseChatRoom.data?.id
        console.log('creating a chat rooms', responseChatRoom)

        await createRides({
          chat_room_id: chatRoomId,
          destination_latitude: ride.destination_latitude,
          destination_location: ride.destination,
          destination_longitude: ride.destination_longitude,
          driver_id: ride.driver_id,
          pickup_latitude: ride.pickup_latitude,
          pickup_location: ride.pickup,
          pickup_longitude: ride.pickup_longitude,
          rider_id: ride.rider_id,
          status: 'accepted',
          accepted_at: new Date()
        }).unwrap()

        router.push({
          pathname: '/(driver)/chat'
        })

      }
    } catch (error) {
      console.error("Error in confirmAccept:", error);
    }
  }

  const handleDecline = (requestId: string) => {
    Alert.alert(
      "Decline Ride Request",
      "Are you sure you want to decline this ride request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: () => confirmDecline(requestId),
        },
      ]
    );
  };

  const confirmDecline = async (requestId: string) => {
    try {
      const result = await declineRiderRequest({ requestId }).unwrap();

      if (result.error) {
        console.error("Decline error:", result.error);
        Alert.alert(
          "Error",
          result.error.message || "Failed to decline ride request"
        );
      } else {
        console.log("Request declined successfully");
        //Alert.alert("Success", "Ride request declined");
      }
    } catch (error) {
      console.error("Error in confirmDecline:", error);
      //Alert.alert("Error", "Something went wrong");
    }
  };


  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const RequestCard = ({ ride }: { ride: Ride }) => (
    <View className="bg-white rounded-2xl p-4 my-2 shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
            <Text className="text-blue-600 font-semibold text-lg">
              {ride.driver.profile.full_name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text className="text-lg font-semibold text-gray-800">
              {ride.driver.profile.full_name}
            </Text>
          </View>
        </View>
      </View>

      <View className="mb-4">
        <View className="flex-row items-start mb-3">
          <View className="w-3 h-3 bg-green-500 rounded-full mt-1.5 mr-3" />
          <View className="flex-1">
            <Text className="text-xs text-gray-500 mb-1 font-medium">PICKUP</Text>
            <Text className="text-sm font-medium text-gray-800">{ride.pickup}</Text>
          </View>
        </View>
        <View className="flex-row items-start">
          <View className="w-3 h-3 bg-red-500 rounded-full mt-1.5 mr-3" />
          <View className="flex-1">
            <Text className="text-xs text-gray-500 mb-1 font-medium">DESTINATION</Text>
            <Text className="text-sm font-medium text-gray-800">{ride.destination}</Text>
          </View>
        </View>
      </View>

      <View className="flex-row gap-x-3">
        <TouchableOpacity
          onPress={() => handleDecline(ride.id)}
          className="flex-1 bg-gray-100 py-3 px-4 rounded-xl"
          disabled={acceptRiderRequestLoading}
        >
          <Text className="text-center font-semibold text-gray-700">Decline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleAccept(ride)}
          className="flex-1 bg-green-500 py-3 px-4 rounded-xl"
          disabled={declineRiderRequestLoading}
        >
          <Text className="text-center font-semibold text-white">Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const EmptyState = () => (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
        <Image source={images.baobao2} resizeMode='contain' className="w-full h-ull" />
      </View>

      <Text className="text-xl font-semibold text-gray-800 text-center mb-2">
        No ride requests yet
      </Text>

      <Text className="text-gray-500 text-center mb-8 leading-6">
        Stay online and ready to receive ride requests from passengers in your area.
      </Text>

      <View className="w-full gap-3">
        <TouchableOpacity
          onPress={onRefresh}
          className="bg-blue-500 py-4 px-6 rounded-xl w-full"
        >
          <Text className="text-white font-semibold text-center text-base">
            Refresh Requests
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-gray-100 py-4 px-6 rounded-xl w-full">
          <Text className="text-gray-700 font-semibold text-center text-base">
            Go Online
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );

  const LoadingOverlay = () => (
    <View className="absolute inset-0 bg-black/20 flex-1 justify-center items-center z-50">
      <View className="bg-white rounded-2xl p-4 mx-8 items-center shadow-lg">
        <ActivityIndicator size="large" color="#0286FF" />
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        data={getRiderRequestRide}
        renderItem={({ item }) => <RequestCard ride={item} />}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        className="px-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
        ListHeaderComponent={
          <View className="mb-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl font-semibold text-gray-900">
                Ride Requests
              </Text>
            </View>
            <Text className="text-gray-500 mt-1">Accept rides to start earning</Text>
          </View>
        }
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={
          !getRiderRequestRide?.length ? { flex: 1 } : undefined
        }
      />

      {createChatRoomLoading && <LoadingOverlay />}
    </SafeAreaView>
  );
}