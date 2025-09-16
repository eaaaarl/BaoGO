import { images } from "@/constant/image";
import { Ride } from "@/feature/user/api/interface";
import { Image, Text, TouchableOpacity, View } from "react-native";

const PendingRideCard = ({ ride }: { ride: Ride }) => {
  return (
    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-center mb-3">
        <View className="bg-orange-100 px-3 py-1 rounded-full">
          <Text className="text-orange-600 text-xs font-semibold">
            Waiting for Driver Response
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
          <Text className="text-gray-500 text-xs">{ride.status}...</Text>
        </View>
      </View>

      {ride.driver && (
        <View className="flex-row items-center mb-4 p-3 bg-gray-50 rounded-lg">
          <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mr-3">
            <Text className="text-white font-semibold text-lg">
              {ride.driver.profile.full_name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View className="flex-1">
            <Text className="font-JakartaSemiBold text-gray-800">
              {ride.driver.profile.full_name}
            </Text>
          </View>
          <Image
            source={images.baobao2}
            className="w-16 h-12 rounded-lg"
          />
        </View>
      )}

      <View className="mb-4">
        <View className="flex-row items-center mb-2">
          <View className="w-3 h-3 bg-green-500 rounded-full mr-3" />
          <View className="flex-1">
            <Text className="text-gray-500 text-xs font-Jakarta">From</Text>
            <Text className="text-gray-800 font-semibold" numberOfLines={1}>
              {ride.pickup}
            </Text>
          </View>
        </View>

        <View className="ml-1.5 w-px h-6 border-l border-dashed border-gray-300" />

        <View className="flex-row items-center">
          <View className="w-3 h-3 bg-red-500 rounded-full mr-3" />
          <View className="flex-1">
            <Text className="text-gray-500 text-xs font-Jakarta">To</Text>
            <Text className="text-gray-800 font-semibold" numberOfLines={1}>
              {ride.destination}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        className="bg-red-50 border border-red-200 rounded-lg p-3"
        onPress={() => {
          console.log('Cancel ride:', ride.ride_id);
        }}
      >
        <Text className="text-red-600 text-center font-JakartaSemiBold">
          Cancel Ride Request
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default PendingRideCard;