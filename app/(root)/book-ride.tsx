import CustomButton from '@/components/CustomButton'
import RideLayout from '@/components/RideLayout'
import { icons } from '@/constant/image'
import { useGetAvailableDriversQuery, useRequestRideMutation } from '@/feature/user/api/userApi'
import { useAppDispatch, useAppSelector } from '@/libs/redux/hooks'
import React from 'react'
import { Image, Text, View } from 'react-native'

export default function BookRide() {
  const dispatch = useAppDispatch()
  const { userAddress, destinationAddress } = useAppSelector((state) => state.location)
  const { selectedDriver } = useAppSelector((state) => state.driver)
  const { data } = useGetAvailableDriversQuery()
  const { user } = useAppSelector((state) => state.auth)
  const rawDriverDetails = data?.filter(
    (driver) => driver.id === selectedDriver,
  )[0];



  const driverDetails = rawDriverDetails ? {
    id: rawDriverDetails.id,
    profile_image_url: rawDriverDetails.profiles?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    title: rawDriverDetails.profiles?.full_name || 'Driver',
    car_seats: 4,
    vehicle_type: rawDriverDetails.vehicle_type,
    vehicle_color: rawDriverDetails.vehicle_color,
    vehicle_year: rawDriverDetails.vehicle_year,
    license_number: rawDriverDetails.license_number,
    is_available: rawDriverDetails.is_available,
    latitude: rawDriverDetails.latitude,
    longitude: rawDriverDetails.longitude,
  } : null;

  const [request, { isLoading: requestLoading }] = useRequestRideMutation()

  const handleConfirmRide = async () => {
    if (!driverDetails) return;

    try {

      /*  dispatch(setDriverInfo({
         id: driverDetails.id,
         full_name: driverDetails.title,
         avatar_url: driverDetails.profile_image_url,
         vehicle: {
           type: driverDetails.vehicle_type,
           color: driverDetails.vehicle_color,
           license_number: driverDetails.license_number,
           year: driverDetails.vehicle_year,
         },
       })); */


      await request({
        riderId: user?.id!,
        driverId: rawDriverDetails?.id!,
        pickupLocation: userAddress!,
        destinationLocation: destinationAddress!,
        status: 'Pending'
      })

      //router.push({
      //  pathname: '/(tabs)/Chat',
      //  params: {
      //    chatRoomId: 1,
      //  },
      //});

    } catch (error) {
      console.error('Error confirming ride:', error);
    }
  };

  if (!driverDetails) {
    return (
      <RideLayout title="Book Ride" snapPoints={["95%"]}>
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg font-JakartaRegular">No driver selected or driver not found</Text>
        </View>
      </RideLayout>
    );
  }

  return (
    <RideLayout title="Book Ride" snapPoints={["95%"]}>
      <>
        <Text className="text-xl font-JakartaSemiBold mb-3">
          Ride Information
        </Text>
        <View className="flex flex-col w-full items-center justify-center ">
          <Image
            source={{ uri: driverDetails.profile_image_url }}
            className="w-28 h-28 rounded-full"
          />
          <View className="flex flex-row items-center justify-center mt-5 space-x-2">
            <Text className="text-lg font-semibold">
              {driverDetails.title}
            </Text>
          </View>
          <Text className="text-sm font-normal text-gray-500 mt-1">
            {driverDetails.vehicle_color} {driverDetails.vehicle_type} ({driverDetails.vehicle_year})
          </Text>
        </View>
        <View className="flex flex-col w-full items-start justify-center py-3 px-5 rounded-3xl bg-general-600 mt-5">
          {/* <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
            <Text className="text-lg font-normal">Pickup Time</Text>
            <Text className="text-lg font-semibold">
              {formatTime(driverDetails.time)}
            </Text>
          </View> */}
          <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
            <Text className="text-lg font-normal">Vehicle Type</Text>
            <Text className="text-lg font-semibold">
              {driverDetails.vehicle_type}
            </Text>
          </View>
          <View className="flex flex-row items-center justify-between w-full py-3">
            <Text className="text-lg font-normal">Color</Text>
            <Text className="text-lg font-semibold">
              {driverDetails.vehicle_color}
            </Text>
          </View>
          <View className="flex flex-row items-center justify-between w-full py-3">
            <Text className="text-lg font-normal">License Number</Text>
            <Text className="text-lg font-semibold">
              {driverDetails.license_number}
            </Text>
          </View>
          <View className="flex flex-row items-center justify-between w-full py-3">
            <Text className="text-lg font-normal">Seats</Text>
            <Text className="text-lg font-semibold">
              {driverDetails.car_seats}
            </Text>
          </View>
        </View>
        <View className="flex flex-col w-full items-start justify-center mt-5">
          <View className="flex flex-row items-center justify-start mt-3 border-t border-b border-general-700 w-full py-3">
            <Image source={icons.to} className="w-6 h-6" />
            <Text className="text-lg font-normal ml-2">
              {userAddress}
            </Text>
          </View>
          <View className="flex flex-row items-center justify-start border-b border-general-700 w-full py-3">
            <Image source={icons.point} className="w-6 h-6" />
            <Text className="text-lg font-normal ml-2">
              {destinationAddress}
            </Text>
          </View>
        </View>
        <CustomButton
          title='Confirm Ride'
          className='my-10'
          onPress={handleConfirmRide}
          disabled={requestLoading}
        />
      </>
    </RideLayout>
  )
}