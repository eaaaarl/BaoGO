import { images } from '@/constant/image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function UserSelection() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      router.push({
        pathname: '/(auth)/sign-in',
        params: {
          role: selectedRole
        }
      })
    }
  };

  return (
    <ScrollView className='flex-1 bg-white px-6 pt-10'>
      <View className='items-center mb-7'>
        <Text className='text-2xl font-semibold text-gray-800 text-center'>
          How do you want to use
        </Text>
        <Text className='text-3xl font-bold text-blue-500 text-center mt-1'>
          BaoGO?
        </Text>
        <Text className='text-base text-gray-500 text-center mt-2'>
          Choose your preferred way to travel
        </Text>
      </View>

      <View className='flex-1 justify-center gap-5'>
        <TouchableOpacity
          className={`bg-white rounded-2xl p-6 border-2 ${selectedRole === 'rider'
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200'
            } shadow-lg`}
          onPress={() => handleRoleSelect('rider')}
          activeOpacity={0.8}
        >
          <View className='items-center relative'>
            {selectedRole === 'rider' && (
              <View className='absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full items-center justify-center'>
                <Text className='text-white text-sm font-bold'>✓</Text>
              </View>
            )}

            {/* Icon */}
            <View className='w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4'>
              <Image
                source={images.baobaoDriver}
                className='w-20 h-20 rounded-full'
                resizeMode='contain'
              />
            </View>

            <Text className='text-xl font-bold text-gray-800 mb-2'>
              I need a ride
            </Text>
            <Text className='text-sm text-gray-600 text-center mb-4'>
              Book rides and get around the city
            </Text>

            <View className='items-start'>
              <Text className='text-xs font-semibold text-gray-400 mb-1'>• Quick booking</Text>
              <Text className='text-xs font-semibold text-gray-400 mb-1'>• Safe rides</Text>
              <Text className='text-xs font-semibold text-gray-400'>• Fair pricing</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className={`bg-white rounded-2xl p-6 border-2 ${selectedRole === 'driver'
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200'
            } shadow-lg`}
          onPress={() => handleRoleSelect('driver')}
          activeOpacity={0.8}
        >
          <View className='items-center relative'>
            {selectedRole === 'driver' && (
              <View className='absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full items-center justify-center'>
                <Text className='text-white text-sm font-bold'>✓</Text>
              </View>
            )}

            <View className='w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4'>
              <Image
                source={images.baobaoDriver}
                className='w-20 h-20 rounded-full'
                resizeMode='contain'
              />
            </View>

            <Text className='text-xl font-bold text-gray-800 mb-2'>
              I want to drive
            </Text>
            <Text className='text-sm text-gray-600 text-center mb-4'>
              Earn money by giving rides
            </Text>

            <View className='items-start'>
              <Text className='text-xs font-semibold text-gray-400 mb-1'>• Flexible schedule</Text>
              <Text className='text-xs font-semibold text-gray-400 mb-1'>• Good earnings</Text>
              <Text className='text-xs font-semibold text-gray-400'>• Be your own boss</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        className={`rounded-xl py-4 items-center mt-5 ${selectedRole
          ? 'bg-blue-500'
          : 'bg-gray-300'
          }`}
        onPress={handleContinue}
        disabled={!selectedRole}
        activeOpacity={selectedRole ? 0.8 : 1}
      >
        <Text className={`text-base font-semibold ${selectedRole
          ? 'text-white'
          : 'text-gray-500'
          }`}>
          Continue
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}