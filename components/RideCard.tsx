import { icons } from "@/constant/image";
import { Ride } from "@/feature/ride/api/interface";
import { formatDate } from "@/libs/utils";
import { Image, Text, View } from "react-native";

const getStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        text: 'Completed'
      };
    case 'pending':
      return {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        text: 'Pending'
      };
    case 'started':
    case 'in_progress':
      return {
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        text: 'In Progress'
      };
    case 'cancelled':
    case 'canceled':
      return {
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        text: 'Cancelled'
      };
    case 'assigned':
      return {
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-800',
        text: 'Assigned'
      };
    default:
      return {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        text: status
      };
  }
};

const RideCard = ({ ride }: { ride: Ride }) => {
  const statusConfig = getStatusConfig(ride.status);

  return (
    <View className="flex flex-row items-center justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 mb-3">
      <View className="flex flex-col items-start justify-center p-3 w-full">
        <View className="flex flex-row justify-between items-center w-full mb-3">
          <View className={`px-3 py-1 rounded-full ${statusConfig.bgColor}`}>
            <Text className={`text-xs font-semibold ${statusConfig.textColor}`}>
              {statusConfig.text}
            </Text>
          </View>
          <Text className="text-xs text-gray-400">
            #{ride.id.slice(-6)}
          </Text>
        </View>

        <View className="flex flex-row items-center justify-between w-full">
          <Image
            source={{
              uri: `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${ride.destination_longitude},${ride.destination_latitude}&zoom=10&marker=lonlat:${ride.pickup_longitude},${ride.pickup_latitude};color:red;size:large&marker=lonlat:${ride.destination_longitude},${ride.destination_latitude};color:green;size:large&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`,
            }}
            className="w-[80px] h-[90px] rounded-lg"
          />
          <View className="flex flex-col mx-5 gap-y-5 flex-1">
            <View className="flex flex-row items-center gap-x-2">
              <Image source={icons.to} className="w-5 h-5" />
              <Text className="text-md font-medium" numberOfLines={1}>
                {ride.pickup_location}
              </Text>
            </View>
            <View className="flex flex-row items-center gap-x-2">
              <Image source={icons.point} className="w-5 h-5" />
              <Text className="text-md font-medium" numberOfLines={1}>
                {ride.destination_location}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex flex-col w-full mt-5 bg-general-500 rounded-lg p-3 items-start justify-center">
          <View className="flex flex-row items-center w-full justify-between mb-5">
            <Text className="text-md font-medium text-gray-500">
              Date & Time
            </Text>
            <Text className="text-md font-semibold" numberOfLines={1}>
              {formatDate(ride.started_at)}
            </Text>
          </View>
          <View className="flex flex-row items-center w-full justify-between mb-5">
            <Text className="text-md font-medium text-gray-500">
              Driver
            </Text>
            <Text className="text-md font-semibold">
              {ride.driver.profiles.full_name}
            </Text>
          </View>
          <View className="flex flex-row items-center w-full justify-between mb-5">
            <Text className="text-md font-medium text-gray-500">
              Bao-bao Seats
            </Text>
            <Text className="text-md font-JakartaBold">
              4
            </Text>
          </View>
          {ride.status === 'completed' && ride.completed_at && (
            <View className="flex flex-row items-center w-full justify-between mb-5">
              <Text className="text-md font-medium text-gray-500">
                Completed At
              </Text>
              <Text className="text-sm font-medium">
                {formatDate(ride.completed_at)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default RideCard;