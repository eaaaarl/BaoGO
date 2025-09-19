import { useGetChatMessagesQuery, useGetChatRoomByIdQuery, useSendMessageMutation } from '@/feature/message/api/messageApi'
import { useAppSelector } from '@/libs/redux/hooks'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useMemo, useRef, useState } from 'react'
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
  isOptimistic?: boolean
  isFailed?: boolean
  error?: any
}

export default function ChatRoom() {
  const { id, driverId } = useLocalSearchParams()
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([])
  const [rideStatus, setRideStatus] = useState('pending')
  const inset = useSafeAreaInsets()
  const flatListRef = useRef<FlatList>(null)
  const currentUserId = useAppSelector((state) => state.auth.user?.id)
  const currentUser = useAppSelector((state) => state.auth.user)

  const { data: messages, isLoading: messagesLoading } = useGetChatMessagesQuery({
    chatRoomId: id as string
  })
  const { data: chatRoom } = useGetChatRoomByIdQuery({ chatRoomId: id as string })
  const [sendMessage, { isLoading: sendingMessage }] = useSendMessageMutation()

  const otherUser = currentUserId === chatRoom?.driver_id ? chatRoom?.rider : chatRoom?.driver.profile || chatRoom?.driver

  // Combine real messages with optimistic messages (memoized)
  const allMessages = useMemo(() => {
    const base = messages || []
    if (base.length === 0 && optimisticMessages.length === 0) return []
    return [...base, ...optimisticMessages]
  }, [messages, optimisticMessages])

  console.log('allmessages', JSON.stringify(allMessages, null, 2))

  useEffect(() => {
    if (allMessages && allMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [allMessages])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-PH", {
      timeZone: "Asia/Manila",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }


  const generateOptimisticId = () => `optimistic-${Date.now()}-${Math.random()}`

  const handleSendMessage = async () => {
    if (message.trim().length === 0 || sendingMessage) return

    const messageText = message.trim()
    const optimisticId = generateOptimisticId()
    setMessage('')

    // Create optimistic message
    const optimisticMessage: Message = {
      id: optimisticId,
      chat_room_id: id as string,
      sender_id: currentUserId!,
      sender_type: currentUserId === driverId ? 'driver' : 'rider',
      message: messageText,
      sent_at: new Date().toISOString(),
      sender: {
        id: currentUserId!,
        full_name: currentUser?.full_name || 'You',
        avatar_url: currentUser?.avatar_url || ''
      },
      isOptimistic: true
    }

    // Add optimistic message immediately
    setOptimisticMessages(prev => [...prev, optimisticMessage])

    // Scroll to end
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 100)

    try {
      const senderType = currentUserId === driverId ? 'driver' : 'rider'

      const result = await sendMessage({
        chatRoomId: id as string,
        message: messageText,
        senderId: currentUserId!,
        senderType: senderType
      }).unwrap()

      console.log('Message sent successfully:', result)

      // Remove optimistic message since real message will come through the query
      setOptimisticMessages(prev => prev.filter(msg => msg.id !== optimisticId))

    } catch (error: any) {
      console.error("Error sending message:", error)

      // Mark optimistic message as failed
      setOptimisticMessages(prev =>
        prev.map(msg =>
          msg.id === optimisticId
            ? { ...msg, isFailed: true, isOptimistic: false }
            : msg
        )
      )

      Alert.alert(
        'Failed to send message',
        error?.data?.message || 'Please try again',
        [
          {
            text: 'Retry',
            onPress: () => {
              setMessage(messageText)
              // Remove failed message
              setOptimisticMessages(prev => prev.filter(msg => msg.id !== optimisticId))
            }
          },
          {
            text: 'Cancel',
            onPress: () => {
              // Remove failed message
              setOptimisticMessages(prev => prev.filter(msg => msg.id !== optimisticId))
            }
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

    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Ride`,
      `Are you sure you want to ${action} this ride?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const newStatus = action === 'start' ? 'started' : action === 'cancel' ? 'cancelled' : 'completed'
              setRideStatus(newStatus)

              const systemMessage: Message = {
                id: generateOptimisticId(),
                chat_room_id: id as string,
                sender_id: 'system',
                sender_type: 'system',
                message: actionMessages[action],
                sent_at: new Date().toISOString(),
                sender: {
                  id: 'system',
                  full_name: 'System',
                  avatar_url: ''
                },
                isOptimistic: true
              }

              setOptimisticMessages(prev => [...prev, systemMessage])



              // Here you would make the actual API call to update ride status
              // await updateRideStatus({ rideId: id, status: newStatus })

              console.log(`Ride ${action} successfully`)
            } catch (error) {
              console.error(`Error ${action}ing ride:`, error)
              // Revert status on error
              setRideStatus('pending')
              Alert.alert('Error', `Failed to ${action} ride. Please try again.`)
            }
          }
        }
      ]
    )
  }

  const renderRideControls = () => {
    const isDriver = currentUserId === chatRoom?.driver_id
    // For testing purposes, you can temporarily return the controls regardless
    if (!isDriver) return null

    return (
      <View className="px-4 py-3">
        <View className="flex-row gap-3">
          {rideStatus === 'pending' && (
            <>
              <TouchableOpacity
                onPress={() => handleRideAction('start')}
                className="flex-1 bg-green-500 rounded-xl py-3 px-4 flex-row items-center justify-center"
              >
                <Ionicons name="play-circle" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Start Ride</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleRideAction('cancel')}
                className="flex-1 bg-red-500 rounded-xl py-3 px-4 flex-row items-center justify-center"
              >
                <Ionicons name="close-circle" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Cancel Ride</Text>
              </TouchableOpacity>
            </>
          )}

          {rideStatus === 'started' && (
            <TouchableOpacity
              onPress={() => handleRideAction('complete')}
              className="flex-1 bg-blue-500 rounded-xl py-3 px-4 flex-row items-center justify-center"
            >
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Complete Ride</Text>
            </TouchableOpacity>
          )}

          {(rideStatus === 'cancelled' || rideStatus === 'completed') && (
            <View className="flex-1 bg-gray-300 rounded-xl py-3 px-4 flex-row items-center justify-center">
              <Ionicons
                name={rideStatus === 'completed' ? "checkmark-circle" : "close-circle"}
                size={20}
                color="#666"
              />
              <Text className="text-gray-600 font-semibold ml-2 capitalize">
                Ride {rideStatus}
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
            ? `${item.isFailed ? 'bg-red-100 border border-red-300' : item.isOptimistic ? 'bg-blue-300' : 'bg-blue-500'} rounded-br-md`
            : 'bg-gray-200 rounded-bl-md'
            }`}>
            <Text className={`text-base font-semibold ${isCurrentUser
              ? item.isFailed ? 'text-red-700' : 'text-white'
              : 'text-black'
              }`}>
              {item.message}
            </Text>

            {item.isOptimistic && (
              <View className="absolute -bottom-1 -right-1 bg-gray-400 rounded-full w-4 h-4 items-center justify-center">
                <ActivityIndicator size="small" color="white" />
              </View>
            )}

            {item.isFailed && (
              <TouchableOpacity
                className="absolute -bottom-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center"
                onPress={() => {
                  setMessage(item.message)
                  setOptimisticMessages(prev => prev.filter(msg => msg.id !== item.id))
                }}
              >
                <Ionicons name="refresh" size={10} color="white" />
              </TouchableOpacity>
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

        <Text className={`text-xs text-gray-500 font-normal mt-1 ${isCurrentUser ? 'mr-10' : 'ml-10'
          }`}>
          {formatTime(item.sent_at)}
          {item.isFailed && <Text className="text-red-500"> • Failed to send</Text>}
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
        Say hello to your driver! They’ll receive your message and can respond to coordinate your ride.
      </Text>

      <View className="bg-blue-50 rounded-xl p-4 w-full">
        <Text className="text-blue-800 font-semibold mb-2">
          💡 Quick suggestions:
        </Text>
        <TouchableOpacity
          className="py-2"
          onPress={() => setMessage("Hello! I'm ready for pickup.")}
        >
          <Text className="text-blue-700">“Hello! I’m ready for pickup.”</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="py-2"
          onPress={() => setMessage("What's your ETA?")}
        >
          <Text className="text-blue-700">“What’s your ETA?”</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="py-2"
          onPress={() => setMessage("I'm at the pickup location.")}
        >
          <Text className="text-blue-700">“I’m at the pickup location.”</Text>
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
          <Text className="text-xs text-gray-500 capitalize">
            Ride Status: {rideStatus}
          </Text>
        </View>
      </View>

      {messagesLoading ? (
        LoadingOverlay()
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={allMessages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingVertical: 10,
              flexGrow: 1
            }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            onContentSizeChange={() => {
              if (allMessages && allMessages.length > 0) {
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
                disabled={message.trim().length === 0}
                className={`w-10 h-10 rounded-full items-center justify-center ${message.trim().length > 0 ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
              >
                <Ionicons
                  name="send"
                  size={18}
                  color={message.trim().length > 0 ? "white" : "#666"}
                />
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