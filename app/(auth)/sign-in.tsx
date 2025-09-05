import { Link, router } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputFields";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constant/image";
import { useSignInMutation } from "@/feature/auth/api/authApi";

const SignIn = () => {

  const [form, setForm] = useState({
    email: "",
    password: "",
  });


  const [signIn, { isLoading }] = useSignInMutation();

  const onSignInPress = useCallback(async () => {
    try {
      await signIn({ email: form.email, password: form.password }).unwrap();
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Sign In Error', error as string);
    }
  }, [form.email, form.password, signIn]);

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image source={images.baobaoAuth} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl text-black font-semibold absolute bottom-5 left-5">
            Welcome 👋
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
            title="Sign In"
            onPress={onSignInPress}
            className="mt-6"
          />

          <OAuth />

          <Link
            href="/sign-up"
            className="text-lg text-center text-general-200 mt-10"
          >
            Don&apos;t have an account?{" "}
            <Text className="text-primary-500">Sign Up</Text>
          </Link>
        </View>

        {/* Loading Overlay */}
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