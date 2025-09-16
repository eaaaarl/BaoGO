import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PendingRideCard from "@/components/PendingRideCard"; // Import your new component
import { images } from "@/constant/image";
import { useAppSelector } from "@/libs/redux/hooks";

const pendingRequests = [
  {
    "ride_id": "pending_1",
    "origin_address": "Your Location",
    "destination_address": "SM Mall, Butuan City",
    "origin_latitude": "8.9477",
    "origin_longitude": "125.5436",
    "destination_latitude": "8.9500",
    "destination_longitude": "125.5400",
    "ride_time": 15,
    "fare_price": "120.00",
    "payment_status": "pending",
    "status": "waiting_for_driver",
    "user_id": "1",
    "created_at": new Date().toISOString(),
    "driver": {
      "driver_id": "1",
      "full_name": "Jhonn Rex Ado ",
      "profile_image_url": "",
      "car_image_url": "https://ucarecdn.com/a2dc52b2-8bf7-4e49-9a36-3ffb5229ed02/-/preview/465x466/",
      "car_seats": 4,
      "rating": "4.8"
    }
  }
]

const WaitingArea = () => {
  const { user } = useAppSelector((state) => state.auth);
  const loading = false;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        data={pendingRequests}
        renderItem={({ item }) => <PendingRideCard ride={item} />}
        keyExtractor={(item, index) => index.toString()}
        className="px-4"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 100,
        }}
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
                <Text className="text-gray-600 text-center mt-4">
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