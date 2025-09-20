import { useGetChatMessagesQuery, useGetChatRoomByIdQuery, useSendMessageMutation } from '@/feature/message/api/messageApi'
import { useCancelRideMutation, useFinishRideMutation, useGetStatusRideQuery, useStartRideMutation } from '@/feature/ride/api/rideApi'
import { useAppSelector } from '@/libs/redux/hooks'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface Message {
  id: string
  chat_room_id: string
  sender_id: string
  sender_type: string
  message: string
  sent_at: string
  sender: {
    id: string
    full_name: string
    avatar_url: string
  }
}

export default function ChatRoom() {
  const { id, driverId } = useLocalSearchParams()
  const router = useRouter()
  const [message, setMessage] = useState('')
  const inset = useSafeAreaInsets()
  const flatListRef = useRef<FlatList>(null)
  const currentUserId = useAppSelector((state) => state.auth.user?.id)

  // Optimistic state for ride status
  const [optimisticRideStatus, setOptimisticRideStatus] = useState<string | null>(null)
  const [isRideActionLoading, setIsRideActionLoading] = useState(false)

  const { data: messages, isLoading: messagesLoading } = useGetChatMessagesQuery({
    chatRoomId: id as string
  })
  const { data: chatRoom } = useGetChatRoomByIdQuery({ chatRoomId: id as string })
  const [sendMessage, { isLoading: sendingMessage }] = useSendMessageMutation()
  const { data: rideStatus, refetch: refetchRideStatus } = useGetStatusRideQuery({
    chat_room_id: id as string,
    driver_id: chatRoom?.driver_id as string,
    rider_id: chatRoom?.rider_id as string
  })

  console.log('ride status', rideStatus)

  const [startRide] = useStartRideMutation()
  const [finishRide] = useFinishRideMutation()
  const [cancelRide] = useCancelRideMutation()
  const otherUser = currentUserId === chatRoom?.driver_id ? chatRoom?.rider : chatRoom?.driver.profile || chatRoom?.driver

  // Get the current status (optimistic or actual)
  const currentRideStatus = optimisticRideStatus || rideStatus?.status

  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages])

  // Reset optimistic state when actual status changes
  useEffect(() => {
    if (rideStatus?.status && optimisticRideStatus && rideStatus.status === optimisticRideStatus) {
      setOptimisticRideStatus(null)
      setIsRideActionLoading(false)
    }
  }, [rideStatus?.status, optimisticRideStatus])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-PH", {
      timeZone: "Asia/Manila",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const handleSendMessage = async () => {
    if (message.trim().length === 0 || sendingMessage) return

    const messageText = message.trim()
    setMessage('')

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 100)

    try {
      const senderType = currentUserId === driverId ? 'driver' : 'rider'

      await sendMessage({
        chatRoomId: id as string,
        message: messageText,
        senderId: currentUserId!,
        senderType: senderType
      }).unwrap()

      console.log('Message sent successfully')

    } catch (error: any) {
      console.error("Error sending message:", error)

      Alert.alert(
        'Failed to send message',
        error?.message || 'Please try again',
        [
          {
            text: 'Retry',
            onPress: () => {
              setMessage(messageText)
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      )
    }
  }

  const handleRideAction = async (action: 'start' | 'cancel' | 'complete') => {
    const actionMessages = {
      start: 'Ride has been started 🚗',
      cancel: 'Ride has been cancelled ❌',
      complete: 'Ride has been completed ✅'
    }

    const statusMap = {
      start: 'started',
      cancel: 'cancelled',
      complete: 'completed'
    }

    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Ride`,
      `Are you sure you want to ${action} this ride?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              // Set optimistic state immediately
              setOptimisticRideStatus(statusMap[action])
              setIsRideActionLoading(true)

              // Send system message first
              await sendMessage({
                chatRoomId: id as string,
                message: actionMessages[action],
                senderType: 'system'
              }).unwrap()

              // Perform the actual API call
              if (action === 'complete') {
                await finishRide({
                  chat_room_id: id as string,
                  driver_id: chatRoom?.driver_id as string,
                  completed_at: new Date(),
                  status: 'completed'
                }).unwrap()
              } else if (action === 'start') {
                await startRide({
                  chat_room_id: id as string,
                  driver_id: chatRoom?.driver_id as string,
                  started_at: new Date(),
                  status: 'started'
                }).unwrap()
              } else if (action === 'cancel') {
                await cancelRide({
                  chat_room_id: id as string,
                  driver_id: chatRoom?.driver_id as string,
                  cancelled_at: new Date(),
                  status: 'cancelled'
                }).unwrap()
              }

              // Refetch to ensure we have the latest data
              await refetchRideStatus()

            } catch (error) {
              console.error(`Error ${action}ing ride:`, error)

              // Revert optimistic state on error
              setOptimisticRideStatus(null)
              setIsRideActionLoading(false)

              Alert.alert('Error', `Failed to ${action} ride. Please try again.`)
            }
          }
        }
      ]
    )
  }

  const renderRideControls = () => {
    const isDriver = currentUserId === chatRoom?.driver_id
    if (!isDriver) return null

    const status = currentRideStatus // Use optimistic status

    return (
      <View className="px-4 py-3">
        <View className="flex-row gap-3">
          {status === 'accepted' && (
            <>
              <TouchableOpacity
                onPress={() => handleRideAction('start')}
                disabled={isRideActionLoading}
                className={`flex-1 rounded-xl py-3 px-4 flex-row items-center justify-center ${isRideActionLoading ? 'bg-green-300' : 'bg-green-500'
                  }`}
              >
                {isRideActionLoading && optimisticRideStatus === 'started' ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="play-circle" size={20} color="white" />
                )}
                <Text className="text-white font-semibold ml-2">Start Ride</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleRideAction('cancel')}
                disabled={isRideActionLoading}
                className={`flex-1 rounded-xl py-3 px-4 flex-row items-center justify-center ${isRideActionLoading ? 'bg-red-300' : 'bg-red-500'
                  }`}
              >
                {isRideActionLoading && optimisticRideStatus === 'cancelled' ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="close-circle" size={20} color="white" />
                )}
                <Text className="text-white font-semibold ml-2">Cancel Ride</Text>
              </TouchableOpacity>
            </>
          )}

          {status === 'started' && (
            <TouchableOpacity
              onPress={() => handleRideAction('complete')}
              disabled={isRideActionLoading}
              className={`flex-1 rounded-xl py-3 px-4 flex-row items-center justify-center ${isRideActionLoading ? 'bg-blue-300' : 'bg-blue-500'
                }`}
            >
              {isRideActionLoading && optimisticRideStatus === 'completed' ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="checkmark-circle" size={20} color="white" />
              )}
              <Text className="text-white font-semibold ml-2">Complete Ride</Text>
            </TouchableOpacity>
          )}

          {(status === 'cancelled' || status === 'completed') && (
            <View className="flex-1 bg-gray-300 rounded-xl py-3 px-4 flex-row items-center justify-center">
              {isRideActionLoading ? (
                <ActivityIndicator size="small" color="#666" />
              ) : (
                <Ionicons
                  name={status === 'completed' ? "checkmark-circle" : "close-circle"}
                  size={20}
                  color="#666"
                />
              )}
              <Text className="text-gray-600 font-semibold ml-2 capitalize">
                Ride {status}
              </Text>
            </View>
          )}
        </View>
      </View>
    )
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.sender_id === currentUserId
    const isSystemMessage = item.sender_type === 'system'
    const isOptimistic = item.id.startsWith('optimistic-')

    if (isSystemMessage) {
      return (
        <View className="items-center my-3 px-4">
          <View className="bg-gray-100 rounded-full px-4 py-2">
            <Text className="text-xs text-gray-600 text-center">
              📢 {item.message}
            </Text>
          </View>
          <Text className="text-xs text-gray-400 font-normal mt-1">
            {formatTime(item.sent_at)}
          </Text>
        </View>
      )
    }

    return (
      <View className={`px-4 mb-3 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <View className="flex-row items-end max-w-[80%]">
          {!isCurrentUser && (
            <View className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center mr-2 mb-1">
              <Text className="text-white text-xs font-bold">
                {item.sender?.full_name?.charAt(0) || 'D'}
              </Text>
            </View>
          )}

          <View className={`rounded-2xl px-4 py-3 relative ${isCurrentUser
            ? `${isOptimistic ? 'bg-blue-300' : 'bg-blue-500'} rounded-br-md`
            : 'bg-gray-200 rounded-bl-md'
            }`}>
            <Text className={`text-base font-semibold ${isCurrentUser ? 'text-white' : 'text-black'}`}>
              {item.message}
            </Text>

            {/* Show loading indicator for optimistic messages */}
            {isOptimistic && (
              <View className="absolute -bottom-1 -right-1 bg-gray-400 rounded-full w-4 h-4 items-center justify-center">
                <ActivityIndicator size="small" color="white" />
              </View>
            )}
          </View>

          {isCurrentUser && (
            <View className="w-8 h-8 rounded-full bg-green-500 items-center justify-center ml-2 mb-1">
              <Text className="text-white text-xs font-bold">
                {item.sender?.full_name?.charAt(0) || 'You'}
              </Text>
            </View>
          )}
        </View>

        <Text className={`text-xs text-gray-500 font-normal mt-1 ${isCurrentUser ? 'mr-10' : 'ml-10'}`}>
          {formatTime(item.sent_at)}
        </Text>
      </View>
    )
  }

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-8">
      <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
        <Ionicons name="chatbubble-outline" size={32} color="#3B82F6" />
      </View>

      <Text className="text-xl font-semibold text-gray-800 mb-2 text-center">
        Start your conversation
      </Text>

      <Text className="text-gray-500 text-center leading-6 mb-6">
        Say hello to your driver! They'll receive your message and can respond to coordinate your ride.
      </Text>

      <View className="bg-blue-50 rounded-xl p-4 w-full">
        <Text className="text-blue-800 font-semibold mb-2">
          💡 Quick suggestions:
        </Text>
        <TouchableOpacity
          className="py-2"
          onPress={() => setMessage("Hello! I'm ready for pickup.")}
        >
          <Text className="text-blue-700">"Hello! I'm ready for pickup."</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="py-2"
          onPress={() => setMessage("What's your ETA?")}
        >
          <Text className="text-blue-700">"What's your ETA?"</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="py-2"
          onPress={() => setMessage("I'm at the pickup location.")}
        >
          <Text className="text-blue-700">"I'm at the pickup location."</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center p-4 border-b border-gray-200 bg-white" style={{ paddingTop: inset.top }}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 p-1"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center mr-3">
          <Text className="text-white font-bold">
            {otherUser?.full_name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View className="flex-1">
          <Text className="font-bold text-lg">
            {otherUser?.full_name}
          </Text>
          {/* Show current ride status in header if needed */}
          <Text className="text-xs text-gray-500 capitalize">
            Ride Status: {currentRideStatus || 'Loading...'}
          </Text>
        </View>
      </View>

      {messagesLoading ? (
        LoadingOverlay()
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={messages || []}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingVertical: 10,
              flexGrow: 1
            }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            onContentSizeChange={() => {
              if (messages && messages.length > 0) {
                flatListRef.current?.scrollToEnd({ animated: false })
              }
            }}
          />

          {renderRideControls()}

          <KeyboardAvoidingView
            behavior={Platform.OS === 'android' ? 'padding' : undefined}
            className="border-t border-gray-200 bg-white"
            style={{ marginBottom: inset.bottom }}
          >
            <View className="flex-row items-center p-4">
              <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2 mr-3">
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Type a message..."
                  multiline
                  maxLength={500}
                  className="flex-1 text-base font-semibold max-h-20"
                  style={{ paddingTop: 8, paddingBottom: 8 }}
                  placeholderTextColor="#666"
                  onSubmitEditing={handleSendMessage}
                />
              </View>

              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={message.trim().length === 0 || sendingMessage}
                className={`w-10 h-10 rounded-full items-center justify-center ${message.trim().length > 0 && !sendingMessage ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
              >
                {sendingMessage ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons
                    name="send"
                    size={18}
                    color={message.trim().length > 0 ? "white" : "#666"}
                  />
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </>
      )}
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