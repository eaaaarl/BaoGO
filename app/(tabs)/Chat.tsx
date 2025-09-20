import { images } from '@/constant/image'
import { ChatRoom } from '@/feature/message/api/inteface'
import { useGetChatRoomQuery } from '@/feature/message/api/messageApi'
import { useAppSelector } from '@/libs/redux/hooks'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator, FlatList, Image, RefreshControl, SafeAreaView, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'


export default function Chat() {
  const { user } = useAppSelector((state) => state.auth)
  const { data: chatRooms, isLoading: getChatRoomsLoading, refetch: chatRoomsRefetch } = useGetChatRoomQuery({
    rider_id: user?.id as string
  })

  console.log('chatRooms', JSON.stringify(chatRooms, null, 2))

  const [isRefreshing, setIsRefreshing] = useState(false)
  const inset = useSafeAreaInsets()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await chatRoomsRefetch()
    setIsRefreshing(false)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const handleChatPress = (chatRoom: ChatRoom) => {
    router.push({
      pathname: '/chatRoom/[id]',
      params: {
        id: chatRoom.id
      }
    })
  }



  const renderChatItem = ({ item }: { item: ChatRoom }) => {

    const driver = item.driver
    const lastMessage = item.latest_message && item.latest_message.length > 0 ? item.latest_message[item.latest_message.length - 1] : null

    console.log('item', JSON.stringify(item, null, 2))

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
              <Text className="text-xs text-gray-500 font-normal">
                {formatTime(lastMessage.sent_at)}
              </Text>
            )}
          </View>

          <View className="flex-row justify-between items-center">
            <View className='flex-row justify-between items-center'>
              <Text
                className='text-sm text-gray-600 font-medium flex-1'
                numberOfLines={1}
              >
                {lastMessage ? (
                  <>
                    {lastMessage.sender_type === 'system' && (
                      <Text className='text-blue-600 font-semibold'>System: </Text>
                    )}
                    {lastMessage.sender_type === 'driver' && (
                      <Text className='text-gray-800 font-semibold'>Rider: </Text>
                    )}
                    {lastMessage.sender_type === 'rider' && (
                      <Text className='text-green-600 font-semibold'>You: </Text>
                    )}
                    {lastMessage.message}
                  </>
                ) : (
                  'No messages yet'
                )}
              </Text>

              {lastMessage?.sender_type === 'driver' && (
                <View className='w-2 h-2 rounded-full bg-blue-500 ml-2' />
              )}
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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        }
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