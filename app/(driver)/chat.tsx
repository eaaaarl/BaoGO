import { images } from '@/constant/image'
import { useGetDriverChatRoomsQuery } from '@/feature/driver/api/driverApi'
import { useAppSelector } from '@/libs/redux/hooks'
import React from 'react'
import { FlatList, Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function Chat() {
  const { user } = useAppSelector((state) => state.auth)
  const { data: driverChatRooms } = useGetDriverChatRoomsQuery({ driverId: user?.id! })
  const inset = useSafeAreaInsets()


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

  const getLatestMessage = (messages: any[]) => {
    if (!messages || messages.length === 0) return null
    return messages[messages.length - 1]
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-5 py-3 border-b border-gray-100" style={{ paddingTop: inset.top }}>
        <Text className="text-2xl font-semibold">Messages</Text>
      </View>

      {driverChatRooms && driverChatRooms.length > 0 ? (
        <FlatList
          data={driverChatRooms}
          renderItem={({ item }) => {
            const latestMessage = getLatestMessage(item.latest_message)

            return (
              <TouchableOpacity
                className='flex-row items-center p-4 border-b border-gray-100'
              >
                <View className='w-12 h-12 rounded-full bg-blue-500 items-center justify-center mr-3'>
                  <Text className='text-white font-semibold text-lg'>
                    {item.rider?.full_name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View className='flex-1'>
                  <View className='flex-row justify-between items-center mb-1'>
                    <Text className='font-semibold text-base text-black'>
                      {item.rider?.full_name}
                    </Text>
                    {latestMessage && (
                      <Text className='text-xs text-gray-500 font-semibold'>
                        {formatTime(latestMessage.sent_at)}
                      </Text>
                    )}
                  </View>

                  <View className='flex-row justify-between items-center'>
                    <Text
                      className='text-sm text-gray-600 font-medium flex-1'
                      numberOfLines={1}
                    >
                      {latestMessage ? (
                        <>
                          {latestMessage.sender_type === 'system' && (
                            <Text className='text-blue-600 font-semibold'>System: </Text>
                          )}
                          {latestMessage.sender_type === 'rider' && (
                            <Text className='text-gray-800 font-semibold'>Rider: </Text>
                          )}
                          {latestMessage.sender_type === 'driver' && (
                            <Text className='text-green-600 font-semibold'>You: </Text>
                          )}
                          {latestMessage.message}
                        </>
                      ) : (
                        'No messages yet'
                      )}
                    </Text>

                    {latestMessage?.sender_type === 'rider' && (
                      <View className='w-2 h-2 rounded-full bg-blue-500 ml-2' />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )
          }}
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

function renderEmptyState() {
  return (
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
}