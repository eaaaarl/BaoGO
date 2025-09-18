import { images } from '@/constant/image'
import React from 'react'
import { Image, View } from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-blue-500">
      <View className="flex-1 justify-center items-center bg-blue-500">
        <Image
          source={images.splash}
          className="w-full h-full"
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  )
}