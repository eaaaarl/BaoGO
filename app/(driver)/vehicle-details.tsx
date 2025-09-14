import { useGetDriverProfileQuery } from '@/feature/driver/api/driverApi'
import { useAppSelector } from '@/libs/redux/hooks'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function VehicleDetails() {
  const insets = useSafeAreaInsets()

  const { user } = useAppSelector((state) => state.auth)
  const { data: driverProfile } = useGetDriverProfileQuery({ id: user?.id as string }, {
    skip: !user?.id
  })

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View
        className="flex-row items-center gap-2 bg-white px-4 pt-4 pb-6 border-b border-gray-100"
        style={{ paddingTop: insets.top }}
      >
        <TouchableOpacity
          className="p-2 rounded-full bg-gray-100"
          onPress={() => router.replace('/(driver)/profile')}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-semibold text-gray-900">Vehicle Details</Text>
      </View>
      <View className='px-4 pt-4 mb-4'>
        <View className='bg-white rounded-2xl p-4 shadow-sm border border-gray-100'>
          <Text className='text-sm text-gray-500 mb-2'>Vehicle Information</Text>
          <View className='flex-row justify-between items-center mb-2'>
            <Text className='text-sm text-gray-500 font-semibold'>Vehicle Type</Text>
            <Text className='text-sm text-gray-800 font-semibold'>{driverProfile?.vehicle_type}</Text>
          </View>
          <View className='flex-row justify-between items-center mb-2'>
            <Text className='text-sm text-gray-500 font-semibold'>Vehicle Color</Text>
            <Text className='text-sm text-gray-800 font-semibold'>{driverProfile?.vehicle_color}</Text>
          </View>
          <View className='flex-row justify-between items-center mb-2'>
            <Text className='text-sm text-gray-500 font-semibold'>Vehicle Plate Number</Text>
            <Text className='text-sm text-gray-800 font-semibold'>{driverProfile?.license_number}</Text>
          </View>
          <View className='flex-row justify-between items-center mb-2'>
            <Text className='text-sm text-gray-500 font-semibold'>Vehicle Year</Text>
            <Text className='text-sm text-gray-800 font-semibold'>{driverProfile?.vehicle_year}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}