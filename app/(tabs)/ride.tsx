import { ActivityIndicator, FlatList, Image, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PendingRideCard from "@/components/PendingRideCard";
import { images } from "@/constant/image";
import { useGetRequestRideQuery, useUpdateRequestRideMutation } from "@/feature/user/api/userApi";
import { useAppSelector } from "@/libs/redux/hooks";
import { useState } from "react";


const WaitingArea = () => {
  const { user } = useAppSelector((state) => state.auth);
  const loading = false;

  const [isRefreshing, setIsRefreshing] = useState(false)

  const { data, refetch } = useGetRequestRideQuery({ riderId: user?.id as string })
  const [updateRequestRide, { isLoading }] = useUpdateRequestRideMutation()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  const handleUpdateRequestRide = async (request_id: string) => {
    if (!request_id) return
    try {
      const res = await updateRequestRide({
        request_id: request_id,
        status: 'Cancel'
      })

      console.log(res)
    } catch (error) {
      console.log("Failed to update request ride", error)
    }
  }
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        data={data}
        renderItem={({ item }) => <PendingRideCard onSubmit={handleUpdateRequestRide} isLoading={isLoading} ride={item} />}
        keyExtractor={(item, index) => index.toString()}
        className="px-4"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center mt-20">
            {!loading ? (
              <>
                <Image
                  source={images.noResult}
                  className="w-40 h-40"
                  alt="No pending rides"
                  resizeMode="contain"
                />
                <Text className="text-gray-600 font-semibold text-center mt-4">
                  No pending ride requests
                </Text>
              </>
            ) : (
              <ActivityIndicator size="large" color="#f59e0b" />
            )}
          </View>
        )}
        ListHeaderComponent={
          <>
            <Text className="text-2xl font-JakartaBold my-5 px-1">
              Ride Requests
            </Text>
          </>
        }
      />
    </SafeAreaView>
  );
};

export default WaitingArea;