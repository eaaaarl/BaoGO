import CustomButton from '@/components/CustomButton'
import InputField from '@/components/InputFields'
import OAuth from '@/components/OAuth'
import { icons, images } from '@/constant/image'
import { useSignUpMutation } from '@/feature/auth/api/authApi'
import { Link, router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SignUp() {
  const { role } = useLocalSearchParams()
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
    if (!role || (role !== 'driver' && role !== 'rider')) {
      Alert.alert('Error', 'Please select a valid role (Driver or Rider)')
      return false
    }
    return true
  }

  // RTK QUERY
  const [signUp, { isLoading }] = useSignUpMutation();

  const onSignUpPress = async () => {
    if (!validateForm()) return;

    try {

      await signUp({
        email: form.email,
        password: form.password,
        full_name: form.name
      }).unwrap();


      if (role === 'driver') {
        //router.replace('/(driver)/dashboard');
      } else if (role === 'rider') {
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Success', 'Account created successfully!');
        router.replace(`/sign-in?role=${role}`);
      }


    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert('Sign Up Error', error as string);
    }
  };

  const getRoleDisplayText = () => {
    if (role === 'driver') return 'Driver';
    if (role === 'rider') return 'Rider';
    return '';
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
              <Text className="text-2xl text-black font-semibold absolute bottom-5 left-5">
                Create Your {getRoleDisplayText()} Account
              </Text>
            </View>

            <View className="p-5">
              {role && (
                <View className="bg-blue-50 p-3 rounded-lg mb-4">
                  <Text className="text-sm text-blue-600 text-center">
                    Signing up as: <Text className="font-semibold">{getRoleDisplayText()}</Text>
                  </Text>
                </View>
              )}

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
                title={isLoading ? "Creating Account..." : `Create ${getRoleDisplayText()} Account`}
                onPress={onSignUpPress}
                className="mt-6"
                disabled={isLoading}
              />

              <OAuth />

              <Link
                href={{
                  pathname: '/sign-in',
                  params: { role: role }
                }}
                asChild
                className="text-lg text-center text-general-200 mt-10"
              >
                Already have an account?{" "}
                <Text className="text-primary-500">Log In</Text>
              </Link>

              <Link
                href={{
                  pathname: '/user-selection'
                }}
                asChild
                className="text-sm text-center text-gray-500 mt-4"
              >
                Want to sign up as a different role?{" "}
                <Text className="text-primary-500">Change Role</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}