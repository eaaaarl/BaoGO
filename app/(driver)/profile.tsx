import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Profile() {
  const insets = useSafeAreaInsets();

  // Mock driver data
  const driver = {
    name: 'Earl Dominic',
    email: 'earl.driver@email.com',
    phone: '+63 912 345 6789',
    vehicle: 'Toyota Vios 2020',
    plateNumber: 'ABC 1234',
    joinedDate: 'January 2024'
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
          onPress: () => {
            // Handle logout logic here
            console.log('Logging out...');
            // router.replace('/(auth)/sign-in');
          }
        }
      ]
    );
  };

  const ProfileRow = ({ icon, title, value, onPress, showArrow = false, danger = false }: { icon: string, title: string, value: string, onPress: () => void, showArrow: boolean, danger: boolean }) => (
    <TouchableOpacity
      className={`bg-white px-4 py-4 flex-row items-center ${onPress ? '' : 'opacity-100'}`}
      onPress={onPress}
      disabled={!onPress}
    >
      <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${danger ? 'bg-red-100' : 'bg-gray-100'}`}>
        <Ionicons name={icon as any} size={20} color={danger ? '#EF4444' : '#6B7280'} />
      </View>
      <View className="flex-1">
        <Text className={`font-medium ${danger ? 'text-red-600' : 'text-gray-800'}`}>{title}</Text>
        {value && <Text className="text-sm text-gray-500 mt-1">{value}</Text>}
      </View>
      {showArrow && <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingBottom: insets.bottom }}
    >
      {/* Header */}
      <View
        className="bg-white px-4 pt-4 pb-6 border-b border-gray-100"
        style={{ paddingTop: insets.top + 16 }}
      >
        <Text className="text-2xl font-semibold text-gray-900">Profile</Text>
      </View>

      {/* Driver Info Card */}
      <View className="px-4 pt-4 mb-4">
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <View className="items-center mb-4">
            <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-3">
              <Ionicons name="person" size={40} color="#0286FF" />
            </View>
            <Text className="text-xl font-semibold text-gray-800">{driver.name}</Text>
            <Text className="text-sm text-gray-500">Driver since {driver.joinedDate}</Text>
          </View>

          <View className="border-t border-gray-100 pt-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm text-gray-500">Email</Text>
              <Text className="text-sm text-gray-800">{driver.email}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm text-gray-500">Phone</Text>
              <Text className="text-sm text-gray-800">{driver.phone}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm text-gray-500">Vehicle</Text>
              <Text className="text-sm text-gray-800">{driver.vehicle}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-500">Plate Number</Text>
              <Text className="text-sm text-gray-800">{driver.plateNumber}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Menu Options */}
      <View className="px-4">
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <ProfileRow
            icon="person-outline"
            title="Edit Profile"
            onPress={() => Alert.alert('Edit Profile', 'Feature coming soon!')}
            showArrow
            value=""
            danger={false}
          />
          <View className="h-px bg-gray-100 ml-14" />

          <ProfileRow
            icon="car-outline"
            title="Vehicle Details"
            onPress={() => Alert.alert('Vehicle Details', 'Feature coming soon!')}
            showArrow
            value=""
            danger={false}
          />
          <View className="h-px bg-gray-100 ml-14" />

          <ProfileRow
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
          />
        </View>
      </View>

      {/* Support Section */}
      <View className="px-4 mt-4">
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <ProfileRow
            icon="help-circle-outline"
            title="Help & Support"
            onPress={() => Alert.alert('Help & Support', 'Contact: support@app.com')}
            showArrow
            value=""
            danger={false}
          />
          <View className="h-px bg-gray-100 ml-14" />

          <ProfileRow
            icon="information-circle-outline"
            title="About"
            onPress={() => Alert.alert('About', 'BaoBao Driver App v1.0\nSoftware Engineering Project')}
            showArrow
            value=""
            danger={false}
          />
        </View>
      </View>

      {/* Logout Button */}
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