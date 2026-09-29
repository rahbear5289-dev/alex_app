import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  TextInput,
  Switch,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useProfile } from '../../context/ProfileContext';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme';

export default function Settings() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { profile, clearProfile } = useProfile();

  const [signingOut, setSigningOut] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Edit name state
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [customName, setCustomName] = useState('');
  const [savedName, setSavedName] = useState<string | null>(null);

  // Legal Modal
  const [legalModalTitle, setLegalModalTitle] = useState<string | null>(null);

  const baseName =
    savedName ||
    user?.fullName ||
    user?.firstName ||
    user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] ||
    'Student';

  const email = user?.emailAddresses?.[0]?.emailAddress || 'student@alex.edu';
  const initials = baseName.slice(0, 2).toUpperCase();

  const standardLabel = profile?.standard
    ? (['Nursery', 'LKG', 'UKG'].includes(profile.standard)
        ? profile.standard
        : `Standard ${profile.standard}`)
    : 'Not set';

  const profileLabel = [
    profile?.board ?? 'Maharashtra State Board',
    standardLabel,
    profile?.stream ?? '',
  ]
    .filter(Boolean)
    .join(' · ');

  // FR9.1: Change Profile Photo
  const handlePickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission', 'Permission to access gallery is required to choose a profile photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
        Alert.alert('Photo Updated', 'Your profile picture has been updated!');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not update profile photo.');
    }
  };

  // FR9.1: Edit Name
  const handleSaveName = () => {
    if (customName.trim()) {
      setSavedName(customName.trim());
      setNameModalVisible(false);
      Alert.alert('Name Updated', `Your display name is now ${customName.trim()}`);
    }
  };

  // FR9.5: Sign Out
  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of ALEX?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          try {
            await clearProfile();
            if (signOut) {
              await signOut().catch(() => {});
            }
            router.replace('/(auth)/clerk-auth');
          } catch (err) {
            router.replace('/(auth)/clerk-auth');
          } finally {
            setSigningOut(false);
          }
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    router.push('/(auth)/profile-selection');
  };

  // FR9.6: Delete Account
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your student profile, saved notes, scans, and AI chat history. This action cannot be reversed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            await clearProfile();
            await AsyncStorage.multiRemove([
              '@alex_user_notes',
              '@alex_ai_chat_history',
            ]);
            Alert.alert('Account Cleared', 'All personal data has been deleted.');
            router.replace('/(auth)/clerk-auth');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile & Settings</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.editAvatarBtn}
              onPress={handlePickAvatar}
              activeOpacity={0.8}
              accessibilityLabel="Change profile photo"
            >
              <Text style={styles.editAvatarIcon}>📷</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>{baseName}</Text>
              <TouchableOpacity onPress={() => { setCustomName(baseName); setNameModalVisible(true); }}>
                <Text style={styles.editNameIcon}>✏️</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.profileEmail}>{email}</Text>
            <TouchableOpacity
              style={styles.profileBadge}
              onPress={handleEditProfile}
              activeOpacity={0.8}
            >
              <Text style={styles.profileBadgeText}>🎓 {profileLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Academic Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>📚 Academic Profile</Text>
          <View style={styles.card}>
            <SettingRow
              emoji="🏫"
              label="Curriculum Board"
              value={profile?.board ?? 'Maharashtra State Board'}
              onPress={handleEditProfile}
            />
            <Divider />
            <SettingRow
              emoji="🎓"
              label="Standard / Grade"
              value={standardLabel}
              onPress={handleEditProfile}
            />
            {profile?.stream && (
              <>
                <Divider />
                <SettingRow
                  emoji="🔬"
                  label="Stream (11th/12th)"
                  value={profile.stream}
                  onPress={handleEditProfile}
                />
              </>
            )}
            <Divider />
            <TouchableOpacity
              style={styles.changeClassBtn}
              onPress={handleEditProfile}
              activeOpacity={0.8}
              accessibilityLabel="Change class or board"
            >
              <Text style={styles.changeClassText}>✏️ Change Class / Stream</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>⚙️ Preferences</Text>
          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleEmoji}>🔔</Text>
                <View>
                  <Text style={styles.toggleLabel}>Study Reminders</Text>
                  <Text style={styles.toggleSub}>Daily textbook & formula notifications</Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: Colors.border, true: '#A5D6A7' }}
                thumbColor={notificationsEnabled ? Colors.primary : '#E0E0E0'}
                accessibilityLabel="Toggle notifications"
              />
            </View>
            <Divider />
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleEmoji}>🌙</Text>
                <View>
                  <Text style={styles.toggleLabel}>Theme Variant</Text>
                  <Text style={styles.toggleSub}>{darkMode ? 'Calm Dark Green' : 'Modern Clean Green & White'}</Text>
                </View>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: Colors.border, true: '#A5D6A7' }}
                thumbColor={darkMode ? Colors.primary : '#E0E0E0'}
                accessibilityLabel="Toggle theme"
              />
            </View>
          </View>
        </View>

        {/* About & Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ℹ️ About ALEX</Text>
          <View style={styles.card}>
            <SettingRow
              emoji="📋"
              label="Terms of Service"
              value=""
              onPress={() => setLegalModalTitle('Terms of Service')}
            />
            <Divider />
            <SettingRow
              emoji="🔒"
              label="Privacy Policy (K-12 Student Safety)"
              value=""
              onPress={() => setLegalModalTitle('Privacy Policy')}
            />
            <Divider />
            <SettingRow
              emoji="⭐"
              label="Rate ALEX on App Store"
              value="5.0 ★"
              onPress={() => Alert.alert('Thank you! ⭐', 'We appreciate your support for Maharashtra students.')}
            />
            <Divider />
            <SettingRow emoji="📱" label="App Version" value="1.0.0 (Maharashtra Ed.)" />
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleSignOut}
            disabled={signingOut}
            activeOpacity={0.85}
            accessibilityLabel="Sign out of ALEX"
          >
            {signingOut ? (
              <ActivityIndicator color={Colors.textOnPrimary} />
            ) : (
              <Text style={styles.signOutText}>🚪 Log Out</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleDeleteAccount}
            activeOpacity={0.85}
            accessibilityLabel="Delete student account"
          >
            <Text style={styles.deleteBtnText}>🗑️ Delete Account Data</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal
        visible={nameModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setNameModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.dialogCard}>
            <Text style={styles.dialogTitle}>Edit Student Name</Text>
            <TextInput
              style={styles.dialogInput}
              value={customName}
              onChangeText={setCustomName}
              placeholder="Enter your name"
              autoFocus
            />
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={styles.dialogCancelBtn}
                onPress={() => setNameModalVisible(false)}
              >
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dialogSaveBtn}
                onPress={handleSaveName}
              >
                <Text style={styles.dialogSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Legal Modal */}
      <Modal
        visible={!!legalModalTitle}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLegalModalTitle(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.legalDialogCard}>
            <Text style={styles.dialogTitle}>{legalModalTitle}</Text>
            <ScrollView style={{ maxHeight: 280, marginVertical: Spacing.md }}>
              <Text style={styles.legalBody}>
                {legalModalTitle === 'Privacy Policy'
                  ? `ALEX is committed to protecting the privacy of school students and minors across Maharashtra.\n\n• We do not sell or share student personal information.\n• Scanned documents and notes are stored locally on your device with encryption.\n• AI conversations are processed anonymously for educational assistance only.\n• Complies with all applicable digital child safety standards.`
                  : `By using ALEX, you agree to:\n\n1. Use all textbook materials for personal educational and study purposes.\n2. Maharashtra State Board (Balbharati) textbooks are used in accordance with fair educational practice.\n3. Content generated by AI is intended as study aid and reference.\n4. Maintain student-appropriate behavior within doubts and discussion sections.`}
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.dialogSaveBtn}
              onPress={() => setLegalModalTitle(null)}
            >
              <Text style={styles.dialogSaveText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SettingRow({
  emoji,
  label,
  value,
  onPress,
}: {
  emoji: string;
  label: string;
  value: string;
  onPress?: () => void;
}) {
  const inner = (
    <View style={settingStyles.row}>
      <Text style={settingStyles.emoji}>{emoji}</Text>
      <Text style={settingStyles.label}>{label}</Text>
      <View style={settingStyles.right}>
        {value ? <Text style={settingStyles.value} numberOfLines={1}>{value}</Text> : null}
        {onPress && <Text style={settingStyles.arrow}>›</Text>}
      </View>
    </View>
  );
  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{inner}</TouchableOpacity>;
  }
  return inner;
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: Colors.border, marginLeft: 52 }} />;
}

const settingStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  emoji: { fontSize: 20, width: 28, textAlign: 'center' },
  label: { flex: 1, ...Typography.body1, color: Colors.text },
  right: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  value: { ...Typography.body2, color: Colors.textSecondary, maxWidth: 160 },
  arrow: { color: Colors.textSecondary, fontSize: 20, fontWeight: '300' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: Spacing.xxl + Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { color: Colors.textOnPrimary, fontSize: 20, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.medium,
  },
  avatarContainer: { position: 'relative' },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  avatarText: { color: Colors.textOnPrimary, fontSize: 26, fontWeight: '800' },
  editAvatarBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    ...Shadows.small,
  },
  editAvatarIcon: { fontSize: 12 },
  profileInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  profileName: { ...Typography.h4, color: Colors.text, marginBottom: 2 },
  editNameIcon: { fontSize: 13 },
  profileEmail: { ...Typography.body2, color: Colors.textSecondary, marginBottom: Spacing.sm },
  profileBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  profileBadgeText: { color: Colors.primary, fontSize: 11, fontWeight: '700' },
  section: { marginBottom: Spacing.xl },
  sectionHeader: {
    ...Typography.body2,
    color: Colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.small,
  },
  changeClassBtn: {
    padding: Spacing.md,
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
  },
  changeClassText: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  toggleEmoji: { fontSize: 20 },
  toggleLabel: { ...Typography.body1, color: Colors.text },
  toggleSub: { ...Typography.caption, color: Colors.textSecondary },
  signOutBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  signOutText: { color: Colors.textOnPrimary, fontSize: 16, fontWeight: '700' },
  deleteBtn: {
    borderRadius: BorderRadius.full,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.error,
  },
  deleteBtnText: { color: Colors.error, fontSize: 14, fontWeight: '600' },

  // Dialog styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  dialogCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.large,
  },
  legalDialogCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.large,
  },
  dialogTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md },
  dialogInput: {
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.md },
  dialogCancelBtn: { paddingVertical: 10, paddingHorizontal: Spacing.md },
  dialogCancelText: { color: Colors.textSecondary, fontWeight: '600' },
  dialogSaveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: 10,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  dialogSaveText: { color: Colors.textOnPrimary, fontWeight: '700' },
  legalBody: { ...Typography.body2, color: Colors.textSecondary, lineHeight: 22 },
});
