import React from 'react';
import { ClerkProvider as ClerkProviderOriginal } from '@clerk/clerk-expo';
import Constants from 'expo-constants';

const publishableKey = Constants.expoConfig?.extra?.clerkPublishableKey || process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  console.warn('Clerk publishable key not found. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your environment or app.config.js');
}

export const ClerkProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProviderOriginal publishableKey={publishableKey || ''}>
      {children}
    </ClerkProviderOriginal>
  );
};