import CustomButton from '@/components/CustomButton'
import InputField from '@/components/InputFields'
import OAuth from '@/components/OAuth'
import { icons, images } from '@/constant/image'
import { useSignUpMutation } from '@/feature/auth/api/authApi'
import { useAppSelector } from '@/libs/redux/hooks'
import { Link, router } from 'expo-router'
import { useState } from 'react'
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function SignUp() {
  const { userRole } = useAppSelector((state) => state.userRole)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  })

  const bottmInsets = useSafeAreaInsets()
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
    if (!userRole || (userRole !== 'Driver' && userRole !== 'Rider')) {
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
        full_name: form.name,
        user_role: userRole
      }).unwrap();


      if (userRole === 'Driver') {
        router.replace('/(driver)/home');
      } else if (userRole === 'Rider') {
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Success', 'Account created successfully!');
        router.replace(`/(auth)/sign-in`);
      }

    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert('Sign Up Error', error as string);
    }
  };

  const getRoleDisplayText = () => {
    if (userRole === 'Driver') return 'Driver';
    if (userRole === 'Rider') return 'Rider';
    return '';
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white', marginBottom: bottmInsets.bottom }}>
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
                href={`/(auth)/sign-in`}
                className="text-lg text-center text-general-200 mt-10"
              >
                Already have an account?{" "}
                <Text className="text-primary-500">Log In</Text>
              </Link>

              <Link
                href={`/(auth)/user-selection`}
                className="text-sm text-center text-gray-500 mt-4"
              >
                Want to sign up as a different role?{" "}
                <Text className="text-primary-500">Change Role</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}