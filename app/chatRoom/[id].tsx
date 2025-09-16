import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface Message {
  id: string
  text: string
  timestamp: string
  sender_id: string
  sender_type: 'driver' | 'rider' | 'system'
  sender_name: string
}

export default function ChatRoom() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [message, setMessage] = useState('')

  const inset = useSafeAreaInsets()
  // Mock current user - replace with your actual user state
  const currentUserId = 'user-123'

  // Mock messages - replace with your actual API call
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Ride confirmed! You can now chat with your driver.',
      timestamp: '2025-09-15T23:25:36.063Z',
      sender_id: 'system',
      sender_type: 'system',
      sender_name: 'System'
    },
    {
      id: '2',
      text: 'Hi! I\'m on my way to pick you up. I\'ll be there in 5 minutes.',
      timestamp: '2025-09-15T23:26:15.123Z',
      sender_id: 'driver-456',
      sender_type: 'driver',
      sender_name: 'Jhonn Rex'
    },
    {
      id: '3',
      text: 'Great! I\'ll be waiting at the main entrance.',
      timestamp: '2025-09-15T23:26:45.456Z',
      sender_id: 'user-123',
      sender_type: 'rider',
      sender_name: 'Earl Dominic Ado'
    },
    {
      id: '4',
      text: 'Perfect! I can see you now. Blue Bao-Bao coming your way.',
      timestamp: '2025-09-15T23:27:12.789Z',
      sender_id: 'driver-456',
      sender_type: 'driver',
      sender_name: 'Jhonn Rex'
    }
  ])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const sendMessage = () => {
    if (message.trim().length === 0) return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      timestamp: new Date().toISOString(),
      sender_id: currentUserId,
      sender_type: 'rider',
      sender_name: 'You'
    }

    setMessages(prev => [...prev, newMessage])
    setMessage('')
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.sender_id === currentUserId
    const isSystemMessage = item.sender_type === 'system'

    if (isSystemMessage) {
      return (
        <View className="items-center my-2 px-4">
          <View className="bg-gray-100 rounded-full px-4 py-2">
            <Text className="text-xs text-gray-600 text-center">
              📢 {item.text}
            </Text>
          </View>
          <Text className="text-xs text-gray-400 mt-1">
            {formatTime(item.timestamp)}
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
                {item.sender_name.charAt(0)}
              </Text>
            </View>
          )}

          <View className={`rounded-2xl px-4 py-3 ${isCurrentUser
            ? 'bg-blue-500 rounded-br-md'
            : 'bg-gray-200 rounded-bl-md'
            }`}>
            <Text className={`text-base ${isCurrentUser ? 'text-white' : 'text-black'
              }`}>
              {item.text}
            </Text>
          </View>

          {isCurrentUser && (
            <View className="w-8 h-8 rounded-full bg-green-500 items-center justify-center ml-2 mb-1">
              <Text className="text-white text-xs font-bold">
                {item.sender_name.charAt(0)}
              </Text>
            </View>
          )}
        </View>

        <Text className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? 'mr-10' : 'ml-10'
          }`}>
          {formatTime(item.timestamp)}
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
          <Text className="text-white font-bold">J</Text>
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="border-t border-gray-200 bg-white"
        style={{ paddingBottom: inset.bottom }}
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
            onPress={sendMessage}
            className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center"
          >
            <Ionicons name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}