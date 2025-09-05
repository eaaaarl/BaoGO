import { useAppSelector } from '@/libs/redux/hooks';
import { router, Stack } from 'expo-router';
import React, { useEffect } from 'react';

export default function Layout() {
  const { user, isInitialized } = useAppSelector((state) => state.auth);
  useEffect(() => {
    if (isInitialized && user) {
      router.replace('/(tabs)');
    }
  }, [user, isInitialized]);
  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
    </Stack>
  )
}