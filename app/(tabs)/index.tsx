import { useAppSelector } from '@/libs/redux/hooks';
import React from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <SafeAreaView>
      <Text>Home {user?.email}</Text>
    </SafeAreaView>
  )
}