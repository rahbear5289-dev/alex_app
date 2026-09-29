import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useProfile } from '../../context/ProfileContext';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme';

const BOARDS = ['Maharashtra State Board'];

const STANDARDS = [
  { label: 'Nursery', value: 'Nursery', group: 'Pre-Primary' },
  { label: 'LKG', value: 'LKG', group: 'Pre-Primary' },
  { label: 'UKG', value: 'UKG', group: 'Pre-Primary' },
  { label: 'Std 1', value: '1', group: 'Primary' },
  { label: 'Std 2', value: '2', group: 'Primary' },
  { label: 'Std 3', value: '3', group: 'Primary' },
  { label: 'Std 4', value: '4', group: 'Primary' },
  { label: 'Std 5', value: '5', group: 'Primary' },
  { label: 'Std 6', value: '6', group: 'Secondary' },
  { label: 'Std 7', value: '7', group: 'Secondary' },
  { label: 'Std 8', value: '8', group: 'Secondary' },
  { label: 'Std 9', value: '9', group: 'Secondary' },
  { label: 'Std 10', value: '10', group: 'Secondary' },
  { label: 'Std 11', value: '11', group: 'Sr. Secondary' },
  { label: 'Std 12', value: '12', group: 'Sr. Secondary' },
];

const STREAMS = ['Science', 'Commerce', 'Arts'] as const;
type Stream = typeof STREAMS[number];

const groups = ['Pre-Primary', 'Primary', 'Secondary', 'Sr. Secondary'];

export default function ProfileSelection() {
  const { setProfile } = useProfile();
  const [selectedBoard, setSelectedBoard] = useState('Maharashtra State Board');
  const [selectedStandard, setSelectedStandard] = useState('');
  const [selectedStream, setSelectedStream] = useState<Stream | ''>('');
  const [saving, setSaving] = useState(false);

  const needsStream = selectedStandard === '11' || selectedStandard === '12';

  const isValid =
    !!selectedStandard && (!needsStream || !!selectedStream);

  const handleConfirm = async () => {
    if (!isValid) {
      Alert.alert('Incomplete', needsStream ? 'Please select your stream.' : 'Please select your class/standard.');
      return;
    }
    setSaving(true);
    await setProfile({
      board: selectedBoard,
      standard: selectedStandard,
      stream: needsStream ? (selectedStream as Stream) : undefined,
    });
    setSaving(false);
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>A</Text>
        </View>
        <Text style={styles.headerTitle}>Tell us about yourself</Text>
        <Text style={styles.headerSubtitle}>
          We'll personalize your content based on your class and board.
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Board Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>📋 Board</Text>
          {BOARDS.map((board) => (
            <TouchableOpacity
              key={board}
              style={[styles.boardCard, selectedBoard === board && styles.boardCardSelected]}
              onPress={() => setSelectedBoard(board)}
              activeOpacity={0.8}
            >
              <View style={[styles.radioOuter, selectedBoard === board && styles.radioOuterSelected]}>
                {selectedBoard === board && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.boardText, selectedBoard === board && styles.boardTextSelected]}>
                {board}
              </Text>
              {selectedBoard === board && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>Selected</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Class Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>🎓 Class / Standard</Text>
          {groups.map((group) => (
            <View key={group} style={styles.groupBlock}>
              <Text style={styles.groupLabel}>{group}</Text>
              <View style={styles.gridRow}>
                {STANDARDS.filter((s) => s.group === group).map((std) => (
                  <TouchableOpacity
                    key={std.value}
                    style={[
                      styles.stdChip,
                      selectedStandard === std.value && styles.stdChipSelected,
                    ]}
                    onPress={() => {
                      setSelectedStandard(std.value);
                      setSelectedStream('');
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.stdChipText,
                        selectedStandard === std.value && styles.stdChipTextSelected,
                      ]}
                    >
                      {std.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Stream Selection — only for 11 & 12 */}
        {needsStream && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>🔬 Stream</Text>
            <View style={styles.streamRow}>
              {STREAMS.map((stream) => (
                <TouchableOpacity
                  key={stream}
                  style={[
                    styles.streamCard,
                    selectedStream === stream && styles.streamCardSelected,
                  ]}
                  onPress={() => setSelectedStream(stream)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.streamEmoji}>
                    {stream === 'Science' ? '⚗️' : stream === 'Commerce' ? '💹' : '🎨'}
                  </Text>
                  <Text
                    style={[
                      styles.streamText,
                      selectedStream === stream && styles.streamTextSelected,
                    ]}
                  >
                    {stream}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: Spacing.xxl * 2 }} />
      </ScrollView>

      {/* Sticky Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, !isValid && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!isValid || saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color={Colors.textOnPrimary} />
          ) : (
            <Text style={styles.confirmText}>
              Continue →
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.secondary,
    paddingTop: Spacing.xxl + Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Shadows.small,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoText: { color: Colors.textOnPrimary, fontSize: 22, fontWeight: '800' },
  headerTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.xs },
  headerSubtitle: { ...Typography.body2, color: Colors.textSecondary },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg },
  section: { marginBottom: Spacing.xl },
  sectionLabel: { ...Typography.h4, color: Colors.text, marginBottom: Spacing.md },
  boardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: Spacing.md,
    ...Shadows.small,
  },
  boardCardSelected: { borderColor: Colors.primary, backgroundColor: '#F1F8E9' },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: { borderColor: Colors.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary },
  boardText: { flex: 1, ...Typography.body1, color: Colors.textSecondary },
  boardTextSelected: { color: Colors.text, fontWeight: '600' },
  selectedBadge: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  selectedBadgeText: { color: Colors.textOnPrimary, fontSize: 11, fontWeight: '600' },
  groupBlock: { marginBottom: Spacing.md },
  groupLabel: { ...Typography.caption, color: Colors.textSecondary, fontWeight: '700', letterSpacing: 0.5, marginBottom: Spacing.sm, textTransform: 'uppercase' },
  gridRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  stdChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minWidth: 70,
    alignItems: 'center',
  },
  stdChipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stdChipText: { ...Typography.body2, color: Colors.text, fontWeight: '500' },
  stdChipTextSelected: { color: Colors.textOnPrimary, fontWeight: '700' },
  streamRow: { flexDirection: 'row', gap: Spacing.md },
  streamCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.small,
  },
  streamCardSelected: { borderColor: Colors.primary, backgroundColor: '#F1F8E9' },
  streamEmoji: { fontSize: 28 },
  streamText: { ...Typography.body2, color: Colors.textSecondary, fontWeight: '600' },
  streamTextSelected: { color: Colors.primary, fontWeight: '700' },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.secondary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: { backgroundColor: Colors.disabled },
  confirmText: { ...Typography.button, color: Colors.textOnPrimary, fontSize: 17 },
});
