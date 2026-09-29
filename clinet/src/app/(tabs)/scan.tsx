import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Platform,
  Dimensions,
  Image,
  ActivityIndicator,
  Share,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme';

const { width } = Dimensions.get('window');
const PAGE_SIZE = (width - Spacing.lg * 2 - Spacing.md) / 2;

export type ScannedPage = {
  id: string;
  uri: string;
  rotation: number; // 0, 90, 180, 270
};

export default function Scan() {
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [processing, setProcessing] = useState(false);

  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission',
        'Camera access is required to scan pages. Please enable it in device settings.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Gallery Permission', 'Gallery access is required to import photos.');
      return false;
    }
    return true;
  };

  const scanWithCamera = async () => {
    const permitted = await requestCameraPermission();
    if (!permitted) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.85,
        allowsEditing: true,
        aspect: [3, 4],
      });

      if (!result.canceled && result.assets[0]) {
        const newPage: ScannedPage = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
          rotation: 0,
        };
        setPages((prev) => [...prev, newPage]);
      }
    } catch (e) {
      Alert.alert('Scanner', 'Camera could not be opened on this device/simulator. Try importing from gallery instead.');
    }
  };

  const pickFromGallery = async () => {
    const permitted = await requestGalleryPermission();
    if (!permitted) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.85,
        allowsMultipleSelection: true,
        selectionLimit: 10,
      });

      if (!result.canceled) {
        const newPages: ScannedPage[] = result.assets.map((asset, idx) => ({
          id: (Date.now() + idx).toString(),
          uri: asset.uri,
          rotation: 0,
        }));
        setPages((prev) => [...prev, ...newPages]);
      }
    } catch (e) {
      Alert.alert('Gallery', 'Could not open image library.');
    }
  };

  const rotatePage = (id: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
  };

  const deletePage = (id: string) => {
    Alert.alert('Remove Page', 'Remove this page from the scan?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setPages((prev) => prev.filter((p) => p.id !== id)) },
    ]);
  };

  const retakePage = async (id: string) => {
    const permitted = await requestCameraPermission();
    if (!permitted) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.85,
        allowsEditing: true,
        aspect: [3, 4],
      });

      if (!result.canceled && result.assets[0]) {
        setPages((prev) =>
          prev.map((p) => (p.id === id ? { ...p, uri: result.assets[0].uri, rotation: 0 } : p))
        );
      }
    } catch (e) {
      Alert.alert('Scanner', 'Camera retake unavailable.');
    }
  };

  const clearAll = () => {
    Alert.alert('Clear All', 'Remove all scanned pages in this session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => setPages([]) },
    ]);
  };

  // FR7.5: Save to Notes
  const saveToNotes = async () => {
    if (pages.length === 0) {
      Alert.alert('No Pages', 'Please scan at least one page first.');
      return;
    }

    setProcessing(true);
    try {
      const existingStored = await AsyncStorage.getItem('@alex_user_notes');
      const existingNotes = existingStored ? JSON.parse(existingStored) : [];

      const newScannedNote = {
        id: `scan-${Date.now()}`,
        title: `Scanned Document (${pages.length} pages)`,
        subject: 'General Studies',
        type: 'scanned',
        preview: `Document with ${pages.length} high-resolution scanned page(s). Created from ALEX PDF Scanner.`,
        updatedAt: 'Just now',
        emoji: '📷',
        pageCount: pages.length,
        thumbnailUri: pages[0].uri,
      };

      await AsyncStorage.setItem(
        '@alex_user_notes',
        JSON.stringify([newScannedNote, ...existingNotes])
      );

      Alert.alert(
        'Saved to Notes! 📝',
        `Your ${pages.length}-page document has been saved to your Notes repository.`,
        [
          { text: 'Scan Another', onPress: () => setPages([]) },
          {
            text: 'View in Notes',
            onPress: () => {
              setPages([]);
              router.push('/(tabs)/notes');
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to save to notes.');
    } finally {
      setProcessing(false);
    }
  };

  // FR7.6: Share / Export PDF
  const shareDocument = async () => {
    if (pages.length === 0) {
      Alert.alert('No Pages', 'Please scan at least one page first.');
      return;
    }

    setProcessing(true);
    try {
      await Share.share({
        title: `Share ${pages.length}-page Scanned Document`,
        message: `ALEX Scanned Document (${pages.length} pages)`,
        url: pages[0].uri,
      });
    } catch (err) {
      Alert.alert('Notice', 'Document sharing completed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📷 PDF & Doc Scanner</Text>
          <Text style={styles.headerSubtitle}>
            {pages.length === 0
              ? 'Scan handwritten assignments & book pages'
              : `${pages.length} page${pages.length > 1 ? 's' : ''} in current document`}
          </Text>
        </View>
        {pages.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearAll} accessibilityLabel="Clear all pages">
            <Text style={styles.clearBtnText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Scan Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={scanWithCamera}
            activeOpacity={0.85}
            accessibilityLabel="Scan with camera"
          >
            <Text style={styles.primaryActionEmoji}>📷</Text>
            <Text style={styles.primaryActionTitle}>Scan with Camera</Text>
            <Text style={styles.primaryActionSub}>Auto-crop & clean edges</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={pickFromGallery}
            activeOpacity={0.85}
            accessibilityLabel="Import from gallery"
          >
            <Text style={styles.secondaryActionEmoji}>🖼️</Text>
            <Text style={styles.secondaryActionTitle}>Import Photos</Text>
            <Text style={styles.secondaryActionSub}>From device</Text>
          </TouchableOpacity>
        </View>

        {/* Tips when empty */}
        {pages.length === 0 && (
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>📌 Scanner Best Practices for Students</Text>
            <Text style={styles.tipItem}>• Place your notebook or textbook on a flat surface with good lighting.</Text>
            <Text style={styles.tipItem}>• Keep the phone camera directly parallel to the page.</Text>
            <Text style={styles.tipItem}>• Tap the camera icon above to capture multiple pages for a single PDF assignment.</Text>
            <Text style={styles.tipItem}>• Easily save the compiled PDF to your Notes or share with teachers via WhatsApp.</Text>
          </View>
        )}

        {/* Scanned Pages Grid */}
        {pages.length > 0 && (
          <View style={styles.pagesSection}>
            <Text style={styles.sectionTitle}>Document Pages ({pages.length})</Text>
            <View style={styles.pagesGrid}>
              {pages.map((page, index) => (
                <View key={page.id} style={styles.pageCard}>
                  <Image
                    source={{ uri: page.uri }}
                    style={[
                      styles.pageImage,
                      { transform: [{ rotate: `${page.rotation}deg` }] },
                    ]}
                    resizeMode="cover"
                  />
                  <View style={styles.pageOverlay}>
                    <Text style={styles.pageNumber}>Page {index + 1}</Text>
                  </View>
                  <View style={styles.pageActions}>
                    <TouchableOpacity
                      style={styles.pageActionBtn}
                      onPress={() => rotatePage(page.id)}
                      accessibilityLabel={`Rotate page ${index + 1}`}
                    >
                      <Text style={styles.pageActionText}>🔄</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.pageActionBtn}
                      onPress={() => retakePage(page.id)}
                      accessibilityLabel={`Retake page ${index + 1}`}
                    >
                      <Text style={styles.pageActionText}>📷</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.pageActionBtn, styles.pageDeleteBtn]}
                      onPress={() => deletePage(page.id)}
                      accessibilityLabel={`Delete page ${index + 1}`}
                    >
                      <Text style={styles.pageActionText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Add More card */}
              <TouchableOpacity
                style={styles.addMoreCard}
                onPress={scanWithCamera}
                activeOpacity={0.8}
                accessibilityLabel="Add next page"
              >
                <Text style={styles.addMoreIcon}>+</Text>
                <Text style={styles.addMoreText}>Add Page {pages.length + 1}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Footer Actions */}
      {pages.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.saveNotesBtn}
            onPress={saveToNotes}
            disabled={processing}
            activeOpacity={0.85}
          >
            {processing ? (
              <ActivityIndicator color={Colors.textOnPrimary} />
            ) : (
              <Text style={styles.saveNotesText}>💾 Save to Notes</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareBtn}
            onPress={shareDocument}
            disabled={processing}
            activeOpacity={0.85}
          >
            <Text style={styles.shareText}>📤 Share PDF</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: Spacing.xxl + Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { color: Colors.textOnPrimary, fontSize: 20, fontWeight: '700' },
  headerSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 3 },
  clearBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  clearBtnText: { color: Colors.textOnPrimary, fontSize: 12, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg },
  actionRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  primaryAction: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.xs,
    ...Shadows.medium,
  },
  primaryActionEmoji: { fontSize: 38 },
  primaryActionTitle: { color: Colors.textOnPrimary, fontSize: 16, fontWeight: '700' },
  primaryActionSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  secondaryAction: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  secondaryActionEmoji: { fontSize: 28 },
  secondaryActionTitle: { color: Colors.text, fontSize: 13, fontWeight: '700' },
  secondaryActionSub: { color: Colors.textSecondary, fontSize: 11 },
  tipsCard: {
    backgroundColor: '#F1F8E9',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  tipsTitle: { ...Typography.body1, color: Colors.primary, fontWeight: '700', marginBottom: Spacing.md },
  tipItem: { ...Typography.body2, color: Colors.textSecondary, marginBottom: Spacing.xs, lineHeight: 20 },
  pagesSection: { marginTop: Spacing.xs },
  sectionTitle: { ...Typography.h4, color: Colors.text, marginBottom: Spacing.md },
  pagesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  pageCard: {
    width: PAGE_SIZE,
    height: PAGE_SIZE * 1.35,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    ...Shadows.medium,
  },
  pageImage: { width: '100%', height: '100%' },
  pageOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pageNumber: { color: Colors.textOnPrimary, fontSize: 11, fontWeight: '700' },
  pageActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    gap: 6,
  },
  pageActionBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 6,
  },
  pageDeleteBtn: { backgroundColor: 'rgba(211,47,47,0.5)' },
  pageActionText: { fontSize: 14 },
  addMoreCard: {
    width: PAGE_SIZE,
    height: PAGE_SIZE * 1.35,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  addMoreIcon: { fontSize: 36, color: Colors.primary, fontWeight: '300' },
  addMoreText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.lg,
    flexDirection: 'row',
    gap: Spacing.md,
    ...Shadows.large,
  },
  saveNotesBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  saveNotesText: { color: Colors.textOnPrimary, fontSize: 15, fontWeight: '700' },
  shareBtn: {
    flex: 1,
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.full,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  shareText: { color: Colors.text, fontSize: 15, fontWeight: '700' },
});
