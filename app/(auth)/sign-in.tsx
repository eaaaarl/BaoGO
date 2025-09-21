import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputFields";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constant/image";
import { useSignInMutation } from "@/feature/auth/api/authApi";
import { useAppSelector } from "@/libs/redux/hooks";
import { Link, router } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, View } from "react-native";

const SignIn = () => {
  const { userRole } = useAppSelector((state) => state.userRole)
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [signIn, { isLoading }] = useSignInMutation();

  const validateForm = () => {
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
      Alert.alert(
        'Error',
        'Please select a valid role (Driver or Rider)',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Select Role',
            onPress: () => {
              router.replace('/(auth)/user-selection');
            }
          }
        ]
      )
      return false
    }
    return true
  }

  const onSignInPress = useCallback(async () => {
    if (!validateForm()) return;

    try {
      await signIn({
        email: form.email,
        password: form.password,
      }).unwrap();

      if (userRole === 'Driver') {
        router.replace('/(driver)/home');
      } else if (userRole === 'Rider') {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(auth)/user-selection');
      }

    } catch (error) {
      console.log(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.email, form.password, userRole, signIn]);

  const getRoleDisplayText = () => {
    if (userRole === 'Driver') return 'Driver';
    if (userRole === 'Rider') return 'Rider';
    return '';
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: 'white' }}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image source={images.baobaoAuth} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl text-black font-semibold absolute bottom-5 left-5">
            Welcome {getRoleDisplayText()} 👋
          </Text>
        </View>
        <View className="p-5">
          <InputField
            label="Email"
            placeholder="Enter email"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />
          <InputField
            label="Password"
            placeholder="Enter password"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />
          <CustomButton
            title={`Sign In as ${getRoleDisplayText()}`}
            onPress={onSignInPress}
            className="mt-6"
          />
          <OAuth />
          <View className="flex-row justify-center items-center mt-10">
            <Text className="text-lg text-general-200">Don&apos;t have an account? </Text>
            <Link
              href={`/(auth)/sign-up`}
              className=""
            >
              <Text className="text-lg text-primary-500 underline font-medium">Sign Up</Text>
            </Link>
          </View>
        </View>
        {isLoading && (
          <View className="absolute inset-0 bg-black/50 flex-1 justify-center items-center z-50">
            <View className="bg-white rounded-lg p-6 flex items-center">
              <ActivityIndicator size="large" color="#0286FF" />
              <Text className="text-lg font-semibold text-gray-800 mt-3">
                Signing In...
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default SignIn;