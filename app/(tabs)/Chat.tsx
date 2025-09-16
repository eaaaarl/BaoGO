import { images } from '@/constant/image'
import { useGetUserChatRoomsQuery } from '@/feature/message/api/messageApi'
import { useAppSelector } from '@/libs/redux/hooks'
import { router } from 'expo-router'
import React from 'react'
import { FlatList, Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface ChatRoom {
  id: string
  driver_id: string
  rider_id: string
  status: string
  created_at: string
  updated_at: string
  driver: {
    id: string
    profiles: {
      full_name: string
      avatar_url: string | null
    }
    vehicle_type: string
    vehicle_color: string
  }
  rider: {
    id: string
    full_name: string
    avatar_url: string | null
  },
  latest_message: {
    message: string
    sent_at: string
    sender_type: string
  }[]
}

export default function Chat() {
  const { user } = useAppSelector((state) => state.auth)
  const { driverInfo } = useAppSelector((state) => state.ride)
  const { data: chatRooms, isLoading } = useGetUserChatRoomsQuery({
    userId: user?.id as string,
    driverId: driverInfo.id as string
  })


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

  const getOtherParticipant = (chatRoom: ChatRoom) => {
    // Determine if current user is driver or rider, then return the other participant
    const isDriver = user?.id === chatRoom.driver_id
    return isDriver ? chatRoom.rider : chatRoom.driver.profiles
  }

  const getVehicleInfo = (chatRoom: ChatRoom) => {
    return `${chatRoom.driver.vehicle_type} • ${chatRoom.driver.vehicle_color}`
  }

  const handleChatPress = (chatRoom: ChatRoom) => {
    // Navigate to individual chat screen
    // navigation.navigate('ChatRoom', { chatRoomId: chatRoom.id })
    router.push({
      pathname: '/chatRoom/[id]',
      params: {
        id: chatRoom.id
      }
    })
  }

  const renderChatItem = ({ item }: { item: ChatRoom }) => {
    const otherParticipant = getOtherParticipant(item)
    const lastMessage = item.latest_message[0]
    const vehicleInfo = getVehicleInfo(item)

    return (
      <TouchableOpacity
        className="flex-row items-center p-4 border-b border-gray-100"
        onPress={() => handleChatPress(item)}
      >
        <View className="w-12 h-12 rounded-full bg-gray-300 items-center justify-center mr-3">
          {otherParticipant.avatar_url ? (
            <Image
              source={{ uri: otherParticipant.avatar_url }}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <Text className="text-white font-semibold text-lg">
              {otherParticipant.full_name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="font-semibold text-base text-black">
              {otherParticipant.full_name}
            </Text>
            <Text className="text-xs text-gray-500">
              {formatTime(lastMessage.sent_at)}
            </Text>
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text
                className="text-sm text-gray-600 font-medium"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {lastMessage.sender_type === 'system' ? '📢 ' : ''}
                {lastMessage.message}
              </Text>
              <Text className="text-xs text-gray-400 mt-1">
                {vehicleInfo}
              </Text>
            </View>

            {item.status === 'active' && (
              <View className="w-2 h-2 bg-blue-500 rounded-full ml-2" />
            )}
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
        Start a conversation with your drivers and riders
      </Text>
    </View>
  )

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-base text-gray-500">Loading chats...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-5 py-3 border-b border-gray-100" style={{ paddingTop: inset.top }}>
        <Text className="text-2xl font-JakartaBold">Messages</Text>
      </View>

      {chatRooms && chatRooms.length > 0 ? (
        <FlatList
          data={chatRooms}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      ) : (
        renderEmptyState()
      )}
    </SafeAreaView>
  )
}