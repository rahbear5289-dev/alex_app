import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { useOAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useProfile } from '../../context/ProfileContext';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme';

WebBrowser.maybeCompleteAuthSession();

const { height } = Dimensions.get('window');

export default function ClerkAuth() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const { isProfileComplete } = useProfile();
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startAppleOAuth } = useOAuth({ strategy: 'oauth_apple' });

  const handlePostAuthNavigation = () => {
    if (isProfileComplete) {
      router.replace('/(tabs)/home');
    } else {
      router.replace('/(auth)/profile-selection');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      const { createdSessionId, setActive } = await startGoogleOAuth();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        handlePostAuthNavigation();
      }
    } catch (err: any) {
      if (!err?.message?.includes('cancelled')) {
        Alert.alert('Sign In Failed', err?.message ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setAppleLoading(true);
      const { createdSessionId, setActive } = await startAppleOAuth();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        handlePostAuthNavigation();
      }
    } catch (err: any) {
      if (!err?.message?.includes('cancelled')) {
        Alert.alert('Sign In Failed', err?.message ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setAppleLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    handlePostAuthNavigation();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.secondary} />

      {/* Top green wave */}
      <View style={styles.topWave} />

      {/* Logo section */}
      <View style={styles.logoSection}>
        <View style={styles.logoBadgeLarge}>
          <Text style={styles.logoTextLarge}>A</Text>
        </View>
        <Text style={styles.appName}>ALEX</Text>
        <Text style={styles.tagline}>Your Smart Study Companion</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Welcome!</Text>
        <Text style={styles.cardSubtitle}>
          Sign in to access your personalized study content for Maharashtra State Board.
        </Text>

        {/* Google Button */}
        <TouchableOpacity
          style={[styles.authBtn, styles.googleBtn]}
          onPress={handleGoogleLogin}
          disabled={googleLoading || appleLoading}
          activeOpacity={0.85}
          accessibilityLabel="Continue with Google"
        >
          {googleLoading ? (
            <ActivityIndicator color={Colors.text} />
          ) : (
            <>
              <View style={styles.iconBox}>
                <Text style={styles.googleIcon}>G</Text>
              </View>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Apple Button — shown on iOS */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={[styles.authBtn, styles.appleBtn]}
            onPress={handleAppleLogin}
            disabled={googleLoading || appleLoading}
            activeOpacity={0.85}
            accessibilityLabel="Continue with Apple"
          >
            {appleLoading ? (
              <ActivityIndicator color={Colors.textOnPrimary} />
            ) : (
              <>
                <View style={styles.iconBox}>
                  <Text style={styles.appleIcon}>🍎</Text>
                </View>
                <Text style={styles.appleBtnText}>Continue with Apple</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or preview app</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Demo / Guest Student button */}
        <TouchableOpacity
          style={styles.guestBtn}
          onPress={handleDemoSignIn}
          activeOpacity={0.8}
          accessibilityLabel="Continue as Guest Student"
        >
          <Text style={styles.guestBtnText}>🎒 Continue as Guest Student</Text>
        </TouchableOpacity>

        {/* Legal */}
        <Text style={styles.legalText}>
          By continuing, you agree to our{' '}
          <Text style={styles.legalLink}>Terms of Service</Text> and{' '}
          <Text style={styles.legalLink}>Privacy Policy</Text>.
        </Text>
      </View>

      {/* Bottom accent */}
      <View style={styles.bottomAccent}>
        <Text style={styles.bottomText}>Built for Maharashtra State Board Students 🎓</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topWave: {
    height: height * 0.28,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  logoSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xl,
  },
  logoBadgeLarge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  logoTextLarge: {
    color: Colors.primary,
    fontSize: 42,
    fontWeight: '900',
  },
  appName: {
    color: Colors.textOnPrimary,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 4,
    marginTop: Spacing.sm,
  },
  tagline: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '400',
  },
  card: {
    marginHorizontal: Spacing.lg,
    marginTop: -Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.xl,
    ...Shadows.large,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  authBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    minHeight: 54,
  },
  googleBtn: {
    backgroundColor: Colors.secondary,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  appleBtn: {
    backgroundColor: Colors.text,
  },
  iconBox: {
    width: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  appleIcon: {
    fontSize: 18,
  },
  appleBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textOnPrimary,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
    gap: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  guestBtn: {
    backgroundColor: '#F1F8E9',
    borderRadius: BorderRadius.full,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#C8E6C9',
    marginBottom: Spacing.md,
  },
  guestBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  legalText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  legalLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
  bottomAccent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: Spacing.xl,
  },
  bottomText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});
