import { useGetProfileUserQuery, useSignOutMutation } from '@/feature/auth/api/authApi';
import { useGetDriverProfileQuery } from '@/feature/driver/api/driverApi';
import ProfileRow from '@/feature/driver/components/ProfileRow';
import { useAppSelector } from '@/libs/redux/hooks';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Profile() {
  const insets = useSafeAreaInsets();
  const { user } = useAppSelector((state) => state.auth);
  const [signOut] = useSignOutMutation();

  const { data: profileUser } = useGetProfileUserQuery(user?.id as string);
  const { data: driverProfile } = useGetDriverProfileQuery({ id: user?.id as string });

  const driver = {
    name: profileUser?.full_name,
    email: user?.email,
    joinedDate: profileUser?.created_at.split('T')[0],
    vehicle: driverProfile?.vehicle_type,
    plateNumber: driverProfile?.license_number,
    phone: user?.user_metadata.phone,
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await signOut({});
            router.replace('/(auth)/welcome');
          }
        }
      ]
    );
  };


  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View
        className="bg-white px-4 pt-4 pb-6 border-b border-gray-100"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-2xl font-semibold text-gray-900">Profile</Text>
      </View>

      <View className="px-4 pt-4 mb-4">
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <View className="items-center mb-4">
            <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-3">
              <Ionicons name="person" size={40} color="#0286FF" />
            </View>
            <Text className="text-xl font-semibold text-gray-800">{driver.name?.toUpperCase() || 'N/A'}</Text>
            <Text className="text-sm text-gray-500 font-semibold">Driver since {driver.joinedDate}</Text>
          </View>

          <View className="border-t border-gray-100 pt-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm text-gray-500 font-semibold">Email</Text>
              <Text className="text-sm text-gray-800 font-semibold">{driver.email || 'N/A'}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm text-gray-500 font-semibold">Phone</Text>
              <Text className="text-sm text-gray-800 font-semibold">{driver.phone}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm text-gray-500 font-semibold">Vehicle</Text>
              <Text className="text-sm text-gray-800 font-semibold">{driver.vehicle}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-500 font-semibold">Plate Number</Text>
              <Text className="text-sm text-gray-800 font-semibold">{driver.plateNumber}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="px-4">
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <ProfileRow
            icon="person-outline"
            title="Edit Profile"
            onPress={() => router.push('/(driver)/edit-profile')}
            showArrow
            value=""
            danger={false}
          />
          <View className="h-px bg-gray-100 ml-14" />

          <ProfileRow
            icon="car-outline"
            title="Vehicle Details"
            onPress={() => router.push('/(driver)/vehicle-details')}
            showArrow
            value=""
            danger={false}
          />
          <View className="h-px bg-gray-100 ml-14" />

          {/* <ProfileRow
            icon="document-text-outline"
            title="Documents"
            onPress={() => Alert.alert('Documents', 'Feature coming soon!')}
            showArrow
            value=""
            danger={false}
          />
          <View className="h-px bg-gray-100 ml-14" />

          <ProfileRow
            icon="settings-outline"
            title="Settings"
            onPress={() => Alert.alert('Settings', 'Feature coming soon!')}
            showArrow
            value=""
            danger={false}
          /> */}

        </View>
      </View>

      <View className="px-4 mt-4">
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <ProfileRow
            icon="help-circle-outline"
            title="Help & Support"
            onPress={() => Alert.alert('Help & Support', 'Contact: support@baogo.com')}
            showArrow
            value=""
            danger={false}
          />
          <View className="h-px bg-gray-100 ml-14" />

          <ProfileRow
            icon="information-circle-outline"
            title="About"
            onPress={() => Alert.alert('About', 'BaoGO App v1.0\n\nCreated by Earl Dominic V. Ado')}
            showArrow
            value=""
            danger={false}
          />
        </View>
      </View>

      <View className="px-4 mt-4">
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <ProfileRow
            icon="log-out-outline"
            title="Logout"
            onPress={handleLogout}
            danger
            value=""
            showArrow={false}
          />
        </View>
      </View>
    </ScrollView>
  );
}