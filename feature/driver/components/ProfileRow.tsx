import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const ProfileRow = ({
  icon,
  title,
  value,
  onPress,
  showArrow = false,
  danger = false }:
  { icon: string, title: string, value: string, onPress?: () => void, showArrow: boolean, danger: boolean }) => (
  <TouchableOpacity
    className={`bg-white px-4 py-4 flex-row items-center ${!onPress ? 'opacity-50' : 'opacity-100'}`}
    onPress={onPress}
    disabled={!onPress}
  >
    <View style={{ marginRight: 8 }} className={`w-10 h-10 rounded-full items-center justify-center ${danger ? 'bg-red-100' : 'bg-gray-100'}`}>
      <Ionicons name={icon as any} size={20} color={danger ? '#EF4444' : '#6B7280'} />
    </View>
    <View className="flex-1">
      <Text className={`font-medium ${danger ? 'text-red-600' : 'text-gray-800'}`}>{title}</Text>
      {value && <Text className="text-sm text-gray-500 mt-1">{value}</Text>}
    </View>
    {showArrow && <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
  </TouchableOpacity>
);

export default ProfileRow;