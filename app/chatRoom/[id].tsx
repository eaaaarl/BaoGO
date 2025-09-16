import { useGetChatMessagesQuery, useSendMessageMutation } from '@/feature/message/api/messageApi'
import { useAppSelector } from '@/libs/redux/hooks'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
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
  const { id } = useLocalSearchParams()

  const router = useRouter()
  const [message, setMessage] = useState('')
  const inset = useSafeAreaInsets()
  const currentUserId = useAppSelector((state) => state.auth.user?.id)

  const { data: messages } = useGetChatMessagesQuery({ chatRoomId: id as string })
  const [sendMessage, { isLoading }] = useSendMessageMutation()

  console.log("messages", JSON.stringify(messages, null, 2))
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleSendMessage = async () => {
    if (message.trim().length === 0) return
    try {
      const res = await sendMessage({
        chatRoomId: id as string,
        message: message.trim(),
        senderId: currentUserId!,
        senderType: 'rider' as 'rider' | 'driver' | 'system'
      })

      console.log("send message", JSON.stringify(res, null, 2))

    } catch (error) {
      console.log("error", error)
    }
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.sender_id === currentUserId
    const isSystemMessage = item.sender_type === 'system'

    if (isSystemMessage) {
      return (
        <View className="items-center my-2 px-4">
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
                {item.sender.full_name.charAt(0)}
              </Text>
            </View>
          )}

          <View className={`rounded-2xl px-4 py-3 ${isCurrentUser
            ? 'bg-blue-500 rounded-br-md'
            : 'bg-gray-200 rounded-bl-md'
            }`}>
            <Text className={`text-base ${isCurrentUser ? 'text-white' : 'text-black'
              }`}>
              {item.message}
            </Text>
          </View>

          {isCurrentUser && (
            <View className="w-8 h-8 rounded-full bg-green-500 items-center justify-center ml-2 mb-1">
              <Text className="text-white text-xs font-bold">
                {item.sender.full_name.charAt(0)}
              </Text>
            </View>
          )}
        </View>

        <Text className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? 'mr-10' : 'ml-10'
          }`}>
          {formatTime(item.sent_at)}
        </Text>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center p-4 border-b border-gray-200 bg-white" style={{ paddingTop: inset.top }}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center mr-3">
          <Text className="text-white font-bold">{currentUserId}</Text>
        </View>

        <View className="flex-1">
          <Text className="font-bold text-lg">Jhonn Rex</Text>
          <Text className="text-sm text-gray-500">Blue Bao-Bao • Online</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 10 }}
        showsVerticalScrollIndicator={false}
        inverted={false}
      />

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
              className="flex-1 text-base max-h-20"
              style={{ paddingTop: 8, paddingBottom: 8 }}
              placeholderTextColor="#666"
            />
            <TouchableOpacity className="p-1">
              <Ionicons name="attach" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleSendMessage}
            className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center"
          >
            <Ionicons name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}