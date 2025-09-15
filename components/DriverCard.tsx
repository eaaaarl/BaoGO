import { images } from "@/constant/image";
import { AvailableDriver } from "@/feature/user/api/interface";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface DriverCardProps {
  item: AvailableDriver;
  selected: string;
  setSelected: () => void;
}

const DriverCard = ({ item, selected, setSelected }: DriverCardProps) => {
  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <TouchableOpacity
      onPress={setSelected}
      className={`${selected === item.id ? "bg-general-600" : "bg-white"
        } flex flex-row items-center justify-between py-5 px-3 rounded-xl ${!item.is_available ? "opacity-60" : ""
        }`}
      disabled={!item.is_available}
    >
      {item.profiles?.avatar_url ? (
        <Image
          source={{ uri: item.profiles.avatar_url }}
          className="w-14 h-14 rounded-full"
        />
      ) : (
        <View className="w-14 h-14 rounded-full bg-general-400 flex items-center justify-center">
          <Text className="text-xl font-semibold text-white">
            {getInitial(item.profiles?.full_name || "")}
          </Text>
        </View>
      )}

      <View className="flex-1 flex flex-col items-start justify-center mx-3">
        <View className="flex flex-row items-center justify-start mb-1">
          <Text className="text-lg font-semibold">
            {item.profiles?.full_name || "Unknown Driver"}
          </Text>

          {/*  <View className="flex flex-row items-center space-x-1 ml-2">
            <Image source={icons.star} className="w-3.5 h-3.5" />
            <Text className="text-sm font-semibold">4</Text>
          </View> */}

          <View className={`ml-2 px-2 py-1 rounded-full ${item.is_available ? "bg-green-100" : "bg-red-100"
            }`}>
            <Text className={`text-xs font-semibold ${item.is_available ? "text-green-800" : "text-red-800"
              }`}>
              {item.is_available ? "Available" : "Unavailable"}
            </Text>
          </View>
        </View>

        <View className="flex flex-row items-center justify-start">
          <Text className="text-sm font-semibold text-general-800">
            {item.vehicle_type}
          </Text>
          <Text className="text-sm font-semibold text-general-800 mx-1">
            |
          </Text>
          <Text className="text-sm font-semibold text-general-800">
            {item.vehicle_color}
          </Text>
          <Text className="text-sm font-semibold text-general-800 mx-1">
            |
          </Text>
          <Text className="text-sm font-semibold text-general-800">
            {item.vehicle_year}
          </Text>
        </View>
      </View>

      <View className="w-[72px] h-[40px]  rounded-lg flex items-center justify-center">
        <Image
          source={images.baobao2}
          className="w-full h-full"
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  );
};

export default DriverCard;