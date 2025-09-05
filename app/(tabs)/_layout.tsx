import { icons } from '@/constant/image';
import { useAppSelector } from '@/libs/redux/hooks';
import { router, Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, ImageSourcePropType, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TabIcon = ({
  source,
  focused,
}: {
  source: ImageSourcePropType;
  focused: boolean;
}) => (
  <View className="flex items-center justify-center">
    <View
      className={`flex items-center justify-center w-10 h-10 rounded-full ${focused ? "bg-blue-200" : "bg-gray-200"
        }`}
    >
      <Image
        source={source}
        tintColor={focused ? "#1976D2" : "#757575"}
        resizeMode="contain"
        className="w-6 h-6"
      />
    </View>
  </View>
);

export default function TabsLayout() {
  const { user, isInitialized } = useAppSelector((state) => state.auth);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace('/(auth)/sign-in');
    }
  }, [user, isInitialized]);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#F5F5F5',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: Platform.OS === 'android' ? 60 + insets.bottom : 90 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: '#1976D2',
        tabBarInactiveTintColor: '#616161',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.home} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="recent"
        options={{
          title: 'Recent',
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.ride} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="Chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.chat} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.profile} focused={focused} />
          ),
        }}
      />
    </Tabs>
  )
}