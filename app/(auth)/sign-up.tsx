import CustomButton from '@/components/CustomButton'
import InputField from '@/components/InputFields'
import OAuth from '@/components/OAuth'
import { icons, images } from '@/constant/image'
import { useSignUpMutation } from '@/feature/auth/api/authApi'
import { Link, router } from 'expo-router'
import { useState } from 'react'
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SignUp() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  })

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

  // RTK QUERY
  const [signUp, { isLoading }] = useSignUpMutation();

  const onSignUpPress = async () => {
    if (!validateForm()) return;

    try {
      const result = await signUp({
        email: form.email,
        password: form.password,
        full_name: form.name
      }).unwrap();

      if (result) {
        Alert.alert('Success', 'Account created successfully!');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Sign Up Error', 'Something went wrong');
      }

    } catch (error) {
      Alert.alert('Sign Up Error', error as string);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1, backgroundColor: 'white' }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
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
                title={isLoading ? "Creating Account..." : "Sign Up"}
                onPress={onSignUpPress}
                className="mt-6"
                disabled={isLoading}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}