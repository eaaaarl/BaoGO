import { images } from '@/constant/image'
import { ChatRoom } from '@/feature/message/api/inteface'
import { useGetChatRoomQuery } from '@/feature/message/api/messageApi'
import { useAppDispatch, useAppSelector } from '@/libs/redux/hooks'
import { setDriverInfo } from '@/libs/redux/state/rideSlice'
import { router } from 'expo-router'
import React from 'react'
import { ActivityIndicator, FlatList, Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'


export default function Chat() {
  const { user } = useAppSelector((state) => state.auth)
  const { data: chatRooms, isLoading: getChatRoomsLoading } = useGetChatRoomQuery({
    rider_id: user?.id as string
  })

  const dispatch = useAppDispatch()

  const inset = useSafeAreaInsets()

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const handleChatPress = (chatRoom: ChatRoom) => {
    dispatch(setDriverInfo({
      full_name: chatRoom.driver.profile.full_name,
      avatar_url: chatRoom.driver.profile.avatar_url!,
      id: chatRoom.driver_id,
      vehicle: {
        color: chatRoom.driver.vehicle_color,
        license_number: chatRoom.driver.license_number,
        type: chatRoom.driver.vehicle_type,
        year: String(chatRoom.driver.vehicle_year)
      }
    }))
    router.push({
      pathname: '/chatRoom/[id]',
      params: {
        id: chatRoom.id
      }
    })
  }

  const renderChatItem = ({ item }: { item: ChatRoom }) => {

    const driver = item.driver
    const lastMessage = item.latest_message && item.latest_message.length > 0 ? item.latest_message[0] : null


    const driverName = driver.profile.full_name
    const driverInitial = driverName.charAt(0).toUpperCase()

    return (
      <TouchableOpacity
        className="flex-row items-center p-4 border-b border-gray-100"
        onPress={() => handleChatPress(item)}
      >
        <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mr-3">
          <Text className="text-white font-semibold text-lg">
            {driverInitial}
          </Text>
        </View>

        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="font-semibold text-base text-black">
              {driverName}
            </Text>
            {lastMessage && (
              <Text className="text-xs text-gray-500">
                {formatTime(lastMessage.sent_at)}
              </Text>
            )}
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text
                className="text-sm text-gray-600 font-medium"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {lastMessage ? (
                  <>
                    {lastMessage.sender_type === 'system' ? '📢 ' : ''}
                    {lastMessage.message}
                  </>
                ) : (
                  'No messages yet'
                )}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-7">
      <Image
        source={images.message}
        alt="message"
        className="w-full h-40"
        resizeMode="contain"
      />
      <Text className="text-3xl font-semibold mt-3">
        No Messages Yet
      </Text>
      <Text className="text-base mt-2 text-center">
        Start a conversation with your drivers
      </Text>
    </View>
  )

  if (getChatRoomsLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-5 py-3 border-b border-gray-100" style={{ paddingTop: inset.top }}>
          <Text className="text-2xl font-semibold">Messages</Text>
        </View>
        <LoadingOverlay />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-5 py-3 border-b border-gray-100" style={{ paddingTop: inset.top }}>
        <Text className="text-2xl font-semibold">Messages</Text>
      </View>

      <FlatList
        data={chatRooms}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  )
}

function LoadingOverlay() {
  return (
    <View className="absolute inset-0 bg-black/5 flex-1 justify-center items-center z-50">
      <View className="bg-white rounded-2xl p-4 mx-8 items-center shadow-lg">
        <ActivityIndicator size="large" color="#0286FF" />
      </View>
    </View>
  )
}