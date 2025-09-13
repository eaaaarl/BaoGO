import CustomButton from '@/components/CustomButton';
import InputField from '@/components/InputFields';
import { useGetProfileUserQuery } from '@/feature/auth/api/authApi';
import { useGetDriverProfileQuery, useUpdateDriverProfileMutation } from '@/feature/driver/api/driverApi';
import { UpdateDriverProfilePayload } from '@/feature/driver/api/interface';
import { useAppSelector } from '@/libs/redux/hooks';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditProfile() {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({
    id: '',
    name: '',
    phone: '',
    vehicleType: '',
    vehicleModel: '',
    vehicleColor: '',
    vehiclePlateNumber: '',
    vehicleYear: '',
  });

  const { user } = useAppSelector((state) => state.auth);
  const { data: profile } = useGetProfileUserQuery(user?.id as string);
  const { data: driverProfile } = useGetDriverProfileQuery({ id: user?.id as string }, {
    skip: !user?.id,
  });
  const [updateDriverProfile, { isLoading }] = useUpdateDriverProfileMutation();

  useEffect(() => {
    if (user) {
      setForm({
        id: user?.id as string,
        name: profile?.full_name || '',
        phone: user.user_metadata.phone || '',
        vehicleType: driverProfile?.vehicle_type || '',
        vehicleModel: driverProfile?.vehicle_model || '',
        vehicleColor: driverProfile?.vehicle_color || '',
        vehiclePlateNumber: driverProfile?.license_number || '',
        vehicleYear: driverProfile?.vehicle_year ? String(driverProfile.vehicle_year) : '',
      });
    }
  }, [profile, driverProfile, user]);

  const handleUpdateUserProfile = async () => {
    try {
      const payload: UpdateDriverProfilePayload = {
        id: form.id,
        full_name: form.name,
        phone: form.phone,
        vehicle_type: form.vehicleType,
        vehicle_model: form.vehicleModel,
        vehicle_color: form.vehicleColor,
        vehicle_plate_number: form.vehiclePlateNumber,
        vehicle_year: form.vehicleYear,
      };
      const result = await updateDriverProfile(payload);

      if (result.error) {
        console.log('result.error', result.error);
      }

      router.replace('/(driver)/profile');
    } catch (error) {
      console.log('error', error);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom }}
      keyboardShouldPersistTaps="handled"
    >
      <View
        className="flex-row items-center gap-2 bg-white px-4 pt-4 pb-6 border-b border-gray-100"
        style={{ paddingTop: insets.top }}
      >
        <TouchableOpacity
          className="p-2 rounded-full bg-gray-100"
          onPress={() => router.replace('/(driver)/profile')}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-semibold text-gray-900">Edit Profile</Text>
      </View>

      <View className="px-4 pt-4 mb-4 gap-4">
        {/* Avatar */}
        <View className="items-center justify-center">
          <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-3">
            <Ionicons name="person" size={40} color="black" />
          </View>
        </View>

        {/* User Info */}
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <Text className="text-sm text-gray-500 mb-2">User Information</Text>

          <InputField
            label="Full name"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
            placeholder="Enter your full name"
          />

          <InputField
            label="Phone Number"
            value={form.phone}
            onChangeText={(text) => setForm({ ...form, phone: text })}
            placeholder="Enter your phone number"
          />

          <InputField label="Email" value={profile?.email} editable={false} />
        </View>

        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <Text className="text-sm text-gray-500 mb-2">Vehicle Information</Text>

          <InputField
            label="Vehicle Type"
            value={form.vehicleType}
            onChangeText={(text) => setForm({ ...form, vehicleType: text })}
            placeholder="Enter your vehicle type"
          />

          <InputField
            label="License Plate Number"
            value={form.vehiclePlateNumber}
            onChangeText={(text) =>
              setForm({ ...form, vehiclePlateNumber: text })
            }
            placeholder="Enter your license plate number"
          />

          <InputField
            label="Vehicle Color"
            value={form.vehicleColor}
            onChangeText={(text) => setForm({ ...form, vehicleColor: text })}
            placeholder="Enter your vehicle color"
          />

          <InputField
            label="Vehicle Year"
            value={form.vehicleYear}
            onChangeText={(text) => setForm({ ...form, vehicleYear: text })}
            placeholder="Enter your vehicle year"
          />
        </View>

        <CustomButton
          title={isLoading ? 'Saving...' : 'Save Changes'}
          onPress={handleUpdateUserProfile}
          disabled={isLoading}
        />
      </View>
    </ScrollView>
  );
}
