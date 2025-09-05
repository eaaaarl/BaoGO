import CustomButton from '@/components/CustomButton'
import InputField from '@/components/InputFields'
import OAuth from '@/components/OAuth'
import { icons, images } from '@/constant/image'
import { supabase } from '@/libs/supabase'
import { Link, router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Image, ScrollView, Text, View } from 'react-native'

export default function SignUp() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    if (!form.name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name')
      return false
    }
    if (!form.email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email')
      return false
    }
    if (!form.email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid email')
      return false
    }
    if (form.password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters')
      return false
    }
    return true
  }

  const onSignUpPress = async () => {
    if (!validateForm()) return

    setLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          data: {
            full_name: form.name.trim(),
          }
        }
      })

      if (authError) {
        Alert.alert('Sign Up Error', authError.message)
        return
      }

      if (authData.user) {
        if (!authData.session) {
          Alert.alert(
            'Check Your Email',
            'Please check your email for a confirmation link to complete your registration.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/sign-in')
              }
            ]
          )
        } else {
          await createUserProfile(authData.user.id)
        }
      }
    } catch (error) {
      console.error('Sign up error:', error)
      Alert.alert('Error', 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const createUserProfile = async (userId: string) => {
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            full_name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            created_at: new Date().toISOString(),
          }
        ])

      if (profileError) {
        console.error('Profile creation error:', profileError)
      }

      Alert.alert(
        'Success',
        'Account created successfully! Welcome!',
        [
          {
            text: 'Get Started',
            onPress: () => router.replace('/(tabs)/home')
          }
        ]
      )
    } catch (error) {
      console.error('Profile creation error:', error)
      router.replace('/(tabs)/home')
    }
  }

  return (
    <ScrollView className='flex-1 bg-white'>
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image source={images.baobaoAuth} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Create Your Account
          </Text>
        </View>

        <View className="p-5">
          <InputField
            label="Full Name"
            placeholder="Enter your full name"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) => setForm({ ...form, name: value })}
          />

          <InputField
            label="Email"
            placeholder="Enter your email"
            icon={icons.email}
            textContentType="emailAddress"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />

          <InputField
            label="Password"
            placeholder="Enter password (min. 6 characters)"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="newPassword"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />

          <CustomButton
            title={loading ? "Creating Account..." : "Sign Up"}
            onPress={onSignUpPress}
            className="mt-6"
            disabled={loading}
          />

          <OAuth />

          <Link
            href="/sign-in"
            className="text-lg text-center text-general-200 mt-10"
          >
            Already have an account?{" "}
            <Text className="text-primary-500">Log In</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  )
}