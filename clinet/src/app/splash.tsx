import React, { useEffect, useRef } from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '@clerk/clerk-expo';
import { useProfile } from '../context/ProfileContext';
import { Colors, Spacing, Typography, Shadows } from '../constants/theme';

export default function Splash() {
  const { isLoaded, isSignedIn } = useAuth();
  const { isProfileComplete, loading: profileLoading } = useProfile();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    const checkAndNavigate = async () => {
      // Keep splash visible for minimum 1.8 seconds per PRD requirement (1.5-2.5s)
      await new Promise((resolve) => setTimeout(resolve, 1800));

      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        // Native splash may already be hidden
      }

      // Check auth and profile state
      if (isSignedIn && isProfileComplete) {
        router.replace('/(tabs)/home');
      } else if (isSignedIn && !isProfileComplete) {
        router.replace('/(auth)/profile-selection');
      } else {
        router.replace('/(auth)/onboarding');
      }
    };

    if (isLoaded && !profileLoading) {
      checkAndNavigate();
    }
  }, [isLoaded, isSignedIn, isProfileComplete, profileLoading]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoCard}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.appName}>ALEX</Text>
        <Text style={styles.tagline}>Maharashtra State Board · Learning Companion</Text>

        <ActivityIndicator
          size="small"
          color={Colors.primary}
          style={{ marginTop: Spacing.xl }}
        />
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Grade Nursery – 12th (Science · Commerce · Arts)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCard: {
    width: 110,
    height: 110,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 18,
  },
  appName: {
    ...Typography.h1,
    color: Colors.primary,
    letterSpacing: 4,
    fontWeight: '900',
    marginBottom: Spacing.xs,
  },
  tagline: {
    ...Typography.body2,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: Spacing.xl,
  },
  footerText: {
    ...Typography.caption,
    color: Colors.placeholder,
    textAlign: 'center',
  },
});