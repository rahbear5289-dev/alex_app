import React from 'react';
import { Stack } from 'expo-router';
import { ClerkProvider } from '../providers/ClerkProvider';
import { ProfileProvider } from '../context/ProfileContext';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the native splash screen from auto-hiding prematurely
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <ClerkProvider>
      <ProfileProvider>
        <RootStack />
      </ProfileProvider>
    </ClerkProvider>
  );
}

function RootStack() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="splash" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}