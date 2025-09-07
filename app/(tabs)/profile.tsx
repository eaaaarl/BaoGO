import InputField from '@/components/InputFields'
import { useGetProfileUserQuery } from '@/feature/auth/api/authApi'
import { useAppSelector } from '@/libs/redux/hooks'
import React from 'react'
import { Image, ScrollView, Text, View } from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'

export default function Profile() {
  const { user } = useAppSelector((state) => state.auth);
  const { data: profileUser } = useGetProfileUserQuery(user?.id as string);
  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Text className="text-2xl font-JakartaBold my-5">My profile</Text>

        <View className="flex items-center justify-center my-5">
          {profileUser?.avatar_url ? (
            <Image
              source={{
                uri: profileUser?.avatar_url,
              }}
              style={{ width: 110, height: 110, borderRadius: 110 / 2 }}
              className=" rounded-full h-[110px] w-[110px] border-[3px] border-white shadow-sm shadow-neutral-300"
            />
          ) : (
            <View className="flex items-center justify-center rounded-full h-[110px] w-[110px] border-[3px] border-white shadow-sm shadow-neutral-300">
              <Text className="text-5xl text-center">
                {profileUser?.full_name?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View className="flex flex-col items-start justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 px-5 py-3">
          <View className="flex flex-col items-start justify-start w-full">
            <InputField
              label="Full name"
              placeholder={profileUser?.full_name || "Not Found"}
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={false}
            />

            <InputField
              label="Email"
              placeholder={
                profileUser?.email || "Not Found"
              }
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={false}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}