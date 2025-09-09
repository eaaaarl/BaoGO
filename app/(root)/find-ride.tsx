import CustomButton from '@/components/CustomButton'
import GoogleTextInput from '@/components/GoogleTextInput'
import RideLayout from '@/components/RideLayout'
import { icons } from '@/constant/image'
import { useAppDispatch, useAppSelector } from '@/libs/redux/hooks'
import { setDestinationLocation, setUserLocation } from '@/libs/redux/state/locationSlice'
import { router } from 'expo-router'
import React from 'react'
import { Text, View } from 'react-native'


export default function FindRide() {
  const dispatch = useAppDispatch()
  const { userAddress, destinationAddress } = useAppSelector((state) => state.location)
  return (
    <RideLayout title='Ride'>
      <View className='my-3'>
        <Text className='text-lg'>From</Text>

        <GoogleTextInput
          icon={icons.target}
          initialLocation={userAddress!}
          containerStyle="bg-neutral-100"
          textInputBackgroundColor="#f5f5f5"
          handlePress={(location) => dispatch(setUserLocation(location))}
        />
      </View>

      <View className="my-3">
        <Text className="text-lg font-JakartaSemiBold mb-3">To</Text>

        <GoogleTextInput
          icon={icons.map}
          initialLocation={destinationAddress!}
          containerStyle="bg-neutral-100"
          textInputBackgroundColor="transparent"
          handlePress={(location) => dispatch(setDestinationLocation(location))}
        />
      </View>

      <CustomButton
        title="Find Now"
        onPress={() => router.push(`/(root)/confirm-ride`)}
        className="my-5"
      />
    </RideLayout>
  )
}