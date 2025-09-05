import { useAppSelector } from '@/libs/redux/hooks';
import { router, Tabs } from 'expo-router';
import React, { useEffect } from 'react';

export default function TabsLayout() {

  const { user, isInitialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace('/(auth)/sign-in');
    }
  }, [user, isInitialized]);

  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ headerShown: false }} />
      <Tabs.Screen name="recent" options={{ headerShown: false }} />
      <Tabs.Screen name="Chat" options={{ headerShown: false }} />
      <Tabs.Screen name="profile" options={{ headerShown: false }} />
    </Tabs>
  )
}